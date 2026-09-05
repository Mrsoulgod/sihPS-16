# National Land Acquisition & Management System (NLAMS)
## Design System & Product UI/UX Architecture

---

## 1. Product Experience Architecture

NLAMS operates under a strict **Two-Tier Experience Model**:

```
                                 [ NLAMS PLATFORM ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
[ TIER 1: PUBLIC TRANSPARENCY WEBSITE ]         [ TIER 2: AUTHENTICATED OPERATIONS PLATFORM ]
• Unauthenticated access                        • Strict RBAC JWT Authentication
• Editorial, data-first public portal           • Government Command Center (`/dashboard`)
• Inspired by Empowered Indian aesthetic        • Operational Workflow & Task Inbox
• Statutory education & transparency            • Cadastral GIS & Ground Verification
• Routes: /, /about, /how-it-works,             • Routes: /dashboard, /projects, /land-parcels,
  /transparency, /overview, /login                /workflow, /gis
```

---

## 2. Visual & Information Design Principles

Inspired by modern national data platforms (e.g. `empoweredindian.in`):
- **Editorial & Institutional**: Authoritative typography with high-contrast serif headlines (`font-serif`, `tracking-tight`).
- **Data-First**: Large, prominent statistics (`font-serif text-3xl/4xl font-black`) accompanied by clear unit descriptors and sub-metrics.
- **Spacious Whitespace**: Generous section padding (`py-16 sm:py-20`), uncluttered layouts, clear visual hierarchy without boxing every element into generic SaaS cards.
- **Restrained Visual Language**: Avoids neon colors, excessive gradients, gratuitous glassmorphism, and bloated animations.

---

## 3. Color Token System

| Token | Hex Value | Semantic Usage |
|---|---|---|
| **India Green (Primary Accent)** | `#138808` / `emerald-700` | Primary CTAs, active navigation items, progress indicators, positive status |
| **Institutional Navy (Neutral)** | `#0B2545` / `slate-950` | Primary typography, institutional logo badges, apex bar, command headers |
| **Saffron (Statutory Accent)** | `#FF9933` | National tricolor top stripe |
| **National Tricolor Accent Bar** | Saffron (33.3%) + White (33.3%) + India Green (33.3%) | Top border on all public and operational headers |
| **Canvas Background** | `#F8FAFC` (slate-50) | Neutral, glare-free institutional canvas |
| **Card Surface** | `#FFFFFF` with `border-slate-200` | Crisp, high-contrast surface with minimal elevation |
| **Warning / At-Risk** | `#D97706` / `amber-600` | SLA nearing deadline, inquiry hearings pending |
| **Critical / Overdue** | `#DC2626` / `rose-600` | Disputed boundaries, overdue statutory tasks |

---

## 4. Public Route Specifications

### `/` — Home / Landing Page
- Institutional Hero with National headline and dual CTAs: "Explore National Overview" & "Government Officer Login".
- National Land Acquisition at a Glance: Live telemetry (Projects, Acres Proposed, Acres Acquired, Compensation Disbursed, R&R Progress).
- How It Works: Visual overview of all 12 statutory acquisition stages.
- National Progress: Physical possession, formal awards, and PFMS disbursement progress bars.
- State-wise Progress: Live comparative performance table of participating states.
- Transparency by Design: Three pillars of statutory compliance, privacy safeguards, and multi-agency alignment.
- Government Operations Showcase: Role-based operational features overview.

### `/about` — About NLAMS
- Contextual problem statement: Why paper-based fragmented systems create severe infrastructure delays and litigations.
- Mission and statutory role of NLAMS under RFCTLARR Act, 2013.
- Comprehensive matrix of the six key stakeholder groups.

### `/how-it-works` — Complete 12-Stage Lifecycle
- Interactive visual stepper covering:
  `Proposal` → `Scrutiny` → `Land Identification` → `Land Verification` → `Notification` → `Objection / Hearing` → `Compensation Assessment` → `Award` → `Disbursement` → `Possession` → `R&R` → `Completion`.
- Detailed breakdown for each stage: What happens, Responsible authority, Key data generated, Statutory deliverable.

### `/transparency` — Public Transparency Portal
- Real-time aggregate disclosures.
- State-wise filterable acquisition disclosures.
- **Privacy Charter**: Explicit distinction between publicly disclosed aggregates vs strictly masked citizen personal data (no Aadhaar, no bank accounts, no PII).

### `/overview` — Public National Overview
- Corridor health pipeline metrics (On Track, At Risk, Delayed, Completed).
- Filterable search and stage directory of national infrastructure corridors.

### `/login` — Government Officer Portal Login
- Unified institutional visual design matching the public portal.
- Secure officer credential authentication.
- 1-Click Fast Demo Login for evaluators across all 6 statutory roles.
- Direct navigation link back to the Public Transparency Portal.

---

## 5. Citizen Privacy & Data Protection Charter

Under statutory land acquisition regulations and the Digital Personal Data Protection (DPDP) Act:
1. **Masked Identifiers**: Citizen Aadhaar numbers and bank accounts are strictly masked across all responses.
2. **Aggregated Public Metrics**: Only corridor-level, state-level, and project-level totals are accessible without authentication.
3. **Audit Trail**: Every officer access to cadastral land parcels and compensation awards is permanently logged in the database audit log.
