# State Officer Role & State Acquisition Control Center (Phase 11C)

## 1. Role Purpose & Statutory Mandate

The **`ROLE_STATE_OFFICER`** represents the **State Revenue & Land Acquisition Supervisory Authority** under the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 2013)**.

In the NLAMS governance hierarchy:

```
NATIONAL MANDATE
      ↓
CENTRAL OFFICER (National Acquisition Command)
      ↓
STATE OFFICER (State Acquisition Control Center - e.g. Rajasthan Revenue Dept)
      ↓
DISTRICT / CALA (Competent Authority Land Acquisition & Collector Courts)
      ↓
TEHSIL / FIELD (Ground Surveyors & Revenue Patwaris)
      ↓
VILLAGE
      ↓
LAND PARCEL
```

The State Officer provides **state-wide supervisory oversight** across all subordinate districts, CALA courts, implementing agencies, and corridor packages operating within their state boundary.

---

## 2. Jurisdiction & Security Boundary

- **Jurisdiction**: Strictly **ONE STATE** (e.g. `IN-RJ` Rajasthan).
- **Security Scoping**:
  - The State Officer's jurisdiction is **derived strictly from their authenticated session** (`current_user.state_id`).
  - No query parameter (e.g. `?state_id=IN-GJ`) or frontend token can grant access to another state's records.
  - A Rajasthan State Officer (`state_rj_officer`) can **never** access records from Gujarat, Haryana, Delhi, Uttar Pradesh, or Maharashtra.
- **Data Isolation**:
  - All projects, land parcels, compensation awards, PFMS disbursements, possession orders, R&R schemes, and audit trails are filtered server-side by `District.state_id == current_user.state_id`.

---

## 3. Separation of Visibility vs. Operational Authority

| Capability | Allowed for State Officer | Restricted / Prohibited |
| :--- | :---: | :---: |
| **State-Wide Oversight** | **YES** (All state projects, districts, corridors) | Cross-state data |
| **District Performance Monitoring** | **YES** (Jaipur, Alwar, Dausa, Kotputli-Behror) | Other states' districts |
| **Review Section 11 & 19 Notifications** | **YES** (State Gazette oversight) | Altering ground surveyor GPS data |
| **Monitor Compensation & Awards** | **YES** (Sec 23 valuation & award tracking) | Altering CALA award amounts directly |
| **Monitor PFMS Disbursement** | **YES** (Tracking DBT success/failure rates) | Directly triggering treasury payments |
| **Monitor Section 38 Possession** | **YES** (Encumbrance-free handover progress) | Modifying field cadastral geometry |
| **Monitor R&R Schemes** | **YES** (PAF/PDF entitlements & colony progress)| Altering beneficiary survey records |
| **Supervise Escalations & Directives** | **YES** (Directing CALAs to resolve SLA breaches) | Unilateral evidence overriding |

---

## 4. State Acquisition Control Center Dashboard (`/dashboard`)

When authenticated as `ROLE_STATE_OFFICER`, `/dashboard` automatically renders the **State Acquisition Control Center**:

### A. State Header
- **Title**: `STATE ACQUISITION CONTROL CENTER`
- **Identity**: Officer Name, Role: `State Officer`, Jurisdiction: `Rajasthan`
- **Controls**: Live Telemetry Refresh indicator, State MIS Report export.

### B. 12 State Statutory KPIs
1. **Total Projects**: Total infrastructure corridor packages in state.
2. **Active Districts**: Subordinate districts with active Section 11/19 acquisition.
3. **Land Proposed (Acres)**: Total statutory land demand from Implementing Agencies.
4. **Land Acquired (Acres / %)**: Statutory land acquired under Section 19/23.
5. **Land Pending (Acres)**: Land under survey, hearing, or valuation.
6. **Compensation Assessed (₹ Cr)**: Aggregate market valuation under Sections 26–30.
7. **Compensation Awarded (₹ Cr)**: Formal awards declared under Section 23/30.
8. **Compensation Disbursed (₹ Cr / %)**: Direct benefit transfers credited via PFMS.
9. **Possession Taken (Acres / %)**: Section 38 encumbrance-free handovers.
10. **Affected Families (PAFs)**: PAFs enumerated under Second Schedule.
11. **Projects At Risk**: Corridor packages with risk scores $\ge 50$ or SLA alerts.
12. **Overdue District Tasks**: Administrative and judicial tasks exceeding statutory SLAs.

### C. Subordinate District Performance Matrix
- Comparative matrix displaying all districts in state:
  - `District`, `Projects`, `Proposed`, `Acquired`, `Acq %`, `Assessed`, `Disbursed`, `Possession %`, `R&R %`, `Overdue Tasks`, `Risk`, `Status`.
- Supports column sorting, search query filtering, risk filters, and status filters.
- Clicking any district drills down to district projects.

### D. District Escalation Queue
- Surfaces real operational bottlenecks from CALA courts and revenue tehsils:
  - Section 15(2) hearing report delays
  - PFMS bank account / Aadhaar mismatches
  - Stage-II Forest Clearance encumbrance stalls
  - R&R colony plot boundary demarcation delays

### E. State Attention Required
- Actionable supervisory directives:
  - Directing District Collectors to conduct expedited summary hearings
  - Authorizing special bank validation camps for delayed PFMS beneficiaries
  - Convening joint inter-departmental reviews with Forest & Environment departments

### F. Specialized Monitoring Modules
- **State Compensation Monitoring**: Assessed $\rightarrow$ Awarded $\rightarrow$ Disbursed $\rightarrow$ Pending comparison with district breakdown.
- **State Possession Monitoring**: Demanded $\rightarrow$ Handed Over $\rightarrow$ Pending handover with forest/R&R dependency indicators.
- **State R&R Welfare Monitoring**: PAF enumeration $\rightarrow$ Eligibility certification $\rightarrow$ Colony plot allotment $\rightarrow$ Resettlement status.

---

## 5. State Officer Navigation Hierarchy (Sidebar)

```
DASHBOARD
└── State Control Center (/dashboard)

STATE OVERSIGHT
├── Projects (/projects)
├── Districts (/analytics)
└── District Performance (/analytics)

LAND & GIS
├── State GIS (/gis)
└── Land Parcels (/land-parcels)

ACQUISITION
├── Workflow (/workflow)
├── Compensation (/compensation)
├── Awards (/awards)
├── Disbursement (/disbursements)
└── Possession (/possession)

R&R
├── Affected Families (/affected-families)
└── R&R Schemes (/r-and-r)

INTELLIGENCE
├── Analytics (/analytics)
└── Risk Intelligence (/analytics/risk)

REPORTS
├── State Acquisition Report (/reports)
└── Executive Reports (/reports)

SYSTEM
└── Documents (/documents)
```

---

## 6. API Architecture

### `GET /api/v1/dashboard/state`
- **RBAC Gating**: `ROLE_STATE_OFFICER`, `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`.
- **Behavior**: Derives state automatically from `current_user.state_id` (`IN-RJ`).
- **Response Structure**:
  ```json
  {
    "success": true,
    "data": {
      "scope_level": "STATE",
      "jurisdiction_name": "Rajasthan (State Control Center)",
      "state_id": "IN-RJ",
      "state_name": "Rajasthan",
      "kpis": { ... },
      "district_performance": [ ... ],
      "district_escalations": [ ... ],
      "state_attention": [ ... ],
      "state_compensation": { ... },
      "state_possession": { ... },
      "state_randr": { ... },
      "funnel": [ ... ],
      "critical_projects": [ ... ],
      "risk_summary": { ... },
      "trends": { ... }
    }
  }
  ```

---

## 7. Canonical Demo Flow (SIH Evaluation)

1. **Authentication**:
   - Log in as `state_rj_officer` with password `Password@123`.
2. **Landing**:
   - System automatically detects `ROLE_STATE_OFFICER` with `IN-RJ` jurisdiction.
   - Redirects to `/dashboard` displaying the **State Acquisition Control Center**.
3. **District Drill-Down**:
   - View 12 State KPIs for Rajasthan.
   - Inspect the **District Performance Matrix** (Jaipur, Alwar, Dausa, Kotputli-Behror).
   - Filter by `Critical Risk` $\rightarrow$ Kotputli-Behror is spotlighted.
4. **Project 360 Navigation**:
   - Click *Delhi-Jaipur Expressway Expansion* $\rightarrow$ opens canonical [`/projects/[projectId]`](file:///c:/Users/mrgau/Desktop/SIH%20Antigravity/frontend/src/app/projects/[projectId]/page.tsx).
5. **Supervisory Directives**:
   - Inspect District Escalations and State Attention directives.
   - Review State Compensation, Possession, and R&R modules.
