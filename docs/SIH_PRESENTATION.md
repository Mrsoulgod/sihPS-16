# NLAMS — Official SIH 2026 Presentation Blueprint
**Project**: National Land Acquisition & Management System (NLAMS)  
**Hackathon**: Smart India Hackathon (SIH 2026)  
**Theme**: Infrastructure, Smart Governance & Modern Land Administration  
**Presentation Time**: 5–7 Minutes  

---

## Slide 1 — Title
### National Land Acquisition & Management System (NLAMS)
**Subtitle**: A Unified, Transparent, and Geospatially-Integrated Lifecycle Platform for Infrastructure Land Acquisition under the RFCTLARR Act 2013

- **Presented By**: Team Antigravity
- **Target Implementing Agency**: Ministry of Road Transport & Highways (MoRTH) / National Highways Authority of India (NHAI) / Revenue Departments
- **Prototype Status**: High-Fidelity SIH-Aligned Functional Prototype with Sandbox Government Gateways

---

## Slide 2 — The Problem
### Linear Infrastructure Stalled by Fragmented Land Administration

1. **Statutory Time & Cost Overruns**:
   - Over 60% of linear infrastructure projects in India face multi-year delays directly attributable to land acquisition.
   - Strict 12-month statutory deadlines under **Section 19(1) and Section 25** of the RFCTLARR Act 2013 frequently lapse due to untracked manual processing, forcing entire proceedings to restart.
2. **Disconnected Cadastral Data**:
   - Project alignment drawings (CAD/KML) sit in silos isolated from state revenue records and cadastral survey parcels, causing boundary overlaps and disputes.
3. **Valuation Errors & Compensation Disputes**:
   - Manual calculation of rural multiplication factors (1.0× to 2.0×), 100% statutory solatium, and 12% additional interest creates widespread calculation discrepancies and litigation.
4. **Neglected R&R Tracking**:
   - Resettlement and Rehabilitation (R&R) of Project-Affected Families (PAFs) under Schedule II is tracked on disconnected spreadsheets, leading to delayed rehabilitation and social distress.
5. **Lack of Inter-Agency Coordination**:
   - Acquiring Bodies, District Revenue Collectors (CALA), Forest/Environment departments, and treasury offices have zero unified real-time visibility.

---

## Slide 3 — Existing Gap
### Siloed Manual Portals vs. Unified Lifecycle Automation

| Traditional Acquisition Landscape | The NLAMS Unified Platform |
| :--- | :--- |
| **Fragmented Systems**: State Bhulekh portals provide read-only records; NHAI BhoomiRashi tracks project notifications; state treasuries disburse separately. | **Single Unified Lifecycle**: From Section 3A/4 proposal to Section 38 possession and mutation handover in one continuous digital thread. |
| **Static Paper Maps & Excel**: Surveyors carry physical paper maps; alignment overlaps identified only during physical demarcation. | **Interactive Cadastral GIS**: Automated GeoJSON parcel clipping along ROW alignments with real-time field survey sync. |
| **Opaque Manual Compensation**: Multi-sheet manual spreadsheets with human errors in market rate multiplier and solatium application. | **Statutory Formula Engine**: Deterministic, rule-based calculation strictly enforcing Sections 26–30 with automated award generation. |
| **Untracked R&R Entitlements**: PAF packages, housing allotments, and annuity claims slip through administrative cracks. | **Schedule II PAF Matrix**: Unit-level entitlement tracking, bank account linkage, and physical possession verification. |
| **No Predictive Risk Visibility**: Delays identified only after statutory statutory lapses occur. | **Predictive Rule-Based Risk Intelligence**: Real-time SLA breach forecasting, objection clustering, and litigation warning flags. |

---

## Slide 4 — Our Solution
### NLAMS: The Sovereign Digital Backbone for Land Acquisition

NLAMS delivers an enterprise-grade digital platform that unites the Acquiring Body, the Competent Authority for Land Acquisition (CALA), Survey Officers, Valuation Experts, and Displaced Citizens:

- **Strict Statutory Adherence**: Automated state-machine enforcing mandatory RFCTLARR Act 2013 milestones (Section 4 SIA, Section 11 Notification, Section 15 Objections, Section 19 Declaration, Section 23 Award, Section 38 Possession).
- **Geospatial Parcel Intelligence**: Vector cadastral overlays on satellite/OpenStreetMap layers with interactive survey demarcation.
- **Rule-Based Valuation & DBT Tracking**: Transparent Section 26 market valuation, rural multiplication, 100% solatium, and automated PFMS/DBT sandbox disbursement schedules.
- **Project-Affected Family (PAF) Registry**: Complete socio-economic profiles, Schedule II mandatory entitlements, and resettlement status tracking.
- **Auditable Sovereign Governance**: Role-Based Access Control (RBAC), multi-tier administrative jurisdictions, and cryptographically hashed (SHA-256) audit trails.

---

## Slide 5 — End-to-End Workflow
### 8-Stage Statutory Acquisition Lifecycle

```
[ Stage 1: Proposal & Inception ]
              │ (Section 4 SIA & Feasibility)
              ▼
[ Stage 2: Scrutiny & In-Principle Approval ]
              │ (CALA Appointment & Alignment Approval)
              ▼
[ Stage 3: Land Identification & Cadastral Mapping ]
              │ (Khasra Extraction & Cadastral GIS Overlap)
              ▼
[ Stage 4: Preliminary Notification (Section 11) ]
              │ (Gazette Publication & Land Freeze)
              ▼
[ Stage 5: Objections (Sec 15) & Joint Field Survey ]
              │ (Geotagged Mobile Verification & Claims Hearing)
              ▼
[ Stage 6: Final Declaration (Section 19) ]
              │ (Within 12 months; Boundary Demarcation)
              ▼
[ Stage 7: Valuation, Award (Sec 23) & PFMS Disbursement ]
              │ (Sec 26-30 Formula + 100% Solatium + DBT Transfer)
              ▼
[ Stage 8: Possession (Sec 38) & Schedule II R&R Completion ]
              │ (Physical Handover + PAF Rehabilitation + Revenue Mutation)
              ▼
       [ Mutation Handover ]
```

- **Statutory Gate Enforcer**: The system blocks progression from Section 11 to Section 19 unless objection hearings (Section 15) are documented and gazette notifications are cryptographically uploaded.
- **Statutory Lapses Prevention**: Automated countdown to the 12-month statutory ceiling under Section 25.

---

## Slide 6 — GIS & Field Intelligence
### Precision Geospatial Alignment & Mobile Verification

1. **Cadastral Overlay Engine**:
   - Ingests vector GIS layers (GeoJSON/Shapefile/KML) representing national highway or rail Right-of-Way (ROW) alignments.
   - Automatically clips and queries cadastral village maps to generate an exact schedule of affected Khasra numbers and sub-parcels.
2. **Interactive Spatial Inspection**:
   - Color-coded parcel statuses: *Identified (Blue)*, *Notified (Amber)*, *Awarded (Indigo)*, *Disbursed (Emerald)*, *Possessed (Teal)*, *Disputed (Rose)*.
   - Detailed side panel with khasra attributes, area required, ownership shares, and encumbrances.
3. **Mobile-Responsive Field Verification**:
   - Geotagged site inspection recording: GPS coordinates, ground photographs, and land classification verification (irrigated/unirrigated/commercial).
   - Structure and tree enumeration on site directly feeding Section 29 asset valuation.
   - Offline-first cache syncing when field officers operate in remote rural corridors.

---

## Slide 7 — Compensation & DBT
### Mathematical Transparency & Direct Treasury Disbursement

- **Statutory Valuation Formula (RFCTLARR 2013)**:
  $$\text{Market Value (Sec 26)} = \text{Acquired Area} \times \text{Base Circle Rate}$$
  $$\text{Indexed Base} = \text{Market Value} \times \text{Rural Multiplication Factor (1.00\text{--}2.00\times)}$$
  $$\text{Gross Market Base} = \text{Indexed Base} + \text{Structure Valuation (Sec 29)} + \text{Tree Valuation (Sec 29)}$$
  $$\text{Statutory Solatium (Sec 30(1))} = 100\% \times \text{Gross Market Base}$$
  $$\text{Additional Interest (Sec 30(3))} = 12\% \text{ p.a. from Sec 11 Notification to Award Date}$$
  $$\mathbf{\text{Total Statutory Award}} = \text{Gross Market Base} + \text{Solatium} + \text{Additional Interest}$$
- **Automated Award Notice Generation**: Formulates Section 23/23A award certificates ready for CALA digital signature.
- **Sandbox PFMS/DBT Gateway**:
  - Individual bank account validation (IFSC/Account).
  - Staged disbursement schedules with UTR tracking.
  - Zero leakage: Eliminates physical cheques and intermediary cash handling.

---

## Slide 8 — R&R & Affected Families
### Comprehensive Rehabilitation & Resettlement Tracking

1. **Schedule II Entitlement Engine**:
   - Automatic classification of displaced vs. affected families.
   - Tracking mandatory statutory benefits:
     - Constructed House / Resettlement Colony Allotment (or lump-sum financial assistance in lieu of house).
     - Choice of Annuity / Lumpsum Employment Grant (₹5,00,000 or ₹2,000/month annuity for 20 years).
     - Subsistence Allowance (₹3,000/month for 1 year).
     - Transportation / Shifting Allowance (₹50,000).
     - Cattle Shed / Petty Shop assistance.
2. **Family-to-Parcel Linkage**:
   - Every PAF is explicitly linked to their acquired cadastral parcel and compensation award.
3. **Resettlement Colony Infrastructure Monitoring**:
   - Progress tracking on 25 mandatory basic civic amenities (roads, drainage, drinking water, electricity, school, health centre).

---

## Slide 9 — Analytics & Predictive Risk
### Real-Time Executive Dashboards & Bottleneck Intelligence

- **Role-Tailored KPI Dashboards**:
  - Central Officers track national portfolio throughput, state-wise burn rate, and pending notifications.
  - District CALAs track pending objection hearings, valuation approvals, and award disbursement progress.
- **Rule-Based Predictive Risk Scoring**:
  - Transparent, deterministic risk algorithm scoring projects from 0 to 100 based on weighted statutory indicators:
    - *SLA Schedule Slippage Risk (35%)*: Proximity to the Section 19 or Section 25 statutory lapse deadlines.
    - *Objection & Litigation Intensity (25%)*: Ratio of contested parcels vs. total parcels.
    - *Disbursement Bottleneck (20%)*: Gap between awarded compensation and realized PFMS disbursements.
    - *Environmental / Forest Clearance Pending (20%)*: Regulatory clearance hold-ups.
- **Statutory Bottleneck Heatmap**: Instantly identifies districts where files are stuck in revenue scrutiny or boundary demarcation.

---

## Slide 10 — Interoperability
### Sovereign Integration Gateway & Sandbox Connectors

NLAMS is built on an open, micro-modular API Gateway designed to interface with sovereign Indian digital infrastructure:

- **State Land Records (Bhulekh / C-DIL Sandbox)**:
  - Mock REST/SOAP gateway parsing RoR (Record of Rights), land classification, mutation status, and encumbrance certificates.
- **Survey & Cadastral GIS (SVAMITVA / State NIC GIS Sandbox)**:
  - Vector parcel boundary integration and drone-derived cadastral map feeds.
- **Public Financial Management System (PFMS / DBT Gateway Sandbox)**:
  - Automated e-payment mandate generation, credit verification, and Real-Time UTR reconciliation.
- **Citizen Communication Gateway**:
  - Automated SMS and WhatsApp sandbox triggers dispatching Section 11/19 notice links, hearing dates, and award disbursements to registered landholders.
- **Pluggable Architecture**: Clear interface contracts allow replacing sandbox mock adapters with production state NIC endpoints via config without core code changes.

---

## Slide 11 — Security & Sovereign Governance
### Role-Based Access, Integrity Hashing, and DPDP Privacy

1. **Role-Based Access Control (RBAC)**:
   - 7 distinct administrative roles: *System Admin*, *Central Officer*, *State Officer*, *District Collector (CALA)*, *Valuation Officer*, *Field Surveyor*, *Public Citizen*.
   - Strict hierarchical data isolation: District users cannot modify records outside their assigned revenue division.
2. **Cryptographic Audit Trail**:
   - Every critical statutory action (award formulation, status transition, disbursement release, document upload) produces an immutable audit record stamped with actor ID, timestamp, and **SHA-256 payload hash**.
3. **DPDP-Aligned Citizen Privacy**:
   - Citizen PII (Aadhaar numbers, bank account numbers, private mobile numbers) is strictly masked (`XXXX-XXXX-8921`) across public portals and non-privileged role views.
4. **Document Versioning**:
   - Gazette notifications, survey sketches, and compensation schedules are versioned with SHA-256 checksums to prevent document tampering.

---

## Slide 12 — Measurable Impact
### Quantifiable Operational Improvements for Government

| Dimension | Before NLAMS | With NLAMS |
| :--- | :--- | :--- |
| **Statutory Notification Cycle** | 18–24 months (frequent lapses) | **8–11 months** (0 statutory lapses) |
| **Compensation Formulation** | 4–6 weeks per village on Excel | **Instantaneous deterministic calculation** |
| **Payment Leakage / Errors** | Intermediary delays, manual checks | **100% Direct Benefit Transfer (DBT)** |
| **Field Boundary Disputes** | Physical disputes during construction | **Pre-resolved with vector cadastral GIS** |
| **Executive Decision-Making** | Monthly retrospective paper MIS | **Real-time portfolio visibility & risk alerts** |
| **Displaced Citizen Trust** | Opaque process, visits to tehsil office | **Transparent public portal & SMS updates** |

---

## Slide 13 — Scalability
### National Geographic Hierarchy & Master Data Standards

- **Four-Tier Revenue Hierarchy**:
  - `Center` $\rightarrow$ `State` $\rightarrow$ `District` $\rightarrow$ `Tehsil` $\rightarrow$ `Village` $\rightarrow$ `Cadastral Parcel / Khasra`.
  - Scalable database schema supporting 28 states and 8 union territories with state-specific circle rates and multiplication factor tables.
- **Standardized Master Data**:
  - Pre-seeded with official land classifications (Agricultural Irrigated, Agricultural Rainfed, Residential, Commercial, Industrial, Forest/Government).
  - Configurable state-specific rules without code fork (e.g., multiplier curves based on distance from urban boundaries).
- **Asynchronous Architecture**:
  - Non-blocking async Python backend (FastAPI + SQLAlchemy async engine + asyncpg) capable of handling millions of parcel records across concurrent tehsils.

---

## Slide 14 — Technology Architecture
### Enterprise-Grade Full-Stack Specification

```
   [ Public Citizen Web Portal ]          [ Administrative Backoffice Portal ]
         (Next.js 14 App Router)                 (Next.js 14 + Tailwind CSS)
                   │                                         │
                   └────────────────────┬────────────────────┘
                                        │ HTTPS / TLS 1.3
                                        ▼
                           [ API Authentication & RBAC ]
                             (JWT + Role Permissions)
                                        │
                                        ▼
                             [ FastAPI REST Core ]
     ┌──────────────────────────────────┼──────────────────────────────────┐
     │                                  │                                  │
[ Workflow Engine ]            [ GIS & Parcel Engine ]          [ Compensation Engine ]
(RFCTLARR State Machine)         (PostGIS / GeoJSON)               (Sec 26-30 Formula)
     │                                  │                                  │
[ R&R PAF Registry ]           [ Field Sync Service ]           [ Audit & Hash Engine ]
(Schedule II Matrix)             (Geotag Inspection)             (SHA-256 Ledger)
     └──────────────────────────────────┬──────────────────────────────────┘
                                        │ SQLAlchemy 2.0 Async
                                        ▼
                         [ PostgreSQL 16 + PostGIS ]
                         (Spatial Indexing + ACID Data)
                                        │
                                        ▼
                         [ Sovereign Gateway Adapters ]
     ┌──────────────────┬──────────────────┬──────────────────┬────────────┐
     ▼                  ▼                  ▼                  ▼            ▼
 [ Bhulekh ]      [ SVAMITVA ]          [ PFMS ]           [ SMS/WA ]   [ DigiLocker ]
 (Land RoR)       (Cadastral GIS)       (DBT Payments)    (Notifications) (Documents)
```

---

## Slide 15 — Demo Journey
### 5–7 Minute Live Jury Walkthrough

1. **Minute 0:00–1:00 (National Strategy & Problem)**:
   - Log in as **Central Officer**. Showcase the National Dashboard: 12 projects, 428 Ha acquired, ₹142 Cr disbursed, zero statutory lapses.
2. **Minute 1:00–2:30 (Project 360 & Cadastral GIS)**:
   - Open flagship project: *Delhi–Jaipur Expressway Expansion (NH-48 Package IV)*.
   - Switch to GIS View: Show vector alignment overlay, affected Khasra boundaries, and parcel details.
3. **Minute 2:30–4:00 (Workflow & Statutory Compensation)**:
   - Switch to **CALA Jaipur** view.
   - Walk through the 8-stage workflow state machine.
   - Open Compensation Calculator for Parcel `RJ-JPR-KTP-001`: Demonstrate Section 26 base value $\rightarrow$ 1.5× rural factor $\rightarrow$ Section 29 structures $\rightarrow$ 100% Solatium $\rightarrow$ 12% Interest $\rightarrow$ Final ₹1.52 Cr Award.
4. **Minute 4:00–5:15 (Disbursement, R&R & Field Intelligence)**:
   - Inspect PFMS/DBT disbursement with live UTR and SHA-256 hash.
   - Show PAF Schedule II R&R entitlements and resettlement status.
   - Briefly showcase Field Survey geotagged inspection with coordinates and photo verification.
5. **Minute 5:15–6:00 (Analytics, Risk & Gateways)**:
   - Highlight the Rule-Based Predictive Risk Dashboard flagging bottleneck projects before statutory lapse.
   - Show Sovereign Gateway status page (Bhulekh, PFMS, Cadastral).
6. **Minute 6:00–7:00 (Architecture, Security & Closing Statement)**:
   - Present architecture, DPDP compliance, and the 30-second closing statement.

---

## Slide 16 — Future Scope & Production Roadmap
### From Hackathon Prototype to Sovereign Production Deployment

| Prototype Capability (Current) | Production Roadmap (Post-Hackathon) |
| :--- | :--- |
| **Sandbox Gateway Connectors**: Realistic mock adapters responding with standard JSON schemas for Bhulekh and PFMS. | **Live API Integration**: Formal onboarding onto Open Government Data (OGD) platform, National Land Record Modernization Programme (NLRMP), and state NIC gateways. |
| **Rule-Based Risk Intelligence**: Transparent, deterministic 4-factor scoring algorithm. | **ML Bottleneck Forecasting**: Train models on historical district acquisition times to predict multi-variable dispute probabilities. |
| **Web-Responsive Mobile Field Interface**: Field officer portal with geotag and photo capture. | **Native Android/iOS PWA**: Offline SQLite container with automatic mesh synchronization for remote border/forest areas. |
| **Local / S3 Document Vault**: Stored with SHA-256 integrity checksums. | **DigiLocker & Bharat e-Sign**: Citizen-side digital notice acceptance and CALA e-Sign under the Information Technology Act. |
| **State Circle Rate Tables**: Seeded configuration matrices for test states. | **Dynamic Circle Rate Feeds**: Direct API synchronization with state Inspector General of Registration (IGR) databases. |
