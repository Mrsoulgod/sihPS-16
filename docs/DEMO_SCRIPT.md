# NLAMS — Official SIH 2026 Demo Script
**Project**: National Land Acquisition & Management System (NLAMS)  
**Flagship Project**: *Delhi–Jaipur Expressway Expansion (NH-48 Package IV)*  
**Target Duration**: 8–10 Minutes (Live Jury / Evaluation Presentation)

---

## Executive Summary & Statutory Context (Minute 0:00 – 1:00)

### Presenter Narrative
> "Honorable jury members, welcome to the demonstration of **NLAMS — the National Land Acquisition and Management System**. Land acquisition in India across linear infrastructure—such as national highways, freight corridors, and high-speed rail—faces persistent challenges under the **RFCTLARR Act 2013**:
> 1. Fragmented data across revenue tehsils, state departments, and acquiring agencies.
> 2. Statutory statutory schedule slippages (12-month notification lapses under Section 19(1)).
> 3. Calculation errors in statutory compensation: market values, rural multiplication factors, 100% solatium, and 12% additional interest under Section 30.
> 4. Delayed Rehabilitation & Resettlement (R&R) entitlements and unlinked disbursements.
>
> NLAMS is an end-to-end, statutory-first, role-governed platform that brings complete operational transparency, geospatial parcel intelligence, automated compensation calculation, transparent direct benefit disbursements, and auditable governance to every stage of the RFCTLARR lifecycle."

---

## Act I: National Strategic Overview — Central Administrative Officer (Minute 1:00 – 2:30)

### Persona & Login
- **Role**: Central Monitoring Officer (`central_officer@nlams.gov.in` / `central_admin` / password: `Password@123`)
- **Landing Page**: `/dashboard`

### Demonstration Steps
1. **Login & Scoped Header**:
   - Log in using Central Officer credentials.
   - Point out the institutional Government of India header, Ashoka emblem, role badge (`CENTRAL_OFFICER`), and jurisdiction scope (`National Gateway`).
2. **Top National KPI Cards**:
   - **Total Projects**: 12 active infrastructure corridors across 4 states.
   - **Total Acquired Area**: 428.50 Ha acquired out of 842.10 Ha required across national programs.
   - **Compensation Disbursed**: Direct Benefit Transfer (PFMS/DBT) metrics showing total awards vs. disbursed treasury funds.
   - **R&R Resettlement Rate**: Families surveyed vs. R&R scheme approved.
3. **National GIS & Project Registry**:
   - Navigate to `/projects` and highlight the flagship project: **Delhi–Jaipur Expressway Expansion (NH-48 Package IV)**.
   - Note key statutory milestones: Section 3A/4 Notification, Section 11(1) Preliminary Notification, Section 19(1) Declaration, Section 23 Award Inquiry, and Section 38 Possession.
   - Highlight the SLA Alert indicator: "Zero statutory lapses under Section 25 (Award within 12 months)".

---

## Act II: Workflow, Section 11/19 Stage Gate & Cadastral GIS — CALA / District Officer (Minute 2:30 – 4:30)

### Persona & Login
- **Role**: Competent Authority for Land Acquisition (CALA) / District Collector (`cala_jaipur` / password: `Password@123`)
- **Landing Page**: `/projects/PRJ-NH48-PKG4` & `/workflow`

### Demonstration Steps
1. **Interactive Workflow Lifecycle**:
   - Open the **Workflow Timeline** (`/workflow`).
   - Showcase the 8 sequential statutory stages mandated by the RFCTLARR Act 2013:
     1. Project Inception & Proposal
     2. Social Impact Assessment (SIA) & Section 4
     3. Section 11(1) Preliminary Notification
     4. Hearing of Objections (Section 15) & Boundary Survey
     5. Section 19(1) Final Declaration & Cadastral Mapping
     6. Section 23 Award Inquiry & Valuation
     7. Section 26–30 Compensation & Section 31 R&R Award
     8. Section 38 Possession & Mutation Handover
   - Demonstrate the **Stage Transition Modal**: Explain how the state machine prevents skipping statutory milestones without uploading mandatory gazette notifications.
2. **Cadastral GIS Map Integration**:
   - Open the Project GIS Viewer (`/gis` or `/land-parcels`).
   - Show the interactive OpenStreetMap/Leaflet cadastral parcel overlays along the NH-48 chainage (Kotputli to Behror, Jaipur rural).
   - Click on parcel `RJ-JPR-KTP-001` (Khasra No. 412/1):
     - View parcel area: `1.85 Ha`, Classification: `Agricultural (Irrigated)`.
     - Landowners: Ratan Singh & Smt. Kamla Devi.
     - Highlight the automated PII masking on public views (Aadhaar `XXXX-XXXX-8921`, Phone `9829XXXX12`).

---

## Act III: Statutory Compensation Engine & Award Formulation — Valuation Officer (Minute 4:30 – 6:30)

### Persona & Login
- **Role**: Valuation / Revenue Officer (`CALA Jaipur` or `Project Agency Officer`)
- **Landing Page**: `/compensation` & `/awards`

### Demonstration Steps
1. **Statutory RFCTLARR Calculation Engine**:
   - Open Compensation Assessment `/compensation` for Flagship Parcel `RJ-JPR-KTP-001`.
   - Walk through the mathematical formula executed by the backend compensation engine:
     - **Base Circle Rate / Market Value** (Sec 26): ₹2,500,000/Ha × 1.85 Ha = **₹4,625,000**
     - **Rural Multiplication Factor** (1.50× for rural Jaipur): ₹4,625,000 × 1.5 = **₹6,937,500**
     - **Assets & Structure Valuation** (Sec 29): Tube well + 14 fruit trees = **₹480,000**
     - **Total Market Base**: ₹7,417,500
     - **100% Statutory Solatium** (Sec 30(1)): +**₹7,417,500**
     - **Additional Interest** (Sec 30(3) @ 12% p.a. from Sec 11 notification date to award date): **₹445,050**
     - **Total Statutory Award**: **₹15,280,050**
2. **Award Approval & PFMS/DBT Disbursement**:
   - Open `/awards` and inspect Section 23 Award Notice `AWD-2026-NH48-001`.
   - Navigate to `/disbursements`:
     - Show the disbursement schedule linked to the award.
     - Direct Benefit Transfer (DBT) status: `PAID` via PFMS UTR `SBIN00293849102`.
     - Point out the tamper-evident audit trace: Every disbursement has a cryptographic SHA-256 integrity hash.

---

## Act IV: Rehabilitation & Resettlement (R&R) — Resettlement Officer (Minute 6:30 – 7:30)

### Persona & Login
- **Role**: R&R Officer / Administrator (`CALA Jaipur`)
- **Landing Page**: `/r-and-r` & `/affected-families`

### Demonstration Steps
1. **RFCTLARR Second & Third Schedule Entitlements**:
   - Open R&R Scheme `RNR-2026-NH48-001`.
   - Total Displaced / Affected Families: **28 Families**.
   - Show structured statutory benefits:
     - Constructed rural house / housing grant under PMAY-G (Second Schedule Para 1).
     - One-time subsistence allowance (₹36,000/year per family).
     - One-time cattle shed / petty shop relocation assistance (₹25,000).
     - Stamp duty exemption and registration fee waiver.
2. **Family Traceability**:
   - Click on Affected Family `AF-RJ-001` (Ratan Singh Family).
   - Trace full pedigree: Parcel `RJ-JPR-KTP-001` → Compensation Award `AWD-2026-NH48-001` → R&R Allotment `ALLOT-001` (Resettlement Colony Plot 14, Kotputli Ext).

---

## Act V: Transparency, Field Verification & Regulatory Export (Minute 7:30 – 8:30)

### Demonstration Steps
1. **Field Mobile PWA Verification**:
   - Open `/field` (Field Verification Module).
   - Show how a field surveyor captures GPS geo-stamps, uploads site inspection photos, records physical boundary pegs, and syncs offline inspection logs.
2. **Inter-Agency Sandbox Integrations**:
   - Open `/integrations`.
   - Inspect the four standardized institutional gateways:
     - **Bhulekh / Land Records API** (State cadastre sync).
     - **PFMS / e-Kuber** (Treasury disbursement gateway).
     - **Bhoomi Rashi** (Ministry of Road Transport & Highways gazette gateway).
     - **PM GatiShakti NMP** (National geospatial master plan layer integration).
   - Demonstrate the simulated gateway handshake and cryptographic audit hash generation.
3. **Statutory Report Export**:
   - Open `/reports`.
   - Generate the **National Land Acquisition Quarterly Gazette Report (PDF & Excel)**.
   - Show instant PDF generation formatted according to Ministry of Rural Development specifications.

---

## Conclusion & Jury Q&A Hand-Off (Minute 8:30 – 9:00)

### Closing Statement
> "NLAMS transforms an adversarial, paper-bound land acquisition process into a predictable, transparent, and auditable digital journey. It protects landowners' statutory rights through mathematical compensation transparency, shields project authorities from statutory delays, and provides the Ministry with real-time national intelligence. Thank you, and we now welcome your questions."
