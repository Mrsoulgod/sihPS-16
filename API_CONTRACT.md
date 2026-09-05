# National Land Acquisition & Management System (NLAMS)
## API Contract & Endpoint Specification

---

## 1. Global API Standards

- **Base URL**: `/api/v1`
- **Protocol**: HTTPS / REST
- **Payload Format**: `application/json` (or `multipart/form-data` for file uploads)
- **Authentication**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`

### 1.1 Standard Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully.",
  "metadata": {
    "timestamp": "2026-09-02T07:15:00Z",
    "request_id": "req-94a2b6e1",
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_records": 124,
      "total_pages": 7
    }
  }
}
```

### 1.2 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "STATUTORY_GUARD_VIOLATION",
    "message": "Cannot declare Section 23 Award: 14 parcels have unresolved Section 15 objections.",
    "details": [
      { "field": "parcel_id", "issue": "Objection OBJ-2026-012 pending hearing" }
    ]
  },
  "metadata": {
    "timestamp": "2026-09-02T07:15:00Z",
    "request_id": "req-94a2b6e1"
  }
}
```

---

## 2. API Endpoint Groups

### 2.1 Authentication & Profile (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticate with username & password; returns tokens + user profile | No |
| `POST` | `/auth/refresh` | Exchange refresh token for fresh access token | No |
| `GET` | `/auth/me` | Fetch active authenticated user profile & permissions | Yes |
| `POST` | `/auth/switch-role` | **Demo Feature**: Quick-switch active role (Central/State/District/Agency/Field) | Yes |
| `POST` | `/auth/logout` | Revoke active session token | Yes |

---

### 2.2 Projects Management (`/api/v1/projects`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/projects` | List projects with filters (`state_id`, `stage`, `search`, `risk_level`) | All Roles |
| `POST` | `/projects` | Create new acquisition project with DPR parameters & budget | `PROJECT_AGENCY`, `ADMIN` |
| `GET` | `/projects/{id}` | Get project 360° detail (stats, current stage, land summary, R&R) | All Roles |
| `PUT` | `/projects/{id}` | Update project metadata, budget, or scope | `PROJECT_AGENCY`, `ADMIN` |
| `GET` | `/projects/{id}/summary` | Get aggregated KPI cards (Land Acquired, Disbursed Cr, PAFs, Risk) | All Roles |
| `GET` | `/projects/{id}/alignment` | Retrieve project GeoJSON alignment corridor & right-of-way buffer | All Roles |
| `POST` | `/projects/{id}/alignment` | Upload/Replace alignment GeoJSON/KML file | `PROJECT_AGENCY` |

---

### 2.3 Acquisition Workflow & State Machine (`/api/v1/workflow`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/workflow/stages` | Get list of all 11 statutory stages with descriptions & SLA rules | All Roles |
| `GET` | `/workflow/projects/{id}/history` | Get immutable timeline of all stage transitions & approval notes | All Roles |
| `POST` | `/workflow/projects/{id}/transition` | Transition project to next stage (validates statutory guards) | `DISTRICT_OFFICER`, `CENTRAL_OFFICER`, `ADMIN` |
| `GET` | `/workflow/tasks` | Get pending action items for currently logged-in officer | All Roles |
| `POST` | `/workflow/tasks/{id}/action` | Approve, Reject, or Request Revision on a workflow task | Assignee Role |

---

### 2.4 Cadastral Land Parcels (`/api/v1/parcels`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/parcels` | Query parcels by `project_id`, `village_id`, `status`, `is_disputed` | All Roles |
| `POST` | `/parcels` | Create new land parcel entry with Khasra & area | `PROJECT_AGENCY`, `DISTRICT_OFFICER` |
| `POST` | `/parcels/bulk-import` | Bulk import Khasra roster via CSV/Excel template | `PROJECT_AGENCY`, `DISTRICT_OFFICER` |
| `GET` | `/parcels/{id}` | Get parcel detail (ownership shares, valuation breakdown, status) | All Roles |
| `PUT` | `/parcels/{id}` | Update parcel area, land type, or boundary | `DISTRICT_OFFICER`, `FIELD_OFFICER` |
| `POST` | `/parcels/{id}/verify` | Submit field verification report, tree/structure count & photo | `FIELD_OFFICER` |

---

### 2.5 Landowners & KYC (`/api/v1/owners`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/owners` | List landowners with search by name, mobile, or Khasra | All Roles |
| `POST` | `/owners` | Register landowner profile (Aadhaar, PAN, Bank Details) | `DISTRICT_OFFICER`, `FIELD_OFFICER` |
| `GET` | `/owners/{id}` | Get landowner profile with owned parcels & disbursement status | All Roles |
| `POST` | `/owners/{id}/verify-kyc` | Trigger mock DigiLocker & Bank account name match check | `DISTRICT_OFFICER` |
| `POST` | `/owners/link-parcel` | Map landowner to parcel with ownership share percentage | `DISTRICT_OFFICER` |

---

### 2.6 Notifications & Objections (`/api/v1/notifications`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/notifications` | List statutory notifications for a project | All Roles |
| `POST` | `/notifications` | Draft Section 11 / Section 19 notification | `DISTRICT_OFFICER` |
| `POST` | `/notifications/{id}/publish` | Publish notification to e-Gazette and set 60-day objection timer | `DISTRICT_OFFICER`, `STATE_OFFICER` |
| `GET` | `/notifications/{id}/objections` | List Section 15 objections filed by landowners | All Roles |
| `POST` | `/notifications/{id}/objections` | Record new objection or claim | `DISTRICT_OFFICER`, `FIELD_OFFICER` |
| `POST` | `/notifications/objections/{id}/dispose` | Record CALA hearing order (Accept/Reject with reasoned order) | `DISTRICT_OFFICER` |

---

### 2.7 Configurable Compensation Assessment (`/api/v1/compensation`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/compensation` | List compensation assessments with filtering (project, state, district, status, search, pagination) | All Roles (Scoped) |
| `POST` | `/compensation` | Create formal compensation assessment for a verified parcel | `DISTRICT_OFFICER`, `ADMIN` |
| `POST` | `/compensation/calculate` | Compute trial compensation under configurable statutory framework | All Roles |
| `GET` | `/compensation/{id}` | Get 360° calculation breakdown (Base Land, Factors, Assets, Statutory Additional Amount, Solatium) | All Roles (Scoped) |
| `POST` | `/compensation/{id}/approve` | CALA review and formal sanction decision (`APPROVED` / `REJECTED`) | `DISTRICT_OFFICER`, `ADMIN` |
| `POST` | `/compensation/{id}/assets` | Add asset valuation line items (structures, trees, borewells) | `FIELD_OFFICER`, `DISTRICT_OFFICER`, `ADMIN` |

> **Calculation Formula**:  
> Market / Base Land Value + Applicable Land Value Factors + Asset / Structure Valuation + Applicable Statutory Additional Amounts + Applicable Solatium = Configurable Compensation Assessment

---

### 2.8 Section 23/30 Statutory Awards (`/api/v1/awards`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/awards` | List declared Section 23/30 awards with filtering and pagination | All Roles (Scoped) |
| `POST` | `/awards` | Generate statutory award linking approved compensation assessments | `DISTRICT_OFFICER`, `ADMIN` |
| `GET` | `/awards/{id}` | Get award details, covered parcels list, disbursements summary, and approval stamp | All Roles (Scoped) |
| `PATCH` | `/awards/{id}/status` | Transition award status (`UNDER_REVIEW`, `APPROVED`, `ISSUED`, `CLOSED`) | `DISTRICT_OFFICER`, `ADMIN` |
| `POST` | `/awards/{id}/sign` | Apply **Demo e-Sign / Approval Stamp** (cryptographic audit hash) | `DISTRICT_OFFICER`, `ADMIN` |

---

### 2.9 PFMS-Compatible / Simulated Payment Workflow (`/api/v1/disbursements`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/disbursements` | List disbursement records with masked bank accounts/IFSC, PFMS status & UTRs | All Roles (Scoped) |
| `POST` | `/disbursements/initiate-batch` | Push approved award compensation batch to simulated PFMS DBT workflow | `DISTRICT_OFFICER`, `ADMIN` |
| `GET` | `/disbursements/{id}` | Full transaction detail with masked beneficiary data and gateway audit | All Roles (Scoped) |
| `POST` | `/disbursements/{id}/process` | Process transaction or simulate PFMS callback with mock bank UTR | `DISTRICT_OFFICER`, `ADMIN` |
| `GET` | `/disbursements/summary/{project_or_award_id}` | Financial reconciliation ledger ($Disbursed \le Awarded$; Outstanding = Awarded - Disbursed) | All Roles (Scoped) |

---

### 2.10 Section 38 Possession Handover (`/api/v1/possession`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/possession` | List land possession records, status, and encumbrance flags | All Roles (Scoped) |
| `POST` | `/possession` | Record Section 38 regular handover or Section 40 urgency exceptional pathway | `DISTRICT_OFFICER`, `ADMIN` |
| `GET` | `/possession/{id}` | Get possession detail, prerequisite compliance checks (4 checks), and certificate view | All Roles (Scoped) |
| `PATCH` | `/possession/{id}/status` | Update possession takeover status (`TAKEN`, `SCHEDULED`, `DISPUTED`, `CANCELLED`) | `DISTRICT_OFFICER`, `ADMIN` |

---

### 2.11 Rehabilitation & Resettlement Schemes (`/api/v1/r-and-r`) — Phase 6

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/r-and-r` | List R&R schemes with progress KPIs, family counts, and budget utilization | All Roles (Scoped) |
| `GET` | `/r-and-r/{id}` | 360° scheme detail with progress funnel, covered families, allotments, and authority metadata | All Roles (Scoped) |
| `POST` | `/r-and-r` | Create new R&R scheme for a project | `DISTRICT_OFFICER`, `STATE_OFFICER`, `ADMIN` |
| `PATCH` | `/r-and-r/{id}` | Update scheme metadata (budget, status, target dates) | `DISTRICT_OFFICER`, `ADMIN` |
| `PATCH` | `/r-and-r/{id}/status` | Advance scheme lifecycle status (`DRAFT` → `APPROVED` → `IN_PROGRESS` → `COMPLETED`) | `DISTRICT_OFFICER`, `ADMIN` |

---

### 2.12 Affected Families & Configurable Eligibility (`/api/v1/affected-families`) — Phase 6

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/affected-families` | List PAF/PDF records with eligibility, khasra linkage, and R&R scheme filters | All Roles (Scoped) |
| `GET` | `/affected-families/{id}` | 360° family detail with complete 7-node acquisition trace (Project → Parcel → Owner → Compensation → Award → Disbursement → Possession → R&R) and allotments ledger | All Roles (Scoped) |
| `POST` | `/affected-families` | Enumerate and register an affected family under an R&R scheme | `DISTRICT_OFFICER`, `FIELD_OFFICER`, `ADMIN` |
| `PATCH` | `/affected-families/{id}/eligibility` | Record Configurable R&R Eligibility Assessment decision with statutory basis and audit trail | `DISTRICT_OFFICER`, `ADMIN` |
| `PATCH` | `/affected-families/{id}/status` | Update rehabilitation lifecycle status (`ENUMERATED` → `ELIGIBILITY_VERIFIED` → `PLOT_ALLOTTED` → `SETTLED`) | `DISTRICT_OFFICER`, `FIELD_OFFICER`, `ADMIN` |
| `POST` | `/affected-families/{id}/allotments` | Record entitlement / plot allotment for an affected family with scheme budget tracking | `DISTRICT_OFFICER`, `ADMIN` |

---

### 2.13 GIS & Spatial Services (`/api/v1/gis`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/gis/projects/{id}/layers` | Get consolidated GeoJSON containing alignment buffer + all parcels | All Roles |
| `GET` | `/gis/parcels/{id}/geojson` | Get single parcel geometry with metadata and ownership popup | All Roles |
| `POST` | `/gis/spatial-check` | Check if uploaded KML intersects protected forest or water bodies | `PROJECT_AGENCY`, `DISTRICT_OFFICER` |

---

### 2.14 Document Management & SHA-256 Integrity (`/api/v1/documents`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `POST` | `/documents/upload` | Upload document; computes & stores SHA-256 integrity hash | Authenticated |
| `GET` | `/documents/{id}` | Get document metadata and download stream | Authenticated |
| `POST` | `/documents/{id}/verify-hash` | Verify stored cryptographic hash against real-time payload | All Roles |

---

### 2.15 Analytics, Predictive Risk Intelligence & MIS Reports (`/api/v1/analytics`, `/api/v1/risk`, `/api/v1/reports`)

#### Analytics Endpoints (`/api/v1/analytics`)
| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/analytics/overview` | National command overview with KPIs, 8-stage funnel, and progress breakdowns | All Roles (Scoper Enforced) |
| `GET` | `/analytics/states` | State-wise land acquisition, financial, possession, and R&R metrics | Central, State Officers, Admin |
| `GET` | `/analytics/districts` | District-wise metrics drill-down for a specified state | Central, State, District Officers, Admin |
| `GET` | `/analytics/time-series` | Real-timestamp milestone time-series (projects, awards, disbursements, possession) | All Roles |
| `GET` | `/analytics/bottlenecks` | Active bottlenecks, overdue tasks, disbursement lags with risk classifications | All Roles |
| `GET` | `/analytics/data-quality` | Automated financial and land reconciliation integrity audits | Admin, Central Officers |

#### Risk Intelligence Endpoints (`/api/v1/risk`)
| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/risk/overview` | National risk overview, 0-100 score distribution, 5-factor benchmarks, and high-risk projects leaderboard | All Roles |
| `GET` | `/risk/projects/{id}` | Detailed 5-factor risk score breakdown, contributing drivers, and decision-support guidance for a project | All Roles |

#### Statutory MIS Reporting Endpoints (`/api/v1/reports`)
| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/reports/types` | List available statutory MIS report template types and descriptions | All Roles |
| `GET` | `/reports/preview` | Generate live paginated preview of chosen MIS report with summary KPIs | All Roles (Scoped) |
| `GET` | `/reports/export/pdf` | Download official government-formatted PDF report via ReportLab | All Roles (Scoped) |
| `GET` | `/reports/export/excel` | Download structured multi-sheet `.xlsx` workbook via OpenPyXL | All Roles (Scoped) |

---

### 2.16 Alerts & Audit Trails (`/api/v1/alerts` & `/audit`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/alerts` | Get active statutory alerts (Section 25 lapse warnings, payment bounced) | All Roles |
| `POST` | `/alerts/{id}/resolve` | Mark alert resolved with resolution notes | `DISTRICT_OFFICER`, `ADMIN` |
| `GET` | `/audit/logs` | Query tamper-proof audit trail filtered by project, user, or date | `ADMIN`, `CENTRAL_OFFICER` |

---

### 2.17 Government Integration Gateway (`/api/v1/integrations`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/integrations/` | List all 4 sandbox integration gateways (Bhulekh, Bhuvan, PFMS, SMS) | All Roles |
| `POST` | `/integrations/{code}/test-sync` | Execute live contract simulation test with latency telemetry and audit hash | `ADMIN`, `CENTRAL_OFFICER`, `DISTRICT_OFFICER` |

---

### 2.18 Master Data & Taxonomy (`/api/v1/master-data`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/master-data/geography` | Retrieve administrative hierarchy (State → District → Tehsil → Village) | All Roles |
| `GET` | `/master-data/taxonomy` | Retrieve lifecycle stages, land parcel types, and R&R entitlement taxonomies | All Roles |
| `GET` | `/master-data/statutory-parameters` | Retrieve RFCTLARR calculation constants (Solatium 100%, 12% interest, SLAs, Risk weights) | All Roles |

---

### 2.19 Document Vault & Version Control (`/api/v1/documents`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/documents/` | List repository documents with version and hash metadata | All Roles |
| `GET` | `/documents/{id}` | Get document 360° detail with complete version history chain | All Roles |
| `GET` | `/documents/{id}/versions` | Get isolated version history chain for a document | All Roles |
| `POST` | `/documents/upload` | Upload a new statutory document or subsequent version revision | `ADMIN`, `DISTRICT_OFFICER`, `PROJECT_AGENCY` |
| `POST` | `/documents/{id}/verify-hash` | Cryptographically verify SHA-256 integrity against gazette records | All Roles |

---

### 2.20 Field Officer Mobile Survey Workflow (`/api/v1/field`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/field/assigned-parcels` | List assigned land parcels for field ground survey | `FIELD_OFFICER`, `DISTRICT_OFFICER`, `ADMIN` |
| `POST` | `/field/parcels/{id}/verify` | Submit 4-point verification checklist, GPS coordinates, tree count (Draft/CALA) | `FIELD_OFFICER`, `DISTRICT_OFFICER`, `ADMIN` |

