# CLAUDE.md

## 1. PROJECT

This repository contains the SIH 2026 prototype:

National Land Acquisition & Management System.

The product is a unified digital platform for managing and monitoring the land acquisition lifecycle from project proposal through land possession and Rehabilitation & Resettlement.

This is an SIH prototype intended to demonstrate a realistic, integrated solution.

The product requirements are defined in:

PROJECT_CONTEXT.md

The technical architecture is defined in:

ARCHITECTURE.md

The database design is defined in:

DATABASE_SCHEMA.md

The API conventions are defined in:

API_CONTRACT.md

The development sequence is defined in:

DEVELOPMENT_PLAN.md

The visual and UX system is defined in:

DESIGN_SYSTEM.md

These documents together form the project's source of truth.

---

# 2. SOURCE OF TRUTH

Before implementing a feature:

1. Read PROJECT_CONTEXT.md.
2. Read the relevant sections of ARCHITECTURE.md.
3. Read DATABASE_SCHEMA.md when the feature involves data.
4. Read API_CONTRACT.md when the feature involves APIs.
5. Read DESIGN_SYSTEM.md when the feature involves UI/UX.
6. Check DEVELOPMENT_PLAN.md to understand the current development phase.
7. Inspect the existing implementation.

Do not rely only on the current prompt if project documentation already defines the requirement.

If documentation and the existing implementation conflict, identify the conflict before making a major change.

---

# 3. CORE ENGINEERING PRINCIPLE

Build ONE integrated system.

The application must never become a collection of disconnected demo pages.

All major modules must use shared:

- database entities
- APIs
- authentication
- authorization
- services
- UI components
- workflow state
- project data

Example:

Project
→ Land Parcels
→ Landowners
→ Verification
→ Notifications
→ Compensation
→ Award
→ Possession
→ R&R

These relationships must exist in the actual application architecture.

---

# 4. DEVELOPMENT METHOD

Work incrementally.

Only implement the requested development phase or feature.

Do NOT implement future phases without being explicitly instructed.

For every task:

1. Inspect existing code.
2. Read relevant documentation.
3. Identify affected modules.
4. Explain the implementation approach briefly.
5. Implement the requested change.
6. Integrate it with existing functionality.
7. Run relevant tests/checks.
8. Fix errors caused by the implementation.
9. Report what changed.
10. Report remaining issues.

Do not declare a feature complete merely because the UI renders.

---

# 5. ARCHITECTURE DISCIPLINE

Do not:

- create duplicate components
- create duplicate APIs
- create duplicate database models
- create duplicate services
- create parallel implementations of the same feature
- create random utility files
- create unnecessary abstractions
- introduce unnecessary frameworks
- introduce unnecessary dependencies
- rewrite working modules without a clear reason

Before creating a new component, service, utility or API:

Check whether an existing implementation can be reused.

Prefer extending existing architecture over creating another implementation.

---

# 6. DATABASE RULES

The database is the source of truth for persistent application data.

Do not place persistent demo data directly inside frontend components.

Frontend components must obtain application data through the appropriate API/data layer.

Maintain:

- proper foreign keys
- relationships
- validation
- appropriate indexes
- timestamps
- data integrity
- appropriate constraints

Do not silently change the database schema.

If a schema change is required:

1. Explain why.
2. Update DATABASE_SCHEMA.md when appropriate.
3. Create the appropriate migration.
4. Test the migration.

Never manually modify production-style database structure without a migration.

---

# 7. API RULES

Backend APIs must follow the conventions defined in API_CONTRACT.md.

Maintain:

- consistent naming
- consistent response structures
- proper HTTP methods
- validation
- authentication
- authorization
- meaningful error responses

Do not create an endpoint if an existing endpoint can reasonably support the requirement.

Keep business logic out of frontend components.

Business rules belong in the backend/service layer where appropriate.

---

# 8. AUTHENTICATION & AUTHORIZATION

The system supports:

- CENTRAL_OFFICER
- STATE_OFFICER
- DISTRICT_OFFICER
- PROJECT_AGENCY
- FIELD_OFFICER
- ADMIN

Authentication must be implemented securely.

Authorization must be enforced on the backend.

Frontend route protection alone is NOT sufficient.

Never bypass RBAC merely to make a feature easier to implement.

A user must only be able to perform actions permitted by their role.

---

# 9. SECURITY

Never:

- expose passwords
- expose API keys
- expose secrets
- commit credentials
- hardcode sensitive configuration
- log sensitive information unnecessarily
- disable security checks for convenience

Use environment variables for secrets and configuration.

Validate user-controlled input.

Use secure authentication and authorization practices.

This is a prototype, but security fundamentals must still be respected.

---

# 10. DEMO DATA

This is an SIH prototype.

Use realistic fictional data for demonstrations.

Example project:

Delhi–Jaipur Expressway Expansion

Example metrics may include:

- 500 acres proposed
- 420 acres acquired
- 1,240 affected families
- 380 displaced families
- ₹620 Cr compensation assessed
- ₹570 Cr compensation paid
- 395 acres possession
- 72% R&R completion

These values are demonstration data only.

Never use real people's sensitive personal information.

Demo data should be generated/seeded through the appropriate backend/database mechanism rather than being hardcoded throughout the frontend.

---

# 11. GOVERNMENT INTEGRATIONS

The system is designed to eventually integrate with:

- land records
- cadastral maps
- relevant government portals
- other authorized government systems

When real APIs are unavailable:

Use clearly structured mock APIs and realistic demo data.

Keep the integration architecture modular so actual authorized APIs can replace the mocks later.

Never claim that a mock integration is an actual government integration.

---

# 12. GIS

GIS is a core part of the product.

Land parcels should be connected to project and acquisition data.

The map must not be a decorative standalone component.

A parcel displayed on the map should correspond to actual parcel data in the system.

Use the visual conventions defined in DESIGN_SYSTEM.md.

---

# 13. WORKFLOW

The core acquisition lifecycle is:

Project Proposal
→ Scrutiny
→ Land Identification
→ Land Verification
→ Notification
→ Compensation Assessment
→ Award
→ Compensation Disbursement
→ Possession
→ Rehabilitation & Resettlement
→ Completion

Workflow state must be represented consistently across:

- project pages
- parcel pages
- dashboards
- notifications
- analytics
- reports

Do not create separate conflicting status systems for different modules.

---

# 14. FRONTEND / UI

Follow DESIGN_SYSTEM.md.

The visual direction is inspired by modern Indian government/public-data platforms.

The UI should be:

- clean
- modern
- institutional
- data-driven
- spacious
- professional
- responsive
- accessible

Green is the primary brand/accent color.

Do not overuse green.

Use neutral backgrounds and restrained status colors.

Avoid:

- excessive gradients
- glassmorphism
- neon effects
- excessive shadows
- excessive rounded cards
- unnecessary animations
- generic SaaS dashboard aesthetics

The product should feel like a serious national government information and operations platform.

---

# 15. RESPONSIVE DESIGN

The application must work across:

- desktop
- laptop
- tablet
- mobile

Field Officer workflows should receive particular attention for mobile usability.

Do not create separate unrelated mobile and desktop implementations unless genuinely required.

Prefer responsive reusable components.

---

# 16. ERROR & STATE HANDLING

Important interfaces must account for:

- loading
- success
- empty state
- validation errors
- API errors
- permission errors
- network failures

Do not leave blank screens when data is unavailable.

Provide useful user feedback.

---

# 17. TESTING

After meaningful implementation:

Run appropriate:

- unit tests
- integration tests
- type checks
- lint checks
- build checks

Test important workflows end-to-end where practical.

Before declaring a phase complete:

Verify that existing functionality still works.

Do not ignore errors merely because they existed before your changes.

Clearly distinguish:

- pre-existing errors
- errors introduced by your changes
- unresolved issues

---

# 18. DOCUMENTATION

Keep documentation synchronized with the implementation.

If a major architectural decision changes:

Update the relevant documentation.

Do not unnecessarily rewrite documentation for small implementation details.

Documentation should explain decisions, not duplicate source code.

---

# 19. SIH PRIORITY

The project is being built for an SIH demonstration.

Priority order:

1. End-to-end working functionality
2. Integration between modules
3. Correct representation of the problem statement
4. Reliability
5. Clear user experience
6. Security fundamentals
7. Visual polish
8. Advanced/optional features

Do not sacrifice core workflow reliability for flashy features.

Do not over-engineer features that will not improve the SIH demonstration.

---

# 20. FEATURE PRIORITIZATION

When there is insufficient time:

Prioritize:

- authentication/RBAC
- national dashboard
- project management
- acquisition workflow
- land parcel management
- GIS
- compensation
- possession
- R&R
- document management
- field verification
- alerts
- analytics

Advanced features may use simplified but credible implementations if necessary.

For example, predictive risk scoring may initially use a transparent rule-based model rather than an unnecessarily complex machine-learning system.

---

# 21. CHANGE CONTROL

Do not silently make major architectural decisions.

If a requested feature requires:

- major schema changes
- changing frameworks
- replacing core libraries
- changing authentication architecture
- changing workflow architecture
- restructuring the repository

STOP and explain:

1. Why the change is necessary.
2. What alternatives exist.
3. What parts of the system will be affected.
4. Your recommended approach.

Wait for approval when the decision has significant architectural impact.

---

# 22. SCOPE CONTROL

Do not implement unrelated improvements while working on a specific feature.

Do not refactor unrelated code simply because it could be improved.

Keep changes focused and reviewable.

If you discover an unrelated issue:

Report it separately unless it blocks the current task.

---

# 23. NO FAKE COMPLETION

Never claim that something works without verifying it.

If a feature is partially implemented, say so.

If a government integration is mocked, say so.

If a predictive model is rule-based, say so.

If a test cannot be run, explain why.

Accuracy is more important than appearing complete.

---

# 24. FINAL CHECK BEFORE COMPLETING A TASK

Before reporting a task as complete, verify:

- Did I follow the documented architecture?
- Did I reuse existing code where appropriate?
- Did I avoid duplicate implementations?
- Is the data connected correctly?
- Is authentication/authorization correct?
- Are loading/error/empty states handled?
- Did I test the affected functionality?
- Did I introduce unnecessary dependencies?
- Did I accidentally break another module?
- Does the implementation remain consistent with the SIH requirements?

Only then report completion.
