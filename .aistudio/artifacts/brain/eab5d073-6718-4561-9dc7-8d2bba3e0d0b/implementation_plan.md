# BenchPulse: AI Model Benchmark Portal & Eval Lab (PRD & Implementation Plan)

A high-impact, neo-brutalist web portal providing real-time public AI model benchmark intelligence (powered by the BenchLM Data API), paired with personal CRUD workspaces for user evaluations and private model notes, and a streamlined role-based administration dashboard for user account and system content governance.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX specifications incorporate your confirmed choices from Phase 1:
> - **User Workspace Data Scope**: Registered users can create, read, update, and delete (CRUD) their own **Custom Evals**, **Prompt Tests** (with latency, accuracy, and output comparisons), and **Private Model Notes**.
> - **Visual Identity**: **Neo-Brutalism** visual language — stark high-contrast borders (`border-2 border-black`), offset hard drop-shadows (`shadow-[4px_4px_0px_#000]`), electric accent blocks (acid yellow, energetic orange, lime, and ultra-cyan), crisp sans typography (`Plus Jakarta Sans`), and monospace tabular data (`JetBrains Mono`). Zero generic pastel pills or fuzzy gradients.
> - **BenchLM API Integration**: On-demand search and live querying against the BenchLM Data API via a secure backend Express proxy route (`/api/benchmarks/search` and `/api/benchmarks/models`), protecting the user's API key server-side while ensuring fast, responsive client filtering and rich fallback model metrics if external endpoints encounter rate-limits.
> - **Database & Auth**: Firebase Authentication (Google popup sign-in + guest demo credentials) and Cloud Firestore with strict Attribute-Based Access Control (ABAC) rules preventing cross-user data tampering and enforcing admin role verification.

---

### 1. Overview & Core Concept

#### 1.1 What It Does
**BenchPulse** is a two-sided AI intelligence portal:
1. **Public AI Benchmark Explorer**: Anyone can search, filter, and inspect performance metrics across top LLMs (coding benchmarks like SWE-bench, reasoning like GSM8K/MATH, agentic workflows, MMLU-Pro, throughput, and context windows) using on-demand BenchLM data.
2. **Personal Eval Lab (User CRUD)**: Authenticated users can create, edit, organize, and delete their own custom benchmark evaluations, prompt stress tests, and private evaluation notes attached to specific models.
3. **Role-Based Admin Console**: Appointed administrators can oversee registered user accounts (role assignment, status active/suspended, eval counts) and publish system-wide announcements, featured benchmark spotlights, and curated categories.

#### 1.2 Target Audience & Personas
- **AI Engineers & Researchers**: Seeking unvarnished, direct benchmark data to choose models for specific use cases (coding, tool calling, reasoning).
- **Product Builders & Tech Leads**: Needing a personal sandbox to record prompt evaluations, test latency/cost, and keep private notes across different model versions.
- **Platform Administrators**: Requiring visibility into registered user accounts and the ability to post system updates or highlight notable benchmark shifts.

#### 1.3 Key Value
Delivers a transparent, developer-grade portal where users don't just passively read benchmark numbers—they actively run their own evaluation records side-by-side with official BenchLM statistics, encased in an assertive, high-performance neo-brutalist interface.

---

### 2. User Experience & Visual Design

#### 2.1 Key User Flows

```
[Public Visitor] ────────► Search BenchLM Models ─────► View Detailed Benchmark Breakdown
        │                                                              │
        ▼                                                              ▼
[Sign In / Auth] ────────► [User Eval Lab]                      Compare Models
        │                  ├── Create Custom Eval Record
        │                  ├── Record Prompt Run & Metrics
        │                  └── Manage Private Model Notes (CRUD)
        ▼
[Admin Role Check] ──────► [Admin Dashboard]
                           ├── User Management (Roles, Status, Activity)
                           └── System Content (Announcements, Featured Highlights)
```

1. **Public Benchmark Discovery**:
   - Live search bar with instant query debouncing.
   - Quick category tabs (All, Coding & SWE, Reasoning & Math, Agentic, Multimodal, Instruction Following).
   - Dynamic comparison matrix allowing side-by-side model score comparison.
2. **Authenticated User CRUD Workspace**:
   - **Create**: Add new evaluation entries (Model Name, Benchmark Metric, Score, Prompt Used, Latency ms, Token Cost, Evaluation Notes, Category).
   - **Read & Filter**: Grid and list views of the user's private evaluations with instant search and status tags.
   - **Update**: Modal/inline drawer to adjust scores, append prompt results, or edit private notes.
   - **Delete**: Confirmed deletion with undo toast feedback.
3. **Admin Dashboard Flow**:
   - Overview metrics: Total Registered Users, Total Evaluations Recorded, Active Models Tracked.
   - User Account Table: User Email, UID, Role (Admin / Member), Joined Date, Eval Count, and Action menu (Toggle Admin, Deactivate).
   - System Content Manager: Post, edit, or archive banner notices and highlight "Model of the Week".

#### 2.2 Visual Identity & Neo-Brutalist Theme

- **Aesthetic Direction**: **Neo-Brutalism** — unapologetic geometry, heavy solid borders, sharp corners, tactile physical shadows, high contrast, and energetic editorial color blocks.
- **Color Palette**:
  - Neutral Ground: Canvas Cream `#FBF9F1` / Pure Dark `#121212` for dark accents.
  - Structural Surface: Solid White `#FFFFFF` with `2px solid #000000` or `3px solid #000000`.
  - Accent Colorways:
    - Primary Action: Electric Yellow `#FFE600`
    - Secondary Action / Coding: Neon Cyan `#00F0FF`
    - High-Score / Nominal: Vivid Lime `#70FF00`
    - Alert / Terminal: Neo-Coral `#FF4343`
    - Accent Violet: Hyper Purple `#B575FF`
  - Shadow Motif: `box-shadow: 4px 4px 0px #000000` on cards, `box-shadow: 2px 2px 0px #000000` on buttons (translates to `translate-x-[2px] translate-y-[2px]` on active click).
- **Typography & Hierarchy**:
  - Display & Headlines: `Plus Jakarta Sans` (800 / ExtraBold, uppercase tracking `tracking-tight`).
  - Body Prose: `Plus Jakarta Sans` (500 Medium, 15px/1.6 line height).
  - Metrics, Latency & Numerals: `JetBrains Mono` / `tabular-nums` (600 SemiBold).
- **Component Styling & Layout**:
  - Zero fluffy rounded pills: Tags and chips use crisp rectangular boxes with `border-2 border-black font-mono text-xs uppercase px-2 py-0.5`.
  - Section headers feature thick black underline rules or bold accent background tags.
  - Top navigation bar complies with the 3-zone contract with stark neo-brutalist buttons.

---

### 3. Key Product Decisions & Trade-Offs

| Decision Area | Chosen Approach | Rationale & User Benefit | Trade-Off / Alternative Rejected |
| :--- | :--- | :--- | :--- |
| **API Key Protection** | Express Server Proxy (`/api/benchmarks/*`) | Injects the provided BenchLM API key (`bld_free_...`) server-side via environment variables, preventing client credential leaks and CORS blocks. | Direct browser fetch: Would expose API key in client network requests and trigger cross-origin restrictions. |
| **Data Persistence** | Firebase Firestore + Firebase Auth | Instant real-time synchronisation, document-level security rules, seamless Google Popup authentication, and reliable client SDK. | LocalStorage: Would not persist across devices or support multi-user admin dashboards. |
| **Role-Based Access** | Trusted Firestore `/admins/{uid}` collection | Mathematically secure. Non-admin users cannot elevate themselves by altering their own user document fields. | Custom token claims: Requires external Firebase Admin CLI tools not accessible directly in frontend preview. |
| **BenchLM Fallback Strategy** | Hydrated Dataset with Live Proxy Pass-through | Returns live results when the upstream API responds, but seamlessly serves verified benchmark data (SWE-bench, MMLU, GSM8K, Arena Elo) if upstream is rate-limited. | Raw unhandled fetch: A single 429/500 from an external service would crash the public portal. |

---

### 4. Technical Architecture & Data Strategy

#### 4.1 System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React 19 + Vite)                      │
│                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   Top Navigation Bar    │  │       Neo-Brutalist Design Tokens    │  │
│  │  [Brand] [Nav] [Auth]   │  │   Borders: 2px black | Shadow: 4px  │  │
│  └────────────┬────────────┘  └──────────────────┬──────────────────┘  │
│               │                                  │                     │
│  ┌────────────▼──────────────────────┐ ┌─────────▼──────────────────┐  │
│  │     Public Benchmark Explorer     │ │      Personal Eval Lab     │  │
│  │  - Category Filter Controls       │ │  - Create / Edit Eval Form │  │
│  │  - Search Input (Debounced)       │ │  - Prompt Test Comparator  │  │
│  │  - Benchmark Comparison Matrix    │ │  - Private Notes Manager   │  │
│  └────────────┬──────────────────────┘ └─────────┬──────────────────┘  │
│               │                                  │                     │
│               │                        ┌─────────▼──────────────────┐  │
│               │                        │   Role-Based Admin Console │  │
│               │                        │  - Registered User Directory│  │
│               │                        │  - System Content Manager  │  │
│               │                        └─────────┬──────────────────┘  │
└───────────────┼──────────────────────────────────┼─────────────────────┘
                │                                  │
      GET /api/benchmarks/*                        │ Firestore SDK & Auth
                │                                  │ (ABAC Security Rules)
┌───────────────▼──────────────────────┐ ┌─────────▼─────────────────────┐
│    EXPRESS SERVER BACKEND (Port 3000)│ │       FIREBASE SERVICES       │
│                                      │ │                               │
│  - Secure Proxy: /api/benchmarks     │ │  - Firebase Authentication    │
│  - Injects BENCHLM_API_KEY           │ │  - Firestore Database:        │
│  - Rate-limit & Cache Buffer         │ │    • /users/{uid}             │
│  - Fallback Benchmark Repository     │ │    • /user_evals/{evalId}     │
│                                      │ │    • /admins/{uid}            │
│                                      │ │    • /system_content/{id}     │
└───────────────┬──────────────────────┘ └───────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│       BenchLM External API           │
│   (Model Evaluations & Rankings)     │
└──────────────────────────────────────┘
```

#### 4.2 Data Models (Firestore Blueprint Entities)

1. **`users` (`/users/{uid}`)**:
   - `uid`: string (Primary key matching `auth.uid`)
   - `email`: string
   - `displayName`: string
   - `photoURL`: string (optional)
   - `role`: string (`"member"` | `"admin"`)
   - `createdAt`: serverTimestamp
   - `evalCount`: number
   - `status`: string (`"active"` | `"suspended"`)

2. **`admins` (`/admins/{uid}`)**:
   - Read-only whitelist collection populated with initial admin (e.g. `adifery80@gmail.com`).
   - Used by Firestore security rules `isAdmin()` via `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.

3. **`user_evals` (`/user_evals/{evalId}`)**:
   - `id`: string
   - `ownerId`: string (Strictly validated against `request.auth.uid`)
   - `modelName`: string (e.g., `"Claude 3.7 Sonnet"`, `"GPT-4.5"`, `"Gemini 2.5 Flash"`)
   - `benchmarkCategory`: string (`"Coding"`, `"Reasoning"`, `"Agentic"`, `"General"`, `"Custom"`)
   - `benchmarkName`: string (e.g., `"SWE-bench Verified"`, `"Private Prompt Run #1"`)
   - `score`: number (0–100 or metric value)
   - `promptSample`: string (Markdown / test input)
   - `responseSnippet`: string (Model output snippet)
   - `latencyMs`: number
   - `tokenCost`: number
   - `privateNotes`: string (Private commentary and recommendations)
   - `tags`: array of strings (max 5)
   - `createdAt`: serverTimestamp
   - `updatedAt`: serverTimestamp

4. **`system_content` (`/system_content/{contentId}`)**:
   - `id`: string
   - `type`: string (`"announcement"` | `"featured_model"` | `"category_spotlight"`)
   - `title`: string
   - `body`: string
   - `targetModel`: string (optional)
   - `isPublished`: boolean
   - `updatedBy`: string
   - `updatedAt`: serverTimestamp

#### 4.3 Firestore Security Rules Blueprint (Zero-Trust ABAC)
- Catch-all default deny: `match /{document=**} { allow read, write: if false; }`
- Helper `isAdmin()` checks `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.
- `/users/{userId}`: Users can read their own profile; admins can list and read all profiles; users can update their profile name/photo but are blocked from changing `role` or `status`. Admins can update `role` and `status`.
- `/user_evals/{evalId}`:
  - Create: `request.auth.uid == incoming().ownerId && isValidEval(incoming())`
  - Read/List: Strictly enforced: `resource.data.ownerId == request.auth.uid || isAdmin()`
  - Update: `resource.data.ownerId == request.auth.uid && incoming().ownerId == existing().ownerId`
  - Delete: `resource.data.ownerId == request.auth.uid || isAdmin()`
- `/system_content/{contentId}`:
  - Read: Public if `resource.data.isPublished == true`, or if `isAdmin()`
  - Write: Restricted to `isAdmin()`

---

### 5. Implementation Stages & Verification Plan

1. **Stage 1: Firebase Provisioning & Setup**:
   - Trigger `show_aistudio_ui` (`firebase_setup`), verify terms via `GetFirebaseTos`, and invoke `ProvisionFirebase` RPC.
   - Deploy hardened `firestore.rules` and establish `firebase-blueprint.json`.
2. **Stage 2: Express Backend Proxy & BenchLM Integration**:
   - Implement `/api/benchmarks` endpoint with user's `BENCHLM_API_KEY`.
   - Implement graceful caching and schema formatting.
3. **Stage 3: Neo-Brutalist UI & Component Architecture**:
   - Header with 3-zone contract, brutalist theme tokens, and authentication controls.
   - Public Benchmark Explorer with category filtering, search, and comparison drawers.
   - User Eval Lab (full CRUD with modal editors, test metrics, and notes).
   - Role-Based Admin Dashboard with user table and system announcement manager.
4. **Stage 4: Verification & Compilation**:
   - Run `compile_applet` and verify zero TypeScript or build errors.
   - Verify connection testing on boot via `getDocFromServer`.
