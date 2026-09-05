# NLAMS — 7-Minute SIH Demo Timeline & Stage Choreography
**Project**: National Land Acquisition & Management System (NLAMS)  
**Total Target Time**: 7 Minutes Max (Hard Ceiling)  
**Tone**: Confident, authoritative, professional, storytelling-driven  
**Flagship Project**: *Delhi–Jaipur Expressway Expansion (NH-48 Package IV)*  

---

## Chronological Cue Sheet & Storytelling Timeline

| Timestamp | Phase / Topic | Screen / URL | Persona / Role | Narrative & Actions |
| :--- | :--- | :--- | :--- | :--- |
| **0:00 – 0:30** | **The Problem** | *Title Slide / Pitch* | Presenter 1 (Lead) | **The Crisis in Linear Infrastructure:**<br>• Over 60% of national highway and rail projects face multi-year delays due to land acquisition.<br>• Fragmented paper records, 12-month statutory deadline lapses under Section 25, error-prone manual compensation, and zero R&R tracking stall India's infrastructure growth. |
| **0:30 – 1:00** | **The Solution** | *Solution Slide / Login* | Presenter 1 | **Introducing NLAMS:**<br>• The sovereign digital backbone for land acquisition under the RFCTLARR Act 2013.<br>• Unites acquiring bodies, district collectors (CALA), surveyors, and citizens into a unified geospatial lifecycle.<br>• Log in as **Central Monitoring Officer** (`central_admin`). |
| **1:00 – 1:45** | **National Executive Dashboard** | `/dashboard` | Central Officer | **Macro Governance & Oversight:**<br>• Point out national KPIs: 12 active highway corridors, 428 Ha acquired, ₹142 Cr DBT compensation disbursed.<br>• Highlight zero statutory schedule lapses.<br>• Demonstrate geographic scope: Central Officer views all states; district collectors are scoped to their revenue jurisdiction. |
| **1:45 – 2:30** | **Project 360 & Statutory Workflow** | `/projects/PRJ-NH48-PKG4` & `/workflow` | CALA Jaipur | **From Proposal to Possession:**<br>• Open flagship project: *Delhi–Jaipur Expressway Package IV* (NH-48).<br>• Show the 8-stage RFCTLARR lifecycle state machine.<br>• Explain the statutory gate: system blocks Section 19 declaration until Section 15 objections are heard and gazette is uploaded. |
| **2:30 – 3:15** | **Cadastral GIS & Field Intelligence** | `/gis` & `/field` | CALA / Surveyor | **Precision Geospatial Demarcation:**<br>• Display vector Right-of-Way (ROW) alignment overlaid on Kotputli village cadastral parcels.<br>• Click parcel `RJ-JPR-KTP-001` (Khasra 412/1): show area, land class, and severed boundary.<br>• Switch to Field Verification view: show geotagged GPS inspection, on-site photos, and structure enumeration. |
| **3:15 – 4:00** | **Compensation, Award & DBT** | `/compensation` & `/awards` & `/disbursements` | Valuation Officer / CALA | **Mathematical Transparency & Direct Transfer:**<br>• Open statutory calculation for parcel `RJ-JPR-KTP-001`.<br>• Show: Base Market Value $\times$ 1.5 Rural Multiplier $+$ Assets $+$ **100% Solatium** $+$ 12% Interest = **₹1.52 Cr Award**.<br>• Show Section 23 Award notice and PFMS/DBT disbursement with live UTR and SHA-256 tamper hash. Zero cash leakage. |
| **4:00 – 4:40** | **Possession & R&R Entitlements** | `/possession` & `/r-and-r` | Resettlement Officer | **Social Justice & Schedule II Protection:**<br>• Open Project-Affected Families (PAFs) registry linked directly to acquired parcels.<br>• Showcase Schedule II mandatory entitlements: pucca housing assistance, ₹5 Lakh annuity/job grant, and subsistence allowance.<br>• Show physical possession handover under Section 38. |
| **4:40 – 5:20** | **Analytics & Predictive Risk** | `/analytics` & `/analytics/risk` | Central Officer | **Proactive Governance:**<br>• Show the Rule-Based Predictive Risk Dashboard.<br>• Explain how the transparent 4-factor scoring algorithm flags projects nearing the Section 25 12-month statutory lapse deadline *before* it happens.<br>• Show district bottleneck heatmap for administrative escalation. |
| **5:20 – 5:50** | **Integrations & Document Vault** | `/integrations` & `/documents` | System Admin | **Sovereign Interoperability & Security:**<br>• Showcase Integration Gateway: sandbox connectors for Bhulekh (RoR), SVAMITVA (Cadastral GIS), and PFMS (DBT Payments).<br>• Show Document Vault: gazette notifications and awards versioned with cryptographic SHA-256 digests. |
| **5:50 – 6:30** | **Architecture & Security** | *Architecture Slide* | Technical Lead | **Enterprise Technology Stack:**<br>• Full-stack architecture: Next.js 14 $\rightarrow$ FastAPI REST $\rightarrow$ PostgreSQL 16 + PostGIS spatial engine.<br>• DPDP-aligned PII masking: citizen Aadhaar and bank details redacted on public views.<br>• 7-tier hierarchical RBAC with immutable audit logging. |
| **6:30 – 7:00** | **Impact & Closing Statement** | *Closing Slide / Live Demo* | Presenter 1 (Lead) | **Final Pitch:**<br>• Deliver the 30-second official closing statement.<br>• Conclude exactly on the 7:00 mark and invite jury questions. |

---

## Presenter Transition & Backup Protocol

### Presenter Roles
- **Speaker 1 (Domain Lead / Government Specialist)**: Opens the problem, walks through Central Dashboard, Workflow, Compensation, and delivers Closing Statement.
- **Speaker 2 (Technical & GIS Lead)**: Demonstrates Cadastral GIS, Mobile Field Sync, Predictive Risk Engine, Integration Gateway, and Architecture.

### Time Management Rules
- **At 3:00**: Must be on Compensation Calculation. If running behind, skip detailed parcel list and jump directly to Parcel `RJ-JPR-KTP-001`.
- **At 5:00**: Must be entering Analytics & Risk. Do not linger on individual family forms.
- **At 6:30**: Cease live clicking; deliver closing statement directly to judges.
