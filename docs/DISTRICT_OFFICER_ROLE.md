# Phase 11D: District Officer / Competent Authority for Land Acquisition (CALA) Role Specification

## 1. Statutory Role & Mandate
The **District / CALA Officer** (`ROLE_DISTRICT_OFFICER`) represents the primary district-level operational authority in the National Land Acquisition Management System (NLAMS) under the RFCTLARR Act 2013 and National Highways Act 1956 (Sec 3G).

### Key Distinctions Across the 3 Implemented Roles
| Dimension | Central Officer (Phase 11B) | State Officer (Phase 11C) | District / CALA Officer (Phase 11D) |
|---|---|---|---|
| **Role Code** | `ROLE_CENTRAL_OFFICER` | `ROLE_STATE_OFFICER` | `ROLE_DISTRICT_OFFICER` |
| **Primary Question** | *"What is the national progress & macro risk?"* | *"How are my districts performing & where is state intervention needed?"* | *"What operational work must I complete today in my district?"* |
| **Jurisdiction Scope** | National (All States & UTs) | Single State (e.g., Rajasthan `IN-RJ`) | Single District (e.g., Jaipur `DST-JAI`) |
| **Primary Orientation** | Macro governance, cross-state benchmarking, national MIS | State supervision, district comparison, policy bottleneck resolution | Operational execution, field verification, Section 15 objections, compensation, awards, Section 38 possession |
| **Authority Scope** | National oversight & budget monitoring | State-level approvals (Sec 19) & district escalations | Direct statutory execution & panchnama vesting |

---

## 2. 14 District Statutory KPIs
The District Acquisition Control Center provides 14 real-time indicators:

1. **Active Projects**: Pipelines under active statutory acquisition in the district.
2. **Land Proposed**: Total land proposed across Section 4/11 Gazette notifications (Acres).
3. **Land Acquired**: Land where final awards have been declared and ownership transferred (Acres).
4. **Land Pending**: Remaining land pipeline requiring statutory completion (Acres).
5. **Parcels Pending Verification**: Khasras awaiting field ground truthing and drone cadastre validation.
6. **Objections Pending**: Section 15 landowner objection claims awaiting CALA hearing and determination.
7. **Compensation Pending**: Active valuation cases requiring market value multiplier and solatium determination.
8. **Awards Pending**: Section 23/30 statutory award declarations pending issuance.
9. **Disbursement Pending**: Direct Benefit Transfer (DBT) batches pending PFMS transmission.
10. **Possession Pending**: Land parcels awaiting Section 38 panchnama and state vesting.
11. **Affected Families**: Total Project Affected Families (PAFs) registered in the Social Impact Management register.
12. **R&R Pending**: Families requiring alternative homestead or subsistence grant settlement under the Second Schedule.
13. **Overdue Tasks**: Tasks that have exceeded statutory SLAs under state/central rules.
14. **High/Critical Risk Projects**: Pipelines flagged with active legal, physical, or financial bottlenecks.

---

## 3. Operational Workflows & Supervision
- **My Pending Actions / Work Queue**: Prioritizes assigned statutory duties (`OVERDUE` $\rightarrow$ `DUE SOON` $\rightarrow$ `NORMAL`).
- **Project Proposal Scrutiny**: Scrutinizes project proposals submitted by Project Agencies (Approve / Rework / Reject) without modifying the original submission.
- **Field Verification Management**: Supervises Field Officers, verifies GPS coordinates, geo-tagged photographs, tree enumeration, and physical structures.
- **Section 15 Objections & Claims**: Schedules hearings, records evidence, and issues Section 15(2) determinations.
- **Compensation Assessment**: Determines market value, 100% Solatium (Sec 30), and 12% additional interest.
- **Section 23/30 Awards**: Drafts, approves, and publishes legally binding awards.
- **PFMS Disbursement Monitoring**: Monitors Direct Benefit Transfer (DBT) to beneficiary bank accounts.
- **Section 38 Possession**: Enforces prerequisites (100% Compensation + R&R clearance) before panchnama execution.
- **Second Schedule R&R Coordination**: Tracks rehabilitation centers and family entitlements.
- **District-to-State Escalations**: Transmits bottleneck dossiers to State Officer.

---

## 4. Jurisdiction Isolation & Security Guarantee
- Server-side authorization derives `current_user.district_id` from validated JWT sessions.
- District Officers cannot view or modify data outside their assigned district code (`DST-JAI`).
