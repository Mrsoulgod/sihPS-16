# National Land Acquisition & Management System (NLAMS)

An integrated, end-to-end digital governance platform for managing and monitoring the land acquisition lifecycle under the RFCTLARR Act 2013.

Built for SIH 2026.

---

## 1. Project Structure

```
.
├── ARCHITECTURE.md          # System architecture specification
├── CLAUDE.md                # Canonical engineering rules & constraints
├── DATABASE_SCHEMA.md       # Conceptual & logical schema specifications
├── API_CONTRACT.md          # REST API standards & endpoint contracts
├── DEVELOPMENT_PLAN.md      # Implementation roadmap & phase plans
├── PROJECT_CONTEXT.md       # Problem statement & statutory context
├── docker-compose.yml       # PostgreSQL 16 + PostGIS local container setup
├── .env.example             # Environment configuration template
│
├── backend/                 # FastAPI (Python 3.12+) backend
│   ├── app/
│   │   ├── api/             # API routes & endpoint definitions
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   └── health.py # GET /api/health and /api/v1/health
│   │   │   │   └── api.py
│   │   ├── core/            # Core config, database, exceptions, security
│   │   │   ├── config.py    # Pydantic BaseSettings
│   │   │   ├── database.py  # Async SQLAlchemy 2.0 engine & sessionmaker
│   │   │   └── exceptions.py# API error response formatters
│   │   ├── models/          # Declarative SQLAlchemy models (Phase 2+)
│   │   ├── schemas/         # Pydantic schemas (Request/Response)
│   │   ├── services/        # Business logic & calculation engines (Phase 3+)
│   │   └── main.py          # FastAPI application entrypoint & CORS
│   ├── alembic/             # Alembic async migration environment
│   ├── alembic.ini          # Alembic configuration
│   ├── requirements.txt     # Python backend dependencies
│   └── tests/               # Backend automated pytest suite
│
└── frontend/                # Next.js 14+ (App Router) frontend
    ├── src/
    │   ├── app/             # App Router pages & layout
    │   │   ├── layout.tsx   # Root institutional layout shell
    │   │   ├── page.tsx     # System foundation & integration check
    │   │   └── globals.css  # Tailwind CSS & design tokens
    │   ├── components/
    │   │   └── ui/          # Reusable UI primitives (Card, Badge)
    │   └── lib/
    │       ├── api/         # Typed API client (`apiClient`)
    │       ├── types/       # API contract TypeScript types
    │       └── utils.ts     # Styling & merge utilities
    ├── tailwind.config.ts   # Tailwind configuration
    ├── tsconfig.json        # TypeScript configuration
    └── package.json         # Frontend dependencies & scripts
```

---

## 2. Prerequisites

- **Node.js**: `v20.x` or later & `npm v10.x` or later
- **Python**: `3.11` or `3.12`
- **Database**: PostgreSQL 16 with PostGIS extension (`postgis/postgis:16-3.4` via Docker or local installation)

---

## 3. Environment Variables

Copy `.env.example` to `backend/.env` and `frontend/.env.local`:

```bash
# In backend/.env
ENVIRONMENT=development
PROJECT_NAME="National Land Acquisition & Management System"
API_V1_STR=/api/v1
SECRET_KEY=dev-secret-key-change-in-production-0987654321
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]

# Canonical Database Configuration (PostgreSQL 16 + PostGIS):
DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@localhost:5432/nlams

# In frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="National Land Acquisition & Management System"
```

---

## 4. How to Start the System

### 4.1 Start the Database (PostgreSQL + PostGIS)
If using Docker:
```bash
docker compose up -d postgres
```

### 4.2 Start the Backend
```bash
cd backend
# Create and activate virtual environment (if not already done)
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at:
- Root: `http://localhost:8000/`
- Health check: `http://localhost:8000/api/health`
- Swagger / OpenAPI Docs: `http://localhost:8000/docs`

### 4.3 Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend application will be live at:
- URL: `http://localhost:3000`

---

## 5. How to Run Tests and Quality Checks

### Backend Checks
```bash
cd backend
# Run automated pytest suite
.venv\Scripts\pytest tests

# Verify Alembic migration environment
.venv\Scripts\alembic current
```

### Frontend Checks
```bash
cd frontend
# TypeScript type check
npm run type-check

# Production build check
npm run build
```
