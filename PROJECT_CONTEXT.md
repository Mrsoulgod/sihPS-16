# National Land Acquisition & Management System (NLAMS)
## Project Context & Problem Definition (SIH 2026)

---

## 1. Executive Summary

The **National Land Acquisition & Management System (NLAMS)** is a unified, end-to-end digital governance platform engineered to digitize, streamline, monitor, and accelerate the complete land acquisition and rehabilitation lifecycle for public infrastructure and national development projects across India.

Guided by the statutory provisions of the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 2013)**, NLAMS transforms a historically fragmented, litigation-heavy, and opaque process into an auditable, GIS-integrated, multi-tier collaborative workflow.

---

## 2. Problem Statement & Ground Realities

Land acquisition for major infrastructure projects (national highways, dedicated freight corridors, high-speed rail, industrial corridors, renewable energy parks) in India faces systemic bottlenecks:

1. **Siloed Stakeholder Systems**: Disconnected workflows between Central Sponsoring Ministries (MoRTH, MoR, MoCA), State Revenue Departments, District Collectors / CALA (Competent Authority for Land Acquisition), Project Implementing Agencies (NHAI, DFCCIL, RVNL, NHIDCL), and field surveyors (Patwaris/Amins).
2. **Cadastral & Title Discrepancies**: Discrepancies between legacy paper revenue maps (bhu-naksha), ground reality, and digital engineering alignment coordinates (KML/SHP), causing disputes and delayed boundary fixing.
3. **Statutory Timeline Breaches**: Section 11 (preliminary notification), Section 15 (hearings of objections), Section 19 (declaration of acquisition), and Section 25 (award determination within 12 months) often lapse due to uncoordinated tracking, leading to acquisition lapsing.
4. **Valuation & Compensation Disputes**: Complex calculations involving circle rates, market multipliers (1.00x–2.00x based on rural/urban distance), 100% Solatium, and 12% per annum additional market value frequently lead to clerical errors, delayed approvals, and court injunctions.
5. **Slow & Non-Transparent Disbursements**: Delayed Direct Benefit Transfers (DBT) to genuine verified landowners, ghost beneficiaries, and lack of integration with the Public Financial Management System (PFMS).
6. **Substandard R&R (Rehabilitation & Resettlement) Monitoring**: Neglect in tracking post-possession rehabilitation entitlements (homestead plots, subsistence grants, skill development, community infrastructure) for Project Affected Families (PAFs) and Project Displaced Families (PDFs).
7. **Absence of Unified Spatial Transparency**: Lack of a centralized GIS map layer linking cadastral land parcels, acquisition status, tree/structure valuations, and encumbrance certificates in real time.

---

## 3. Core Objectives & System Vision

- **Single Window Digital Platform**: Single point of truth connecting Central, State, District, and Field tiers.
- **End-to-End Workflow Automation**: Covering 11 sequential lifecycle stages from initial DPR alignment to post-acquisition handover and R&R closure.
- **Cadastral GIS Mapping**: Interactive Leaflet-powered GIS dashboard superimposing project alignment corridors over village cadastral parcel polygons.
- **Deterministic RFCTLARR Calculation Engine**: Automated computation of circle rate valuation, applicable state rural multipliers, solatium, and interest under statutory sections.
- **Transparent Direct Benefit Transfer (DBT)**: Mock PFMS API integration with real-time disbursement tracking and validation against digitized land titles (Bhulekh / Bhoomi).
- **Proactive Risk Scoring & Predictive Analytics**: AI/Rule-based risk score evaluating litigation risk, land fragmentation, title dispute percentage, and timeline slippage.
- **Immutable Audit Trail**: Tamper-proof logging of all administrative approvals, valuation changes, gazette uploads, and compensation adjustments.

---

## 4. Primary Stakeholder Personas & Roles

| Role Code | Stakeholder Persona | Key Responsibilities & Capabilities |
|---|---|---|
| `CENTRAL_OFFICER` | Joint Secretary / Director (Central Ministry) | National project pipeline overview, sanctioning projects, cross-state bottleneck intervention, high-level milestone & budget monitoring, MIS export. |
| `STATE_OFFICER` | Principal Secretary (Revenue) / Div. Commissioner | State-wide dashboard, gazette publication tracking, inter-district coordination, statutory review of Section 19 declarations, escalation management. |
| `DISTRICT_OFFICER` | District Collector / CALA / ADM (Land Acquisition) | Scrutiny of requisition, issue Section 11/19 notifications, conduct Section 15 objection hearings, pass Section 23/30 Awards, approve compensation disbursement. |
| `PROJECT_AGENCY` | Project Director (NHAI, Rail, DMRC, CIDCO) | Upload DPR and alignment GeoJSON, deposit acquisition & R&R funds with CALA, track parcel verification, receive possession certificates. |
| `FIELD_OFFICER` | Revenue Inspector / Patwari / Amin / Surveyor | Ground truthing, mobile-assisted cadastral verification, asset enumeration (structures, trees, borewells), geo-tagged photo uploads, owner KYC check. |
| `ADMIN` | System Administrator | User provisioning, RBAC management, system health telemetry, audit log review, mock integration configurations. |

---

## 5. Primary Demonstration Project: Delhi–Jaipur Expressway Expansion

To demonstrate realistic end-to-end functionality in the SIH prototype, the system is pre-seeded with a comprehensive benchmark project:

### Project Profile: Delhi–Jaipur Expressway Expansion (NH-48 Package IV)
- **Sponsoring Agency**: National Highways Authority of India (NHAI) & Ministry of Road Transport and Highways (MoRTH)
- **Geographical Extent**: Traverses Haryana (Gurugram, Rewari) and Rajasthan (Alwar, Kotputli-Behror, Jaipur)
- **Total Corridor Length**: 225 km (Package IV acquisition segment: 48.5 km)
- **Total Land Proposed**: 500.00 Acres across 42 Revenue Villages
- **Land Verified & Acquired**: 420.00 Acres (84.0%)
- **Possession Taken**: 395.00 Acres (79.0%)
- **Total Project Affected Families (PAFs)**: 1,240 Families
- **Total Displaced Families (PDFs)**: 380 Families
- **Compensation Assessed**: ₹620.00 Crores
- **Compensation Disbursed**: ₹570.00 Crores (91.9%)
- **R&R Scheme Progress**: 72.0% Completed (Resettlement Colony site developed, 280 homestead plots allotted, ₹32 Cr R&R subsistence grants credited)
- **Key Demo Scenarios**:
  - 1 Completed package (Possession Handed Over)
  - 1 Active compensation disbursement stage with live PFMS simulation
  - 1 Active Section 15 objection dispute being heard by CALA
  - 1 High-risk parcel with title dispute triggering Predictive Risk Score alert
  - 1 R&R scheme tracking livelihood training & physical infrastructure progress
