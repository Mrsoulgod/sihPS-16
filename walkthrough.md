# Live Cloud & Offline High-Fidelity Architecture Walkthrough

## 1. Problem Diagnosis & Resolution Summary
- **Symptom on Vercel (`https://sih-ps-16.vercel.app/login`)**:
  - Browser showed: `Application error: a client-side exception has occurred (see the browser console for more information)`.

- **Root Cause Identified**:
  1. `apiClient` routes requests on HTTPS to `handleMockApiRequest`.
  2. The mock engine was handling domain data (`/projects`, `/parcels`, etc.) but lacked explicit handling for `/auth/login`, `/auth/me`, and `/auth/logout`, causing `fetchCurrentUser` to receive default empty array fallback (`data: []`).
  3. Stored localStorage user profile was parsed as an array (`[]`), which in JavaScript is truthy (`Boolean([]) === true`).
  4. Accessing properties like `user.full_name`, `user.jurisdiction.scope_display`, or `user.role_id` on an array triggered unhandled TypeErrors during initial React hydration.
  5. In `login/page.tsx`, `selectedDistrict` could become undefined during state switching, resulting in property lookup crashes.

- **Resolution Implemented**:
  1. **Built Dedicated Auth Mock Handlers** in [`mock_fallback.ts`](file:///c:/Users/mrgau/Desktop/SIH%20Antigravity/frontend/src/lib/api/mock_fallback.ts):
     - Added canonical login, profile verification (`/auth/me`), and logout endpoints.
     - Provided full statutory user objects with roles, designations, permissions, and scopes for all 5 Central Echelon members, 6 State Secretaries, District CALAs, Field Surveyors, and System Admins.
  2. **Defensive Storage Validation** in [`auth.ts`](file:///c:/Users/mrgau/Desktop/SIH%20Antigravity/frontend/src/lib/api/auth.ts):
     - Validates that stored user profiles are non-array objects with valid `role_id` and `full_name`. Automatically clears corrupt data.
  3. **Null-Safe Component Guarding** in [`login/page.tsx`](file:///c:/Users/mrgau/Desktop/SIH%20Antigravity/frontend/src/app/login/page.tsx), [`NotificationContext.tsx`](file:///c:/Users/mrgau/Desktop/SIH%20Antigravity/frontend/src/lib/context/NotificationContext.tsx), and [`LanguageContext.tsx`](file:///c:/Users/mrgau/Desktop/SIH%20Antigravity/frontend/src/lib/context/LanguageContext.tsx):
     - Fully guarded `selectedDistrict` with fallback defaults.
     - Safe access to `user.role_id`, `user.district_id`, and `translations[language]`.

---

## 2. Git & Vercel Deployment Status
- **Repository**: `https://github.com/Mrsoulgod/sihPS-16`
- **Branch**: `main`
- **Commit**: `8d332c1` ("fix: resolve login client-side exception with resilient auth endpoints and storage validation")
- **Live URL**: `https://sih-ps-16.vercel.app/login`
