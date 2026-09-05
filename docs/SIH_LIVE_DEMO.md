# NLAMS — Official SIH Live Demo Choreography & Operator Runbook
**Project**: National Land Acquisition & Management System (NLAMS)  
**Total Live Screen Time**: 3:45 – 4:00 Minutes Maximum  
**Flagship Scenario**: *Delhi–Jaipur Expressway Expansion (NH-48 Package IV)*  
**Primary Demonstrator**: Presenter B (Screen Operator)  
**Backup URL / Localhost**: `http://localhost:3000`  

---

## 1. Fast-Reference Stage Journey Overview

```
[Step 1: Public Transparency] ──> [Step 2: Authenticated Login] ──> [Step 3: National Dashboard] ──>
[Step 4: Project 360] ──> [Step 5: Statutory Workflow] ──> [Step 6: Cadastral GIS] ──>
[Step 7: Mobile Field Sync] ──> [Step 8: Compensation Engine] ──> [Step 9: Award & PFMS DBT] ──>
[Step 10: Schedule II R&R] ──> [Step 11: Risk Analytics] ──> [Step 12: Integration Gateway] ──>
[Step 13: Executive Closing Dashboard]
```

---

## 2. Step-by-Step Live Click Choreography

### Step 1: Public Transparency Portal
- **TIME**: 0:00 – 0:15 (15s)
- **SCREEN**: `/transparency`
- **CLICK ACTION**:
  - Show public landing page. Scroll gently past the aggregate KPIs to the "DPDP-Aligned Privacy Charter".
- **WHAT TO SAY**:
  > "Before logging in, here is the Public Transparency Portal accessible to any citizen. It shows macro corridor milestones and compensation aggregates. Under our DPDP-aligned privacy shield, individual citizen Aadhaar, bank, and phone details are never exposed to the public."
- **WHAT JUDGE SHOULD NOTICE**:
  - Clean institutional header with Ashoka emblem.
  - Clear badge: `DPDP-Aligned Privacy Controls`.
  - Zero private citizen PII visible on the unauthenticated screen.
- **BACKUP ROUTE**: `/overview`
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/01_public_transparency.png`
- **TIME EMERGENCY SKIP**: Skip scroll; start directly on Step 2 if time is tight.

---

### Step 2: Authenticated Role-Based Login
- **TIME**: 0:15 – 0:30 (15s)
- **SCREEN**: `/login`
- **CLICK ACTION**:
  - Click the quick-fill badge **"Central Monitoring Officer"** (`central_admin`).
  - Click **"Sign In to National Gateway"**.
- **WHAT TO SAY**:
  > "We authenticate into the administrative backoffice. NLAMS implements 7-tier hierarchical RBAC. We log in as the Central Officer in New Delhi, granting national oversight."
- **WHAT JUDGE SHOULD NOTICE**:
  - Pre-calibrated demo persona buttons.
  - Security banner with encryption and session notice.
- **BACKUP ROUTE**: Directly load session from pre-logged-in browser tab.
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/02_login_screen.png`
- **TIME EMERGENCY SKIP**: Have dashboard already open in an adjacent tab to save 10 seconds.

---

### Step 3: National Command Dashboard
- **TIME**: 0:30 – 0:50 (20s)
- **SCREEN**: `/dashboard`
- **CLICK ACTION**:
  - Hover over the 4 top KPI cards (Total Corridors: `12`, Acquired: `428.50 Ha`, Disbursed: `₹142.8 Cr`, Resettlement: `86%`).
  - Hover over the statutory compliance alert: *"Zero Statutory Lapses under Section 25"*.
- **WHAT TO SAY**:
  > "Here is the National Command Dashboard. 12 active infrastructure corridors, 428 hectares acquired, and 142 crore rupees disbursed. Notice the zero statutory lapses indicator: our state machine monitors the statutory 12-month clock on every project."
- **WHAT JUDGE SHOULD NOTICE**:
  - Top institutional header with role badge: `CENTRAL_OFFICER (National Gateway)`.
  - Rich, professional data visualization with green/navy cards.
- **BACKUP ROUTE**: `/reports`
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/03_national_dashboard.png`
- **TIME EMERGENCY SKIP**: Point to KPIs for 5 seconds without hovering sub-metrics.

---

### Step 4: Project 360 Workspace
- **TIME**: 0:50 – 1:10 (20s)
- **SCREEN**: Click Project card $\rightarrow$ `/projects/PRJ-NH48-PKG4`
- **CLICK ACTION**:
  - Click on the flagship corridor: **"Delhi–Jaipur Expressway Expansion (NH-48 Package IV)"**.
- **WHAT TO SAY**:
  > "We enter the Project 360 workspace for the Delhi–Jaipur Expressway. It aggregates the 8 statutory phases, total required land, budget allocations, and the 4 revenue tehsils involved."
- **WHAT JUDGE SHOULD NOTICE**:
  - Comprehensive project overview tabs: *Overview*, *Land Parcels*, *Compensation*, *Awards*, *Disbursements*, *R&R*.
- **BACKUP ROUTE**: `/projects`
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/04_project_360.png`
- **TIME EMERGENCY SKIP**: Do not switch tabs inside Project 360; proceed immediately to Workflow.

---

### Step 5: Statutory RFCTLARR Workflow
- **TIME**: 1:10 – 1:30 (20s)
- **SCREEN**: `/workflow` (or click "Workflow Timeline" inside Project)
- **CLICK ACTION**:
  - Point to the sequential timeline of statutory milestones.
  - Hover over Stage 5 (Section 15 Objections) and Stage 6 (Section 19 Declaration).
- **WHAT TO SAY**:
  > "The statutory workflow enforces statutory stage-gate rules. A project cannot jump to Section 19 declaration without recorded Section 15 objection disposal and gazette uploads. Every task has a designated authority and deadline."
- **WHAT JUDGE SHOULD NOTICE**:
  - Visual status chips: *Completed (Green)*, *In Progress (Amber)*, *Upcoming (Slate)*.
  - Responsible authority labels on each milestone.
- **BACKUP ROUTE**: Embedded workflow stepper on `/projects/PRJ-NH48-PKG4`.
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/05_workflow_timeline.png`
- **TIME EMERGENCY SKIP**: Show for 10 seconds; highlight the stage gate and move to GIS.

---

### Step 6: Cadastral GIS Engine
- **TIME**: 1:30 – 2:00 (30s)
- **SCREEN**: `/gis` (or click "GIS Map" tab)
- **CLICK ACTION**:
  - Pan map slightly over the Kotputli section.
  - Click on parcel polygon **`RJ-JPR-KTP-001`** (Khasra 412/1).
  - Show the side drawer opening with parcel attributes.
- **WHAT TO SAY**:
  > "Here is our PostGIS spatial engine. When the 60-meter highway alignment buffer is loaded, it automatically intersects the village cadastral polygons. Clicking parcel 412/1 shows 1.85 hectares required, detects the severed remainder fragment, and links directly to owner Ratan Singh."
- **WHAT JUDGE SHOULD NOTICE**:
  - Vector polygon overlay over tile map (Leaflet/PostGIS).
  - Rich side drawer displaying Khasra number, classification (Agricultural Irrigated), and area.
  - DPDP masked owner phone and Aadhaar.
- **BACKUP ROUTE**: `/land-parcels/RJ-JPR-KTP-001`
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/06_cadastral_gis.png`
- **TIME EMERGENCY SKIP**: Click the parcel immediately; do not zoom in/out.

---

### Step 7: Mobile Field Demarcation & Geotagging
- **TIME**: 2:00 – 2:15 (15s)
- **SCREEN**: Click "Field Survey" in the drawer or navigate to `/field`
- **CLICK ACTION**:
  - Show the Field Verification checklist for Parcel `RJ-JPR-KTP-001`.
  - Point out GPS coordinates (`27.7025° N, 76.1284° E`), photo thumbnail, and tree count.
- **WHAT TO SAY**:
  > "Our field verification module connects the surveyor on the ground to the central database. The surveyor records GPS boundary coordinates, photographs physical structures, and logs 14 fruit trees, moving the parcel to 'Verified'."
- **WHAT JUDGE SHOULD NOTICE**:
  - On-site evidence: GPS badge, timestamp, verification status `VERIFIED`.
- **BACKUP ROUTE**: Field tab inside parcel detail view.
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/07_field_verification.png`
- **TIME EMERGENCY SKIP**: Show for 5 seconds as proof of physical survey linkage.

---

### Step 8: Statutory Compensation Calculation Engine
- **TIME**: 2:15 – 2:45 (30s)
- **SCREEN**: `/compensation` $\rightarrow$ Open Assessment for `RJ-JPR-KTP-001`
- **CLICK ACTION**:
  - Point to the mathematical line items:
    - Base circle rate (₹25,00,000/Ha $\times$ 1.85 Ha = ₹46.25L)
    - Rural Multiplier (1.50× = ₹69.375L)
    - Structures & Trees (₹4.8L)
    - 100% Solatium (+₹74.175L)
    - 12% Interest (+₹4.45L)
    - Total: **₹1,52,80,050**
- **WHAT TO SAY**:
  > "Here is our statutory compensation engine. No Excel spreadsheets. It executes Sections 26 through 30 mathematically: base market value times 1.5 rural factor, plus tube-well and tree assets, plus mandatory 100% Solatium, plus 12% interest, formulating a final award of 1.52 crore rupees."
- **WHAT JUDGE SHOULD NOTICE**:
  - Deterministic formula breakdown card with exact statutory section labels (Sec 26, Sec 29, Sec 30(1), Sec 30(3)).
  - Clean currency formatting in Indian Lakhs/Crores.
- **BACKUP ROUTE**: Direct calculation test view `/compensation`.
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/08_compensation_calculation.png`
- **TIME EMERGENCY SKIP**: Critical step — DO NOT SKIP. Spend full 30 seconds here.

---

### Step 9: Section 23 Award & PFMS/DBT Disbursement
- **TIME**: 2:45 – 3:05 (20s)
- **SCREEN**: `/disbursements`
- **CLICK ACTION**:
  - Point to disbursement record for Award `AWD-2026-NH48-001`.
  - Highlight the UTR badge: `SBIN00293849102` and status `PAID`.
- **WHAT TO SAY**:
  > "Once CALA signs the Section 23 Award, it generates an e-payment mandate. In our PFMS sandbox gateway, the status shows PAID with real-time UTR SBIN00293849102. Direct to the beneficiary's bank account with zero intermediary cash handling."
- **WHAT JUDGE SHOULD NOTICE**:
  - Financial ledger view with UTR, bank IFSC, masked account, and SHA-256 audit tag.
- **BACKUP ROUTE**: `/awards`
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/09_pfms_disbursement.png`
- **TIME EMERGENCY SKIP**: Point to UTR and status for 10 seconds.

---

### Step 10: Schedule II R&R & Affected Families Registry
- **TIME**: 3:05 – 3:25 (20s)
- **SCREEN**: `/affected-families` $\rightarrow$ Open Family `FAM-2026-001` (Ratan Singh)
- **CLICK ACTION**:
  - Show the family record linked to Parcel `RJ-JPR-KTP-001`.
  - Point to statutory entitlement checklist (Pucca House, ₹5L Annuity Grant, Shifting Allowance).
- **WHAT TO SAY**:
  > "We do not stop at cash compensation. Under Schedule II, every displaced family is tracked. The family of Ratan Singh is mapped to their acquired Khasra, receiving a pucca house allotment in Resettlement Sector 4 and their mandatory subsistence grant."
- **WHAT JUDGE SHOULD NOTICE**:
  - Family socio-economic card, linked parcel badge, and housing allotment status: *Allotted*.
- **BACKUP ROUTE**: `/r-and-r`
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/10_randr_families.png`
- **TIME EMERGENCY SKIP**: If running behind time, show the PAF list for 8 seconds without opening detail.

---

### Step 11: Explainable Predictive Risk Intelligence
- **TIME**: 3:25 – 3:45 (20s)
- **SCREEN**: `/analytics/risk`
- **CLICK ACTION**:
  - Show the Risk Intelligence Dashboard.
  - Hover over the 4 factor breakdown (Schedule Slippage: 35%, Objections: 25%, Disbursement: 20%, Clearances: 20%).
- **WHAT TO SAY**:
  > "Our executive risk intelligence uses an explainable rule-based scoring algorithm, not black-box AI. It monitors schedule proximity to the 12-month statutory lapse deadline and objection density, alerting the ministry months before a statutory lapse can occur."
- **WHAT JUDGE SHOULD NOTICE**:
  - 0–100 risk dial, factor breakdown bars, and clear explanation of deterministic scoring.
- **BACKUP ROUTE**: `/analytics`
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/11_risk_intelligence.png`
- **TIME EMERGENCY SKIP**: High-impact slide. Point to the 4 factors for 12 seconds.

---

### Step 12: Sovereign Integration Gateway & Document Vault
- **TIME**: 3:45 – 4:00 (15s)
- **SCREEN**: `/integrations`
- **CLICK ACTION**:
  - Quick glance at the 5 integration gateway cards: *State Bhulekh (RoR)*, *SVAMITVA (GIS)*, *PFMS (DBT)*, *SMS Gateway*, *DigiLocker*.
  - Show latency (`42ms`) and status `ACTIVE (SANDBOX)`.
- **WHAT TO SAY**:
  > "Our Integration Gateway provides modular sandbox connectors for Bhulekh, SVAMITVA, and PFMS. In production, these adapters point directly to authorized government endpoints without altering the core application."
- **WHAT JUDGE SHOULD NOTICE**:
  - Transparent labeling: `ACTIVE (SANDBOX)`.
  - Professional gateway monitoring cards.
- **BACKUP ROUTE**: `/documents`
- **FALLBACK SCREENSHOT**: `artifacts/screenshots/12_integration_gateway.png`
- **TIME EMERGENCY SKIP**: Show for 6 seconds; mention sandbox connectors and immediately hand back to Presenter A.

---

### Step 13: Executive Closing Dashboard
- **TIME**: 4:00
- **SCREEN**: Return to `/dashboard`
- **CLICK ACTION**:
  - Click home/dashboard icon to leave a calm, high-level summary on screen while Presenter A delivers the final closing statement.
- **WHAT TO SAY**:
  > "And with that, I hand back to [Presenter A] to conclude our presentation."

---

## 3. Emergency Operator Fallback Matrix

| Potential Failure | Immediate Fallback Action | Visual Alternative |
| :--- | :--- | :--- |
| **Map Tiles Slow to Render** | Do not wait for tiles; click parcel `RJ-JPR-KTP-001` immediately in the parcel table list. | Parcel Drawer displays full cadastral data even if raster tiles lag. |
| **Backend Unreachable** | Frontend has full optimistic mock resilience pre-seeded with NH-48 data. | Data still renders cleanly via client-side demo state. |
| **Accidental Logout** | Use browser bookmark bar: single click logs in as `central_admin` via stored token. | Keep a second browser window open in incognito as a hot standby. |
| **Time Cutoff Warning (1 Min Left)** | Jump immediately from GIS $\rightarrow$ Compensation $\rightarrow$ Dashboard $\rightarrow$ Conclude. | Skip Field, R&R, and Integrations sub-pages. |
