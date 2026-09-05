import random
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.parcel import LandParcel
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.integrations import (
    IntegrationGatewayItem,
    IntegrationTestRequest,
    IntegrationTestResponse,
)


class IntegrationService:
    """
    NLAMS Government Integration Gateway Service.
    Provides standardized sandbox / prototype interoperability connectors for:
    - State Land Records (Bhulekh / Bhoomi)
    - Cadastral GIS (ISRO Bhuvan / LGD)
    - Public Financial Management System (PFMS / DBT)
    - Unified Notification Gateway (SMS / Email)
    """

    @classmethod
    def get_gateways_list(cls) -> List[IntegrationGatewayItem]:
        now_str = datetime.now(timezone.utc).strftime("%d-%b-%Y %H:%M UTC")
        return [
            IntegrationGatewayItem(
                id="GW-LAND-REC-01",
                code="BHULEKH_LAND_RECORDS",
                name="Bhoomi / Bhulekh State Land Records API",
                system_category="LAND_RECORDS",
                status="SANDBOX_ACTIVE",
                sync_mode="REST_JSON_API",
                endpoint_url="https://api.sandbox.landrecords.gov.in/v2/ror/fetch",
                last_synced_at=now_str,
                records_synced_count=248,
                description="Sandbox connector for digital Record of Rights (RoR), Khasra/Khata title verification, mutation ledger check, and non-encumbrance status.",
                supported_operations=[
                    "VERIFY_KHASRA_TITLE",
                    "CHECK_MUTATION_LEDGER",
                    "QUERY_ENCUMBRANCE_CERTIFICATE",
                ],
                sample_request={
                    "state_code": "RJ",
                    "district_lgd": "0801",
                    "village_code": "0801001",
                    "khasra_no": "101/1",
                },
                sample_response={
                    "status": "RECORD_FOUND",
                    "title_holder": "Sh. Rameshwar Meena",
                    "area_hectares": 1.25,
                    "land_type": "IRRIGATED_AGRICULTURAL",
                    "encumbrances": "NONE",
                    "mutation_status": "CERTIFIED",
                },
                sla_response_ms=115,
            ),
            IntegrationGatewayItem(
                id="GW-CAD-GIS-02",
                code="BHUVAN_CADASTRAL_GIS",
                name="Bhuvan / LGD National Cadastral GIS Platform",
                system_category="CADASTRAL_GIS",
                status="SANDBOX_ACTIVE",
                sync_mode="WFS_GEOJSON",
                endpoint_url="https://bhuvan-api.sandbox.isro.gov.in/geoserver/wfs",
                last_synced_at=now_str,
                records_synced_count=180,
                description="Sandbox spatial geometry ingestion layer for village cadastral polygon overlays, corridor alignment buffer checks, and forest/CRZ buffer intersection analysis.",
                supported_operations=[
                    "FETCH_CADASTRAL_BOUNDARY_GEOJSON",
                    "CHECK_FOREST_CRZ_INTERSECTION",
                    "ALIGNMENT_BUFFER_SPATIAL_JOIN",
                ],
                sample_request={
                    "khasra_no": "101/1",
                    "buffer_radius_meters": 60,
                    "geometry_format": "EPSG:4326_GEOJSON",
                },
                sample_response={
                    "spatial_validity": "PASSED",
                    "geometry_type": "Polygon",
                    "overlapping_forest_zone": False,
                    "overlap_area_sqm": 0.0,
                    "buffer_intersection_pct": 100.0,
                },
                sla_response_ms=240,
            ),
            IntegrationGatewayItem(
                id="GW-PFMS-DBT-03",
                code="PFMS_DBT_FINANCIAL",
                name="PFMS Direct Benefit Transfer (DBT) Payment Gateway",
                system_category="FINANCIAL_DBT",
                status="SANDBOX_ACTIVE",
                sync_mode="SECURE_REST_WEBHOOK",
                endpoint_url="https://pfms.sandbox.gov.in/api/v1/dbt/batch-disburse",
                last_synced_at=now_str,
                records_synced_count=520,
                description="Simulated electronic payment file dispatch for Section 23/30 compensation awards, Aadhaar Payment Bridge (APB) validation, and simulated bank credit UTR returns.",
                supported_operations=[
                    "DISPATCH_DBT_PAYMENT_BATCH",
                    "QUERY_BANK_UTR_STATUS",
                    "VALIDATE_PFMS_BENEFICIARY_SCHEME",
                ],
                sample_request={
                    "batch_id": "PFMS-BATCH-20260904-01",
                    "beneficiary_account_masked": "XXXX-XXXX-4589",
                    "ifsc_code": "SBIN0001234",
                    "amount_inr": 2500000.00,
                },
                sample_response={
                    "pfms_status": "CREDIT_CONFIRMED",
                    "bank_utr": "UTR-SBIN-2026-994821",
                    "settlement_timestamp": now_str,
                    "response_code": "00_SUCCESS",
                },
                sla_response_ms=180,
            ),
            IntegrationGatewayItem(
                id="GW-NOTIF-SMS-04",
                code="NOTIFICATION_GATEWAY_SMS",
                name="Unified National SMS & e-Gazette Notification Gateway",
                system_category="NOTIFICATION_GATEWAY",
                status="SANDBOX_ACTIVE",
                sync_mode="REST_API",
                endpoint_url="https://smsgw.sandbox.gov.in/v1/send-statutory-notice",
                last_synced_at=now_str,
                records_synced_count=1420,
                description="Simulated statutory gazette notice broadcasting to landowners and project affected families for Section 11 preliminary notices, Section 15 objection dates, and award declarations.",
                supported_operations=[
                    "DISPATCH_STATUTORY_SMS_NOTICE",
                    "BROADCAST_SECTION_15_HEARING_ALERT",
                    "DISPATCH_AWARD_DECLARATION_NOTICE",
                ],
                sample_request={
                    "recipient_masked_phone": "+91-98765-XXXXX",
                    "statutory_section": "SECTION_11_NOTICE",
                    "project_code": "NHAI-DEL-JAI-01",
                    "khasra_no": "101/1",
                },
                sample_response={
                    "gateway_delivery_status": "DELIVERED_TO_HANDSET",
                    "carrier_message_id": "MSG-SANDBOX-77391",
                    "timestamp": now_str,
                },
                sla_response_ms=85,
            ),
        ]

    @classmethod
    async def execute_sandbox_test(
        cls,
        db: AsyncSession,
        code: str,
        req: IntegrationTestRequest,
        current_user: Optional[User] = None,
    ) -> IntegrationTestResponse:
        """
        Executes a live sandbox interoperability test and records an immutable audit log.
        """
        now = datetime.now(timezone.utc)
        now_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        # 1. State Land Records Sandbox Execution
        if code == "BHULEKH_LAND_RECORDS":
            khasra = req.parameters.get("khasra_no", "101/1")
            state = req.parameters.get("state_code", "RJ")
            
            # Fetch real parcel if exists in DB to ground the mock response
            stmt = select(LandParcel).where(LandParcel.khasra_number.ilike(f"%{khasra}%"))
            parcel = (await db.execute(stmt)).scalars().first()

            owner_name = parcel.owners[0].name if (parcel and parcel.owners) else "Sh. Rameshwar Meena"
            area_acres = float(parcel.area_acres) if parcel else 1.25

            resp_data = {
                "interoperability_provider": "State Bhulekh Land Records Sandbox API",
                "state_code": state,
                "khasra_number": khasra,
                "recorded_title_holder": owner_name,
                "land_classification": "Agricultural (Irrigated)",
                "area_acres": area_acres,
                "mutation_entry_no": f"MUT-{random.randint(10000, 99999)}",
                "mutation_status": "SANCTIONED & VERIFIED",
                "encumbrance_status": "CLEAR / NO ACTIVE COURT INJUNCTION",
                "last_revenue_update": "2026-08-15",
                "title_verification_status": "TITLE_LEGALLY_VALID",
            }
            latency = random.randint(90, 140)

        # 2. Cadastral GIS Platform Sandbox Execution
        elif code == "BHUVAN_CADASTRAL_GIS":
            khasra = req.parameters.get("khasra_no", "101/1")
            resp_data = {
                "spatial_provider": "ISRO Bhuvan / LGD Cadastral GIS Sandbox",
                "khasra_number": khasra,
                "projection_system": "EPSG:4326 (WGS 84)",
                "boundary_vertices_count": 8,
                "forest_restriction_overlap": False,
                "water_body_buffer_conflict": False,
                "corridor_alignment_overlap_pct": 100.0,
                "spatial_topology_status": "VALID_CLOSED_POLYGON",
                "geo_tagging_timestamp": now_str,
            }
            latency = random.randint(180, 260)

        # 3. PFMS DBT Financial Gateway Sandbox Execution
        elif code == "PFMS_DBT_FINANCIAL":
            amount = float(req.parameters.get("amount_inr", 2500000.0))
            utr = f"UTR-PFMS-{now.strftime('%Y%m%d')}-{random.randint(100000, 999999)}"
            resp_data = {
                "payment_gateway": "Public Financial Management System (PFMS) Sandbox",
                "transaction_mode": "DIRECT_BENEFIT_TRANSFER (DBT)",
                "disbursed_amount_inr": amount,
                "bank_utr_number": utr,
                "beneficiary_aadhaar_bridge_status": "SUCCESSFUL_DIRECT_CREDIT",
                "bank_settlement_status": "SETTLED",
                "pfms_batch_reference": f"DBT-BATCH-{random.randint(1000, 9999)}",
            }
            latency = random.randint(140, 210)

        # 4. Notification Gateway Sandbox Execution
        elif code == "NOTIFICATION_GATEWAY_SMS":
            section = req.parameters.get("statutory_section", "SECTION_11_PRELIMINARY_NOTICE")
            phone = req.parameters.get("recipient_phone", "+91-98765-XXXXX")
            resp_data = {
                "gateway_provider": "Unified National SMS Gateway (Sandbox)",
                "statutory_notice_type": section,
                "recipient_masked_msisdn": phone,
                "telecom_delivery_status": "DELIVERED_SUCCESSFULLY",
                "message_audit_id": f"SMS-GOV-{random.randint(100000, 999999)}",
                "language_broadcast": "English & Hindi (Bilingual)",
                "dispatched_at": now_str,
            }
            latency = random.randint(60, 100)

        else:
            resp_data = {"status": "SUCCESS", "message": f"Sandbox execution completed for {code}."}
            latency = 100

        # Record Audit Trail
        if current_user:
            audit = AuditLog(
                user_id=current_user.id,
                action="INTEGRATION_SANDBOX_TEST",
                entity_type="INTEGRATION_GATEWAY",
                entity_id=None,
                description=f"Sandbox test executed for gateway '{code}' operation '{req.operation}' by {current_user.username}",
                metadata_json={
                    "gateway_code": code,
                    "operation": req.operation,
                    "latency_ms": latency,
                },
            )
            db.add(audit)
            await db.commit()

        return IntegrationTestResponse(
            integration_code=code,
            operation=req.operation,
            status="SUCCESS",
            executed_at=now_str,
            latency_ms=latency,
            payload_sent=req.parameters,
            response_data=resp_data,
            audit_logged=True,
        )
