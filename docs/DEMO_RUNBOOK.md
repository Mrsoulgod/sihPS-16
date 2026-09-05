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

## 4. Demo Role Credentials Matrix

The system includes pre-seeded institutional accounts representing each tier of governance under the RFCTLARR Act 2013:

| Role Title | Role Code | Username | Email | Password | Primary Jurisdiction |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Central Admin** | `SUPER_ADMIN` | `central_admin` | `central_officer@nlams.gov.in` | `Password@123` | National (All 4 States) |
| **State Officer** | `STATE_OFFICER` | `state_rj_officer` | `state_officer@nlams.gov.in` | `Password@123` | Rajasthan State Revenue Dept |
| **District Collector / CALA** | `DISTRICT_OFFICER` | `cala_jaipur` | `cala_jaipur@nlams.gov.in` | `Password@123` | Jaipur District (CALA NH-48) |
| **Acquiring Agency Officer** | `PROJECT_AGENCY` | `nhai_pd_jaipur` | `nhai_agency@nlams.gov.in` | `Password@123` | NHAI Project Implementation Unit |
| **Field Verification Officer** | `FIELD_OFFICER` | `patwari_kotputli` | `patwari_kotputli@nlams.gov.in` | `Password@123` | Kotputli Tehsil / Field Survey |
| **Social / R&R Officer** | `SOCIAL_OFFICER` | `randr_jaipur` | `randr_officer@nlams.gov.in` | `Password@123` | Jaipur Rural Resettlement |

---

## 5. Rapid Verification & Health Smoke Test

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
