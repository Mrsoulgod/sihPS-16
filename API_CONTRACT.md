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

### 2.7 Compensation & Solatium Engine (`/api/v1/compensation`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/compensation/parcels/{parcel_id}` | Get RFCTLARR calculation breakdown (Base, Multiplier, Solatium, 12% Interest) | All Roles |
| `POST` | `/compensation/calculate` | Compute trial compensation given land type, circle rate & distance | All Roles |
| `POST` | `/compensation/parcels/{parcel_id}/finalize` | CALA signs and locks statutory compensation calculation | `DISTRICT_OFFICER` |
| `POST` | `/compensation/parcels/{parcel_id}/assets` | Add asset valuation line items (structures, trees, borewells) | `FIELD_OFFICER`, `DISTRICT_OFFICER` |

---

### 2.8 Section 23/30 Awards (`/api/v1/awards`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/awards` | List declared land acquisition awards | All Roles |
| `POST` | `/awards` | Generate Section 23/30 statutory Award document batch | `DISTRICT_OFFICER` |
| `GET` | `/awards/{id}` | Get award details, parcel list, and payment allocation | All Roles |
| `POST` | `/awards/{id}/sign` | Apply CALA digital e-Sign to declare award publicly | `DISTRICT_OFFICER` |

---

### 2.9 Disbursements & DBT / PFMS (`/api/v1/disbursements`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/disbursements` | List disbursement records with PFMS status & UTR numbers | All Roles |
| `POST` | `/disbursements/initiate-batch` | Push approved award compensation batch to PFMS payment gateway | `DISTRICT_OFFICER` |
| `GET` | `/disbursements/batch/{batch_ref}` | Check real-time PFMS batch processing status | All Roles |
| `POST` | `/disbursements/simulate-callback` | **Demo Feature**: Trigger simulated PFMS bank credit callback | `ADMIN`, `DISTRICT_OFFICER` |

---

### 2.10 Section 38 Possession Handover (`/api/v1/possession`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/possession` | List parcels with possession status and handover dates | All Roles |
| `POST` | `/possession/handover` | Issue Section 38 Handover Certificate and mark land encumbrance-free | `DISTRICT_OFFICER`, `PROJECT_AGENCY` |
| `GET` | `/possession/{parcel_id}/certificate` | Generate & download PDF Possession Certificate | All Roles |

---

### 2.11 Rehabilitation & Resettlement (R&R) (`/api/v1/randr`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/randr/projects/{id}` | Get R&R scheme summary (Resettlement site, PAF/PDF counts, spend) | All Roles |
| `GET` | `/randr/families` | List Project Affected & Displaced Families with entitlements | All Roles |
| `POST` | `/randr/families` | Enumerate affected family and compute 2nd Schedule entitlement | `DISTRICT_OFFICER`, `FIELD_OFFICER` |
| `POST` | `/randr/allot-plot` | Allot homestead plot in resettlement colony | `DISTRICT_OFFICER` |
| `POST` | `/randr/disburse-grant` | Disburse R&R subsistence & transportation grant | `DISTRICT_OFFICER` |

---

### 2.12 GIS & Spatial Services (`/api/v1/gis`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/gis/projects/{id}/layers` | Get consolidated GeoJSON containing alignment buffer + all parcels | All Roles |
| `GET` | `/gis/parcels/{id}/geojson` | Get single parcel geometry with metadata and ownership popup | All Roles |
| `POST` | `/gis/spatial-check` | Check if uploaded KML intersects protected forest or water bodies | `PROJECT_AGENCY`, `DISTRICT_OFFICER` |

---

### 2.13 Document Management & SHA-256 Integrity (`/api/v1/documents`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `POST` | `/documents/upload` | Upload document; computes & stores SHA-256 integrity hash | Authenticated |
| `GET` | `/documents/{id}` | Get document metadata and download stream | Authenticated |
| `POST` | `/documents/{id}/verify-hash` | Verify stored cryptographic hash against real-time payload | All Roles |

---

### 2.14 Analytics, MIS Reports & Risk Radar (`/api/v1/analytics` & `/reports`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/analytics/national-kpis` | National dashboard aggregate metrics (Acres, Spend, PAFs, Delays) | `CENTRAL_OFFICER`, `STATE_OFFICER`, `ADMIN` |
| `GET` | `/analytics/projects/{id}/risk-breakdown` | Predictive risk score breakdown across 5 RFCTLARR risk factors | All Roles |
| `GET` | `/analytics/bottlenecks` | Identification of stage bottlenecks exceeding statutory SLAs | `CENTRAL_OFFICER`, `STATE_OFFICER` |
| `GET` | `/reports/mis/project-status` | Generate standardized MIS executive summary report (PDF/Excel data) | All Roles |

---

### 2.15 Alerts & Audit Trails (`/api/v1/alerts` & `/audit`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/alerts` | Get active statutory alerts (Section 25 lapse warnings, payment bounced) | All Roles |
| `POST` | `/alerts/{id}/resolve` | Mark alert resolved with resolution notes | `DISTRICT_OFFICER`, `ADMIN` |
| `GET` | `/audit/logs` | Query tamper-proof audit trail filtered by project, user, or date | `ADMIN`, `CENTRAL_OFFICER` |

---

### 2.16 Mock Government Integrations (`/api/v1/mock-integrations`)

| Method | Endpoint | Description | Role Scope |
|---|---|---|---|
| `GET` | `/mock-integrations/bhulekh/khasra/{khasra_no}` | Query simulated State Land Records database for title & mutation | All Roles |
| `POST` | `/mock-integrations/pfms/simulate-dbt` | Trigger simulated PFMS bulk bank transfer | `DISTRICT_OFFICER`, `ADMIN` |
| `GET` | `/mock-integrations/digilocker/verify-aadhaar/{aadhaar}`| Simulated instant Aadhaar demographic verification | `FIELD_OFFICER`, `DISTRICT_OFFICER` |
