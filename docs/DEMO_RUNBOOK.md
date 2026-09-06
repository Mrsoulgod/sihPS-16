# NLAMS — System Operator & Demo Runbook
**System**: National Land Acquisition & Management System (NLAMS)  
**Target Environment**: Local Developer / Presentation Laptop / Judge Stand  
**Target Audience**: Pitch Presenter, Technical Operator, Jury Validator

---

## 1. System Architecture & Port Allocation

| Component | Technology | Default Port | Health Check URL | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Database** | PostgreSQL 16 + PostGIS 3.4 | `5432` | `pg_isready -p 5432` | Docker container `nlams_postgres` or native service |
| **Backend API** | FastAPI (Python 3.12+) | `8000` | `http://localhost:8000/api/v1/health` | Async ASGI service with SQLAlchemy 2.0 |
| **Frontend UI** | Next.js 14+ (App Router) | `3000` | `http://localhost:3000` | Server + Static hybrid with Tailwind CSS |

---

## 2. Pre-Flight Checklist (Run 15 Minutes Before Demo)

- [ ] **Docker Engine / PostgreSQL** active and responding on `localhost:5432`.
- [ ] **Database initialized & seeded** with the canonical flagship dataset (`PRJ-NH48-PKG4`).
- [ ] **Backend service** running in a dedicated terminal window on port `8000`.
- [ ] **Frontend service** running in a dedicated terminal window on port `3000`.
- [ ] Browser window opened in **Chrome / Edge / Firefox** in full-screen or 100% zoom at `http://localhost:3000/login`.
- [ ] Demo credentials verified and pre-tested.
- [ ] Internet connection verified (or Leaflet cached tiles ready for offline demo).

---

## 3. Step-by-Step Operator Startup Sequence

### Step 1: Start PostgreSQL + PostGIS
#### Option A: Docker (Preferred)
```powershell
# From the project root (c:\Users\mrgau\Desktop\SIH Antigravity):
docker compose up -d postgres

# Verify container health:
docker ps --filter "name=nlams_postgres"
```

#### Option B: Local Native PostgreSQL Service
If running native Windows PostgreSQL service:
```powershell
net start postgresql-x64-16
```

### Step 2: Seed / Reconcile Canonical Demo Data
```powershell
cd backend
.\.venv\Scripts\python app/seed/demo_data.py
.\.venv\Scripts\python app/seed/seed_phase5.py
.\.venv\Scripts\python app/db/seed_randr.py
```

### Step 3: Launch FastAPI Backend
```powershell
cd backend
.\.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Verify output*:
```
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Step 4: Launch Next.js Frontend
```powershell
cd frontend
npm run dev
# OR for production-optimized demo:
npm start
```
*Verify output*:
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 1.2s
```

---

## 4. Canonical Demo Accounts & Role Hierarchy

NLAMS does not use fake frontend role switching dropdowns. In accordance with statutory governance protocols, role and jurisdiction are inherent to authenticated user identity:

`USER ID + PASSWORD + AUTHENTICATED SESSION + ROLE + JURISDICTION = AUTHORIZED NLAMS EXPERIENCE`

| Operational Role | Canonical Role Code | Username | Password | Jurisdiction Level | Scope & Authorized Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Central Ministry Officer** | `ROLE_CENTRAL_OFFICER` | `central_admin` | `Password@123` | `CENTRAL` (National) | National pipeline oversight, central sanctions, all states/districts |
| **State Revenue Officer** | `ROLE_STATE_OFFICER` | `state_rj_officer` | `Password@123` | `STATE` (Rajasthan) | State-wide gazette oversight, Section 19 reviews, Rajasthan districts |
| **District Collector / CALA** | `ROLE_DISTRICT_OFFICER` | `cala_jaipur` | `Password@123` | `DISTRICT` (Jaipur) | Section 15 hearings, Section 23 awards, PFMS DBT authorizations |
| **Project Implementing Agency** | `ROLE_PROJECT_AGENCY` | `nhai_pd_jaipur` | `Password@123` | `PROJECT` (NHAI NH-48) | Alignment DPR proposals, compensation escrow deposits, possession requests |
| **Field Survey Officer (Patwari)**| `ROLE_FIELD_OFFICER` | `patwari_kotputli` | `Password@123` | `FIELD` (Tehsil Kotputli) | Ground truthing, asset valuation, KYC surveys, GeoJSON verification |
| **Social Development & R&R Officer**| `ROLE_SOCIAL_OFFICER` | `randr_jaipur` | `Password@123` | `SOCIAL` (Jaipur District) | R&R schemes, PAF family census, entitlement matrix, land allotments |
| **System Administrator** | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | `admin` | `Password@123` | `CENTRAL` (Platform) | Apex system configuration, security audit trail, user governance |

---

## 5. Role Transition & Demonstration Procedure

To demonstrate another statutory role during an evaluation or pitch:

1. **Logout**: Click the clearly labeled **Logout** button in the top right institutional header.
2. **Return to Sign-In**: The client-side session, JWT credentials, and cached profile are invalidated and cleared, redirecting to `/login`.
3. **Select Target Officer**: Click the target officer's quick-sign-in persona card (or type their username and password `Password@123`).
4. **Authenticate**: Click **Authenticate & Enter Platform**.
5. **Authorized Session Received**: The FastAPI backend validates credentials, mints a signed JWT with server-verified role and jurisdiction claims, and logs an immutable `AUTH_LOGIN_SUCCESS` audit event.
6. **Scoped Experience**: The frontend loads the dashboard, navigation sidebar, and action permissions genuinely scoped to that officer's tier.

---

## 6. Rapid Verification & Health Smoke Test


Run these verification commands in PowerShell to ensure 100% demo readiness:

```powershell
# 1. Verify Backend Health & PostGIS connection:
curl http://localhost:8000/api/v1/health

# Expected response:
# {"success":true,"data":{"status":"healthy","database_status":"connected",...}}

# 2. Verify Flagship Project Record:
curl http://localhost:8000/api/v1/projects/PRJ-NH48-PKG4

# 3. Verify Frontend Static Build Integrity:
cd frontend
npm run build
```

---

## 6. Troubleshooting & Live Fallback Procedures

### Scenario A: Port 8000 or 3000 Already in Use
```powershell
# Find process holding port 8000:
netstat -ano | findstr :8000
# Kill process by PID:
taskkill /PID <PID> /F

# Find process holding port 3000:
netstat -ano | findstr :3000
# Kill process by PID:
taskkill /PID <PID> /F
```

### Scenario B: Database Connection Refused (`[WinError 1225]`)
1. Check Docker Desktop system tray icon to ensure Docker is green and active.
2. If Docker Desktop was recently started, wait 30 seconds for the engine pipe to initialize.
3. If PostgreSQL container is stopped:
   ```powershell
   docker start nlams_postgres
   ```
4. Verify port 5432:
   ```powershell
   Test-NetConnection -ComputerName 127.0.0.1 -Port 5432
   ```

### Scenario C: Browser Caching Stale Tokens
If experiencing 401/403 or unexpected redirect during role transitions:
1. Press `Ctrl + Shift + R` (Hard Reload).
2. Or clear local storage: Press `F12` → Console → `localStorage.clear()` → Reload.

---

## 7. Judge FAQ Quick Reference

| Jury Question | Key Technical Answer | Reference Screen |
| :--- | :--- | :--- |
| **"How do you ensure landowners receive fair market value?"** | "We implement the statutory formula under Section 26: multiplying circle rate/recent sale deed average by the rural multiplication factor (1.5–2.0×), adding 100% Solatium (Sec 30(1)) and 12% additional interest (Sec 30(3))." | `/compensation` |
| **"What prevents projects from missing the 12-month Section 25 deadline?"** | "Automated SLA tracking monitors the elapsed duration between Section 11(1) and Section 19(1). Red alerts trigger at 90, 60, and 30 days before lapse." | `/dashboard` & `/workflow` |
| **"How do you handle PII privacy under the Digital Personal Data Protection (DPDP) Act?"** | "Aadhaar numbers and personal phone numbers are masked in all API responses using SHA-256 masking (`XXXX-XXXX-1234`), except for authenticated CALA disbursing officers." | `/land-parcels` & `/disbursements` |
| **"Can an unauthorized user push a stage transition?"** | "No. We enforce strict role-based access control (RBAC) with database-backed permission matrix and immutable audit trails for every transition." | `/workflow` |
