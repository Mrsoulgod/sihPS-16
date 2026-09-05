# NLAMS — Final SIH Judge Q&A Master Defense Manual
**Project**: National Land Acquisition & Management System (NLAMS)  
**Target**: 39 Categorized Questions (A–N) for Smart India Hackathon Jury  
**Structure**: QUESTION · BEST 20–40 SECOND SPOKEN ANSWER · KEY POINTS · WHAT NOT TO SAY

---

## Category A: Problem Understanding

### Q1: What is the real bottleneck in Indian land acquisition?
- **BEST 20–40 SECOND ANSWER**:
  > "The bottleneck is not an absence of records; it is the breakdown of handoffs between disjointed departments. Project agencies design in CAD, revenue offices maintain Bhulekh, district collectors manage paper objections, and state treasuries disburse offline. Because these systems do not talk to each other, statutory 12-month deadlines under Section 25 lapse, forcing acquisitions to restart and stalling critical infrastructure for years."
- **KEY POINTS**: Inter-agency handoff failure, unlinked CAD vs. revenue records, Section 25 statutory lapse risk.
- **WHAT NOT TO SAY**: "Government officers are lazy/inefficient" or "there is no land data in India."

### Q2: Why do land acquisition projects stall under Section 25?
- **BEST 20–40 SECOND ANSWER**:
  > "Section 25 of the RFCTLARR Act mandates that an award must be made within twelve months from the Section 19 declaration date. Because revenue scrutiny, field surveys, valuation checks, and objection hearings are tracked on disconnected paper files, collectors lose visibility of the statutory clock. When day 366 arrives without an award, the entire proceeding legally lapses. NLAMS prevents this through automated countdown alerts and stage-gate enforcement."
- **KEY POINTS**: Mandatory 12-month ceiling, legal invalidation of proceedings, automated SLA countdown.
- **WHAT NOT TO SAY**: "Section 25 is just a guideline" (it is a strict statutory ceiling).

### Q3: Isn't this just another administrative digitisation project?
- **BEST 20–40 SECOND ANSWER**:
  > "No. Digitisation simply turns paper into static PDFs. NLAMS is an active statutory coordination engine. It performs spatial clipping of cadastral parcels against highway buffers, executes mathematical compensation formulas under Sections 26 to 30, automates PFMS electronic payments, and enforces legal prerequisite gates between statutory milestones. It is an operational state machine, not a digital filing cabinet."
- **KEY POINTS**: Active state machine vs. passive document storage; spatial clipping; deterministic statutory math.
- **WHAT NOT TO SAY**: "Yes, it is a document management portal."

---

## Category B: Innovation

### Q4: What is actually innovative here?
- **BEST 20–40 SECOND ANSWER**:
  > "The innovation is the synthesis of statutory RFCTLARR law, vector cadastral GIS, and direct treasury disbursement into a single unbroken lifecycle. Previously, GIS engineers, revenue collectors, and finance officers worked in three separate universes. In NLAMS, adjusting a highway Right-of-Way alignment on the map dynamically re-computes affected village Khasras, recalculates the statutory solatium budget, and updates the R&R family entitlement roster in real time."
- **KEY POINTS**: Cross-domain synthesis (GIS + Legal + Financial), dynamic parcel-to-award recalculation, unified lifecycle.
- **WHAT NOT TO SAY**: "We invented a new AI algorithm" or "we put land records on blockchain."

### Q5: How does this improve upon traditional e-governance workflows?
- **BEST 20–40 SECOND ANSWER**:
  > "Traditional e-governance provides passive data forms where users can type whatever they want. NLAMS enforces structural statutory stage-gates. You cannot publish a Section 19 declaration without recorded Section 15 objection minutes and uploaded gazettes. You cannot disburse funds without verified bank IFSC validation and an immutable SHA-256 cryptographic hash. It embeds legal compliance into the software architecture."
- **KEY POINTS**: Enforced statutory stage-gates, impossible to skip mandatory milestones, cryptographic integrity.
- **WHAT NOT TO SAY**: "Our UI looks much cleaner than NIC websites."

### Q6: What is unique about your cadastral parcel linking?
- **BEST 20–40 SECOND ANSWER**:
  > "We link the vector polygon of the cadastral parcel directly to the landholder's bank account and Schedule II R&R profile. If a parcel is severed by a highway alignment, PostGIS flags the unviable remainder under Section 94. The system links the physical ground evidence, the valuation award, and the rehabilitation housing plot to the exact same geospatial Khasra entity."
- **KEY POINTS**: Geospatial-to-financial linkage, automated severed parcel detection under Section 94.
- **WHAT NOT TO SAY**: "We drew custom Google Maps pins."

---

## Category C: Technical Architecture

### Q7: Why FastAPI and Python instead of Java / Spring Boot?
- **BEST 20–40 SECOND ANSWER**:
  > "FastAPI delivers asynchronous non-blocking I/O built on Starlette and Pydantic, providing execution speeds competitive with Go and Node.js while handling thousands of concurrent requests. Python provides first-class native integration with geospatial libraries (Shapely, GeoJSON) and analytical engines. Coupled with SQLAlchemy 2.0 asyncpg, it provides an ultra-lightweight, memory-efficient enterprise microservice."
- **KEY POINTS**: Async concurrency (asyncpg/uvicorn), native geospatial tooling, strict Pydantic schema validation.
- **WHAT NOT TO SAY**: "Python was easier for us to write quickly."

### Q8: Why PostgreSQL and PostGIS instead of MongoDB or commercial GIS?
- **BEST 20–40 SECOND ANSWER**:
  > "Land acquisition involves financial disbursements and legal property transfers; ACID transactional compliance is non-negotiable, ruling out NoSQL. PostGIS is the global gold standard for spatial vector indexing (GiST R-Trees), enabling geometric intersections, boundary buffering, and coordinate transforms (EPSG:4326) directly inside SQL without expensive ESRI licenses, making it 100% open-source and sovereign."
- **KEY POINTS**: ACID transactional integrity, native spatial GiST indexing, zero licensing fees for government.
- **WHAT NOT TO SAY**: "MongoDB was too complicated for spatial maps."

### Q9: How do you ensure high availability and sub-second query performance?
- **BEST 20–40 SECOND ANSWER**:
  > "First, database tables are indexed on composite keys `(project_id, state_code, district_code)` and spatial GiST indexes on parcel geometries. Second, our API uses async connection pooling. Third, Next.js 14 pre-renders static shells and caches read-heavy master data. Spatial queries run against pre-computed bounding boxes, keeping response times under 150 milliseconds."
- **KEY POINTS**: GiST spatial indexing, async connection pooling, Next.js static rendering, bounding box queries.
- **WHAT NOT TO SAY**: "We didn't test performance under load."

---

## Category D: GIS & Field Intelligence

### Q10: Why is GIS necessary if we already have Khasra numbers?
- **BEST 20–40 SECOND ANSWER**:
  > "Khasra numbers are tabular identifiers; they do not reveal physical spatial relationships. Tabular data cannot detect if a 60-meter highway buffer clips five meters off an agricultural plot or bisects a tube-well. PostGIS spatial overlay visually and mathematically calculates the exact affected area, detects severed land remnants under Section 94, and eliminates ground boundary disputes before bulldozers arrive."
- **KEY POINTS**: Spatial intersection vs. tabular text, severed remnant detection, pre-construction dispute prevention.
- **WHAT NOT TO SAY**: "It makes the presentation look much more modern."

### Q11: How does your system handle severed land parcels?
- **BEST 20–40 SECOND ANSWER**:
  > "Under Section 94 of the RFCTLARR Act, if acquisition severs a landholding leaving an unviable sliver, the owner can demand full acquisition. When NLAMS clips a cadastral polygon against the Right-of-Way alignment, it calculates the remnant polygon area. If the remainder falls below the state's statutory agricultural threshold, it flags the parcel for compulsory full acquisition and adjusts the compensation budget automatically."
- **KEY POINTS**: Section 94 statutory compliance, automated remainder area calculation, budget adjustment.
- **WHAT NOT TO SAY**: "We just ignore the leftover land."

### Q12: How does offline field data collection and GPS synchronization work?
- **BEST 20–40 SECOND ANSWER**:
  > "The field interface uses client-side IndexedDB caching as a Progressive Web App (PWA). Surveyors download their assigned village parcel roster while at the tehsil office. On-site, they record GPS boundary coordinates, capture photographs, and enumerate assets offline. When connectivity is re-established, the app synchronizes payloads to the server, verifying coordinates against the PostGIS parcel polygon."
- **KEY POINTS**: PWA offline caching (IndexedDB), local roster sync, conflict-free background reconciliation.
- **WHAT NOT TO SAY**: "The surveyor must have high-speed 5G in the field at all times."

---

## Category E: Statutory Compensation

### Q13: Can this software legally calculate statutory compensation?
- **BEST 20–40 SECOND ANSWER**:
  > "Yes. The software precisely executes the statutory formulas codified in Sections 26 through 30 of the RFCTLARR Act 2013. It multiplies base circle rate by the rural factor, adds asset valuations under Section 29, adds mandatory 100% Solatium under Section 30(1), and calculates 12% additional interest under Section 30(3). The calculations are deterministic, transparent, and locked by CALA approval."
- **KEY POINTS**: Exact codification of Sections 26, 29, 30(1), and 30(3); deterministic; CALA sign-off.
- **WHAT NOT TO SAY**: "The AI decides how much money the farmer gets."

### Q14: How does the calculation handle different circle rates and rural multipliers?
- **BEST 20–40 SECOND ANSWER**:
  > "We utilize a configurable **Statutory Master Rule Matrix**. Rural multiplication factors—which range from 1.0× to 2.0× based on distance from urban boundaries under Section 26(2)—are stored as state-specific lookup tables. When a Khasra is selected, the engine pulls the notified circle rate and distance multiplier for that specific tehsil, executing the exact state rule without code modification."
- **KEY POINTS**: Configurable Master Rule Matrix, state-specific lookup tables, zero code changes required.
- **WHAT NOT TO SAY**: "We hardcoded Rajasthan's 1.5 multiplier everywhere."

### Q15: How do you prevent fraud or manual tampering in compensation awards?
- **BEST 20–40 SECOND ANSWER**:
  > "Three safeguards protect the award: First, calculation logic resides strictly in the backend engine; client forms cannot alter mathematical rules. Second, valuation requires multi-tier approval from the Valuation Officer and CALA. Third, the approved award and its input parameters are hashed using SHA-256 and written to an immutable audit log before a disbursement mandate can be generated."
- **KEY POINTS**: Backend-enforced math, multi-tier RBAC approval, SHA-256 cryptographic hashing.
- **WHAT NOT TO SAY**: "Nobody can hack our database because we have a password."

---

## Category F: Legal & Statutory Governance

### Q16: How does NLAMS handle the mandatory objection process under Section 15?
- **BEST 20–40 SECOND ANSWER**:
  > "Within 60 days of Section 11 publication, citizens or their representatives submit objections via the portal or physical counter. NLAMS logs each objection with a docket number, categorizing it as measurement dispute, ownership claim, or valuation grievance. The system requires CALA hearing dates and speaking orders to be formally recorded before the project is permitted to transition to Section 19 declaration."
- **KEY POINTS**: 60-day statutory window, docket categorization, mandatory speaking order prerequisite.
- **WHAT NOT TO SAY**: "The system automatically dismisses objections."

### Q17: What happens if an objection is upheld by the CALA?
- **BEST 20–40 SECOND ANSWER**:
  > "If CALA upholds an objection—for instance, excluding an ancient religious structure or correcting a severed boundary—the parcel status is updated to 'Excluded' or 'Demarcation Revision Required'. The project Right-of-Way geometry is dynamically adjusted in PostGIS, and the compensation schedule updates automatically, reflecting the reduced area."
- **KEY POINTS**: Formal parcel exclusion, boundary geometry adjustment in PostGIS, budget update.
- **WHAT NOT TO SAY**: "The entire project gets cancelled."

### Q18: How does the system handle court stays or arbitration disputes?
- **BEST 20–40 SECOND ANSWER**:
  > "When a dispute is referred to the Land Acquisition, Rehabilitation and Resettlement Authority (LARRA) or High Court under Section 64, the specific parcel is flagged as 'Sub-Judice / In Dispute'. The contested compensation amount is segregated into a court escrow deposit schedule under Section 77, preventing project paralysis while fully respecting judicial proceedings."
- **KEY POINTS**: Section 64 referral, Section 77 court escrow segregation, non-blocking corridor progress.
- **WHAT NOT TO SAY**: "Our software bypasses the High Court."

---

## Category G: Security, RBAC & Privacy

### Q19: How do you prevent unauthorized access across different districts and states?
- **BEST 20–40 SECOND ANSWER**:
  > "We enforce a two-dimensional access control model: **Role-Based Access Control (RBAC)** plus **Geographic Jurisdiction Scoping**. A user with the 'CALA' role in Jaipur has their database queries scoped at the API middleware level to `district_code == 'RJ-JPR'`. They literally cannot query, edit, or approve records in Jodhpur or Haryana."
- **KEY POINTS**: 7-tier RBAC + Geographic Scoping, middleware query filtering, multi-tenant isolation.
- **WHAT NOT TO SAY**: "We just hide the buttons in the frontend."

### Q20: How is citizen privacy protected under the DPDP Act 2023?
- **BEST 20–40 SECOND ANSWER**:
  > "We implement DPDP-aligned data minimization and masking. On public transparency portals and non-privileged role views, citizen Aadhaar numbers are masked as `XXXX-XXXX-8921`, bank accounts display only the last four digits, and phone numbers are truncated. Full PII is decryptable only by the authenticated CALA and treasury officers directly authorizing payment mandates."
- **KEY POINTS**: Data minimization, PII masking (`XXXX-XXXX-8921`), strictly restricted unmasking roles.
- **WHAT NOT TO SAY**: "We are 100% certified DPDP compliant by the government."

### Q21: How do you guarantee the cryptographic integrity of documents and awards?
- **BEST 20–40 SECOND ANSWER**:
  > "Upon upload, every gazette notification, cadastral survey sketch, and valuation award has its file buffer hashed using SHA-256. This hash is stored immutably in the database alongside the uploader's user ID and timestamp. If an officer attempts to alter an award document post-approval, the hash mismatch is immediately detected and flagged in the audit console."
- **KEY POINTS**: SHA-256 digest on upload, immutable audit storage, tamper-evident mismatch alerts.
- **WHAT NOT TO SAY**: "We store documents on Ethereum / blockchain."

---

## Category H: Interoperability & Integration Gateways

### Q22: Is PFMS actually integrated?
- **BEST 20–40 SECOND ANSWER**:
  > "In this SIH prototype, PFMS is integrated via a high-fidelity sandbox gateway adhering strictly to the Ministry of Finance's e-Payment XML and JSON API specifications. It generates unique UTRs, validates IFSC codes, and processes credit acknowledgments. In production, this sandbox adapter would be swapped with the live authorized PFMS SFTP/REST gateway without touching core code."
- **KEY POINTS**: Adherence to standard PFMS payment schemas, realistic sandbox gateway, swappable adapter pattern.
- **WHAT NOT TO SAY**: "Yes, we are running live payments on the government's real PFMS right now."

### Q23: Is State Bhulekh really integrated?
- **BEST 20–40 SECOND ANSWER**:
  > "We provide a fully functional sandbox integration modeling the National Land Records Modernization Programme (NLRMP) C-DIL standard. It consumes standardized Record of Rights (RoR) data formats—Khasra, Khatauni, owner shares, and encumbrance statuses. Live onboarding requires only providing the state NIC endpoint and security certificate."
- **KEY POINTS**: C-DIL NLRMP standard schema, sandbox connector proves contract, config-based endpoint swap.
- **WHAT NOT TO SAY**: "We hacked into the Rajasthan Bhulekh server."

### Q24: What happens if an external government API goes down or times out?
- **BEST 20–40 SECOND ANSWER**:
  > "Our Integration Gateway implements the **Circuit Breaker** and **Asynchronous Message Queue** patterns. If Bhulekh or PFMS times out, the system does not crash or freeze the user interface. It marks the record as 'Pending External Verification' and schedules automated exponential backoff retries in the background."
- **KEY POINTS**: Circuit breaker pattern, async message queue, graceful degradation, exponential backoff.
- **WHAT NOT TO SAY**: "The application will crash until the government fixes their API."

---

## Category I: Scalability & Master Data

### Q25: How will this handle millions of parcels across 700+ districts?
- **BEST 20–40 SECOND ANSWER**:
  > "PostgreSQL supports declarative table partitioning by State and Project. Spatial queries are optimized via PostGIS bounding box filters (`&&`) before executing heavy polygon intersections. By decoupling spatial vector assets from transactional accounting records and using Next.js edge caching for public views, NLAMS horizontally scales across all 28 states."
- **KEY POINTS**: Declarative table partitioning, bounding box pre-filtering, edge caching, horizontal scaling.
- **WHAT NOT TO SAY**: "Postgres can handle anything without optimization."

### Q26: How do you handle database partitioning across different states?
- **BEST 20–40 SECOND ANSWER**:
  > "Our schema design uses composite partitioning keys `(state_code, project_id)`. Each state's parcel and disbursement records live in dedicated table partitions. This isolates query workloads so that high-volume operations in Uttar Pradesh or Maharashtra have zero performance impact on smaller UT implementations."
- **KEY POINTS**: Declarative multi-tenant partitioning, workload isolation, state-specific partition pruning.
- **WHAT NOT TO SAY**: "We create a separate database for every state."

### Q27: How does the geographic master data hierarchy prevent duplicate records?
- **BEST 20–40 SECOND ANSWER**:
  > "We enforce composite unique database constraints: `UNIQUE (state_code, district_code, tehsil_code, village_code, khasra_number)`. Furthermore, our PostGIS geometry validation rejects overlapping polygon demarcation for the same parcel within a village, making duplicate compensation mathematically impossible."
- **KEY POINTS**: 5-tier composite unique constraint, PostGIS spatial non-overlap validation.
- **WHAT NOT TO SAY**: "We just check if the name already exists."

---

## Category J: AI & Predictive Risk Intelligence

### Q28: Where is the AI? Why didn't you use Generative AI or LLMs?
- **BEST 20–40 SECOND ANSWER**:
  > "We deliberately chose **Explainable Rule-Based Risk Intelligence** over Generative AI. Land acquisition is a strict statutory domain subject to High Court scrutiny. An LLM hallucination cannot be defended in an arbitration tribunal. Our engine uses a 100% deterministic, weighted statutory algorithm that is transparent, verifiable, and legally defensible."
- **KEY POINTS**: Statutory explainability, legal auditability, risk of LLM hallucinations in administrative law.
- **WHAT NOT TO SAY**: "We didn't have time to add ChatGPT" or "we used a deep neural network."

### Q29: How does the rule-based risk scoring work?
- **BEST 20–40 SECOND ANSWER**:
  > "It evaluates four statutory risk vectors on a 0 to 100 scale: Statutory Schedule Proximity (35%) tracking countdown to the 12-month Section 25 lapse; Objection Density (25%) measuring the ratio of contested Khasras; Disbursement Lag (20%) comparing awarded vs. realized PFMS transfers; and Environmental/Forest Clearance delays (20%). High-risk projects trigger automated escalation to the Ministry."
- **KEY POINTS**: 4 transparent statutory vectors, weighted 0–100 score, automated ministry escalation.
- **WHAT NOT TO SAY**: "It uses magic heuristics."

### Q30: How are the risk indicator weights determined?
- **BEST 20–40 SECOND ANSWER**:
  > "The weights reflect the legal severity of failure under the RFCTLARR Act. Statutory schedule slippage carries the highest weight (35%) because a Section 25 lapse is fatal to the acquisition. Objections carry 25% because court stays stall construction. Disbursement and clearances carry 20% each as operational bottlenecks. Weights are configurable in master settings."
- **KEY POINTS**: Calibrated against legal severity, Section 25 lapse as highest fatal risk, configurable.
- **WHAT NOT TO SAY**: "We just picked random percentages."

---

## Category K: Existing Government Systems Comparison

### Q31: Why do we need NLAMS if Bhulekh already exists?
- **BEST 20–40 SECOND ANSWER**:
  > "State Bhulekh portals are property ownership registries created for land revenue taxation and sale deed registration. They do not know what a highway Right-of-Way is, cannot compute Section 30 solatium, cannot run Section 15 objection hearings, and do not track Schedule II R&R entitlements. Bhulekh is a database of records; NLAMS is the active acquisition lifecycle engine."
- **KEY POINTS**: Static registry vs. active acquisition engine; no highway alignment or solatium in Bhulekh.
- **WHAT NOT TO SAY**: "Bhulekh is broken and useless."

### Q32: How is this different from MoRTH's BhoomiRashi?
- **BEST 20–40 SECOND ANSWER**:
  > "BhoomiRashi is an excellent gazette publication workflow tool for highway notifications (3A, 3D). However, it does not provide integrated cadastral GIS parcel clipping, joint field survey GPS verification, automated mathematical Section 26–30 valuation calculation, or Schedule II R&R family tracking. NLAMS integrates these ground-level district functions with central oversight."
- **KEY POINTS**: BhoomiRashi focuses on central gazette notifications; NLAMS handles end-to-end ground execution.
- **WHAT NOT TO SAY**: "BhoomiRashi is outdated."

### Q33: Why shouldn't NIC just build an extra module in existing portals?
- **BEST 20–40 SECOND ANSWER**:
  > "Because acquisition spans multiple independent sovereign authorities that do not share databases: MoRTH at the Center, Revenue Departments at the State, District Collectors locally, and the Ministry of Finance for PFMS. Attempting to bolt this onto a state Bhulekh portal fails because linear infrastructure crosses state boundaries. NLAMS provides the neutral, cross-jurisdictional orchestration layer."
- **KEY POINTS**: Multi-sovereign boundary problem, interstate corridors, neutral orchestration platform.
- **WHAT NOT TO SAY**: "NIC is too slow to build good software."

---

## Category L: Deployment & Implementation

### Q34: What infrastructure is required to deploy NLAMS in a state or ministry?
- **BEST 20–40 SECOND ANSWER**:
  > "NLAMS is containerized via Docker and Kubernetes, ready for deployment on sovereign cloud infrastructure such as NIC MeghRaj, RailTel, or AWS GovCloud. It requires an enterprise PostgreSQL 16 cluster with the PostGIS extension, an async Python application runtime, and standard HTTPS reverse proxies. It has zero commercial GIS license dependencies."
- **KEY POINTS**: Docker/Kubernetes containerization, NIC MeghRaj ready, zero commercial software licenses.
- **WHAT NOT TO SAY**: "We need expensive proprietary servers and Oracle licenses."

### Q35: How will rural tehsil offices with slow 4G connect to this system?
- **BEST 20–40 SECOND ANSWER**:
  > "The frontend is optimized for low-bandwidth environments: Next.js bundles are code-split and minified; vector geometries are simplified on the server; and the field module functions offline via IndexedDB. A field officer needs connectivity only to download their village parcel roster and to sync completed verification batches."
- **KEY POINTS**: Code-splitting, server-side geometry simplification, offline-first PWA architecture.
- **WHAT NOT TO SAY**: "They cannot use it without high-speed fiber."

---

## Category M: Business & Strategic Impact

### Q36: What measurable impact can a state or central ministry expect in 12 months?
- **BEST 20–40 SECOND ANSWER**:
  > "First: **zero statutory lapses** under Section 25, saving crores in re-notification costs. Second: **elimination of calculation errors** and solatium disputes in court. Third: **100% Direct Benefit Transfer** directly into landholder bank accounts, ending payment leakage. Fourth: **real-time executive visibility** across every linear infrastructure project in the country."
- **KEY POINTS**: Zero Section 25 lapses, error-free statutory math, 100% DBT treasury transfer, macro oversight.
- **WHAT NOT TO SAY**: "It will increase national GDP by 5%."

### Q37: How does NLAMS help reduce project capital cost overruns?
- **BEST 20–40 SECOND ANSWER**:
  > "Every month a national highway or rail corridor is delayed adds crores in contractor idling claims and escalates land market values. By eliminating administrative latency between Section 11 notification and Section 38 possession, NLAMS compresses the acquisition timeline from years to months, preventing massive capital escalation."
- **KEY POINTS**: Elimination of contractor idling claims, compressed notification-to-possession cycle, capital savings.
- **WHAT NOT TO SAY**: "We cut the compensation given to farmers."

---

## Category N: Limitations & Future Scope

### Q38: What is the single biggest limitation of your prototype today?
- **BEST 20–40 SECOND ANSWER**:
  > "Our primary limitation is that external government integrations—such as PFMS and State Bhulekh—operate against realistic sandbox gateways rather than live production NIC endpoints. Production access requires formal ministerial MoUs, security clearances, and VPN certificates. However, our modular adapter architecture means swapping sandbox for production requires only updating configuration endpoints."
- **KEY POINTS**: Sandbox connectors due to administrative MoU requirements, swappable adapter architecture.
- **WHAT NOT TO SAY**: "Our code is buggy and our database is fake."

### Q39: What would you build next if given 6 months and departmental funding?
- **BEST 20–40 SECOND ANSWER**:
  > "Three production priorities: First, pilot onboarding with two state NIC Bhulekh portals (e.g., Rajasthan and Maharashtra). Second, integration with DigiLocker and Bharat e-Sign for legally binding digital notices under the IT Act. Third, a native mobile app with Bluetooth RTK-GPS rover support for sub-meter centimeter-level field demarcation."
- **KEY POINTS**: Live NIC pilot onboarding, DigiLocker/e-Sign integration, RTK-GPS centimeter field demarcation.
- **WHAT NOT TO SAY**: "We will rewrite the whole system from scratch."
