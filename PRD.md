# Product Requirements Document (PRD)
## Project: BenchPulse — AI Model Benchmark Web Portal & Evaluation Lab

**Document Version:** 1.0  
**Target Platform:** Web (React 19, TypeScript, Vite, Express Proxy, Tailwind CSS v4)  
**Database & Auth:** Firebase Firestore & Firebase Authentication  
**API Integration:** BenchLM Data API (Protected via server environment variable `BENCHLM_API_KEY`)  
**Design Language:** Neo-Brutalism (Hard Black Outlines, Physical Offset Shadows, Electric Accent Blocks, Zero-Pill Typography)

---

## 1. Executive Summary & Goals

### 1.1 Objective
Build a modern, developer-grade web portal that serves as a single destination for AI model benchmark intelligence. The platform pairs a public explorer of state-of-the-art LLM evaluations with an authenticated personal evaluation lab where registered users can record and manage custom evaluations, prompt tests, and private notes. Appointed administrators have a lightweight dashboard to monitor registered users and publish system content.

### 1.2 Core Pillars
1. **Public AI Benchmark Explorer**: Direct on-demand search and filtering of verified AI model benchmarks (SWE-bench, MMLU-Pro, GSM8K, Arena Elo, throughput, cost).
2. **User Evaluation Sandbox (CRUD)**: Authenticated users create, read, update, and delete their own custom evaluations, prompt test runs, and private model notes.
3. **Role-Based Admin Console**: Elevated administrator dashboard to manage user accounts (view registered users, toggle admin permissions, deactivate/activate) and publish system announcements and featured model highlights.
4. **Resilient Data Architecture**: Server-side proxy for the BenchLM API to protect credentials and handle rate limits, backed by Firebase Firestore with strict Attribute-Based Access Control (ABAC) rules.

---

## 2. Target Users & Personas

- **Persona A: AI Practitioner / Engineer ("Jordan")**
  - *Needs*: Quick lookup of real-world benchmarks for coding, reasoning, and latency; ability to benchmark proprietary prompts against public models and store notes privately.
  - *Actions*: Searches BenchLM scores, runs prompt experiments, logs custom evaluation scores and latency notes.

- **Persona B: Tech Lead / Decision Maker ("Elena")**
  - *Needs*: High-level comparative view of models across price, context window, and benchmark scores to decide which LLM to deploy in production.
  - *Actions*: Compares models side-by-side in the matrix view, exports findings, reviews team benchmarks.

- **Persona C: Platform Administrator ("Admin")**
  - *Needs*: Governance over registered user accounts, monitoring platform activity, and posting system notices or spotlighting top models.
  - *Actions*: Accesses role-based admin dashboard, manages user roles/status, updates system announcement banners.

---

## 3. Functional Requirements

### 3.1 Public Benchmark Explorer (Unauthenticated & Authenticated)
- **On-Demand Search**: Real-time debounced query input across model names, providers (Anthropic, OpenAI, Google, Meta, DeepSeek, Mistral), and benchmark domains.
- **Category Filter Tabs**:
  - `All Categories`
  - `Coding & SWE` (SWE-bench Verified, HumanEval, RepoQA)
  - `Reasoning & Math` (MATH-500, GSM8K, GPQA)
  - `Agentic Workflows` (ToolBench, WebArena, GAIA)
  - `Multimodal & Vision` (MMMU, MathVista)
  - `Throughput & Efficiency` (Tokens/sec, TTFT, Price per 1M tokens)
- **Model Card & Detail Inspection**:
  - Provider wordmark & model family.
  - Overall Benchmark Rating and breakdown bars with tabular figures (`tabular-nums`).
  - Context Window length and release timeline.
- **Side-by-Side Model Comparator**:
  - Select up to 3 models to view an immediate differential breakdown table.

### 3.2 User Workspace — Custom Evaluations & Notes (CRUD)
Authenticated users have a private "My Eval Lab" workspace with full CRUD operations:
- **Create**:
  - Select target model (e.g., `Claude 3.7 Sonnet`, `GPT-4.5`, `Gemini 2.5 Flash`, or custom).
  - Benchmark Name & Category.
  - Evaluation Score (0–100 or metric unit).
  - Test Prompt & Model Response output.
  - Measured Latency (ms) and Estimated Token Cost.
  - Private Notes (markdown commentary, failure edge-cases, recommended system prompts).
  - Tags (up to 5 tags, e.g. `production-v1`, `prompt-stress-test`).
- **Read**:
  - Sortable, searchable table and card view of user's evaluations.
  - Metric summary cards (Total Tests Logged, Average Eval Score, Top Tested Model).
- **Update**:
  - Edit score, tweak prompt run records, update private notes, or add/remove tags.
- **Delete**:
  - Modal confirmation with immediate Firestore cleanup.

### 3.3 Role-Based Administration Dashboard
Accessible only to users verified with the Admin role (checks `/admins/{uid}` in Firestore):
- **User Account Management**:
  - Table of all registered user accounts (`email`, `displayName`, `role`, `status`, `joinedAt`, `evalCount`).
  - Search and filter users by status (`active` / `suspended`) or role (`member` / `admin`).
  - Role management: Promote a user to admin or demote back to member.
  - Status toggle: Suspend or reactivate user access.
- **System Content Management**:
  - Post and edit system announcements (broadcast alerts on the portal).
  - Set "Featured Model of the Week" spotlight shown on the public landing page.
  - Manage curated benchmark categories.
- **Activity & System Health**:
  - Quick KPI stats: Total Users, Total Logged Evals, Active System Notices.

### 3.4 Authentication & Identity Management
- Firebase Authentication with Google Popup Provider.
- Guest / Demo account switcher for instant testing in sandboxed environments.
- Initial admin bootstrapping for `adifery80@gmail.com`.

### 3.5 External API Integration: BenchLM Data API
- Upstream Provider: BenchLM (`benchlm.ai` / Benchmark API).
- Authentication: Secure server-side header `Authorization: Bearer ${process.env.BENCHLM_API_KEY}`.
- Backend Express Proxy:
  - `GET /api/benchmarks/search?q={query}&category={category}`
  - `GET /api/benchmarks/models`
  - Injects API Key securely on the server; never exposes credentials in client bundles.
  - In-memory cache with fallback repository ensuring 100% uptime even if upstream rate-limits or is temporarily unreachable.

---

## 4. Non-Functional Requirements & Design Specifications

### 4.1 Neo-Brutalist Visual Design Constitution
- **Containers & Cards**: Solid white (`#FFFFFF`) or cream (`#FBF9F1`) backgrounds with hard `border-2 border-black` or `border-3 border-black` outlines.
- **Physical Shadows**: Stark offset drop-shadows with zero blur (`shadow-[4px_4px_0px_#000]`), transitioning to pressed state on hover/click (`translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_#000]`).
- **Color Blocks**:
  - Primary / Brand Accent: Electric Yellow `#FFE600`
  - Secondary / Tech: Neon Cyan `#00F0FF`
  - Nominal / Success: Vivid Lime `#70FF00`
  - Warning / Alert: Neo Coral `#FF4343`
  - Deep Neutral: Pitch Black `#000000`
- **Zero-Pill Discipline**:
  - No rounded capsule pills or fuzzy borders.
  - Tags and metadata are presented in crisp rectangular badge boxes (`border-2 border-black font-mono text-xs uppercase px-2 py-0.5`).
- **Typography**:
  - Display Headers: `Plus Jakarta Sans`, 800 ExtraBold, uppercase tracking.
  - Body Copy: `Plus Jakarta Sans`, 500 Medium.
  - Tabular Figures & Code: `JetBrains Mono`, `tabular-nums`.

### 4.2 Accessibility & Performance
- Full keyboard navigation with visible high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-black`).
- WCAG AA contrast ratio (> 7:1 for dark on electric accents).
- Client bundle built with Vite, fast sub-second navigation, and zero dead clicks.

---

## 5. Data Architecture & Firestore Schema

### 5.1 Collection: `/users/{uid}`
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'member' | 'admin';
  status: 'active' | 'suspended';
  createdAt: Timestamp;
  evalCount: number;
}
```

### 5.2 Collection: `/admins/{uid}`
```typescript
interface AdminRecord {
  uid: string;
  email: string;
  assignedAt: Timestamp;
}
```

### 5.3 Collection: `/user_evals/{evalId}`
```typescript
interface UserEvaluation {
  id: string;
  ownerId: string; // auth.uid
  modelName: string;
  benchmarkCategory: 'Coding' | 'Reasoning' | 'Agentic' | 'Multimodal' | 'Custom';
  benchmarkName: string;
  score: number;
  promptSample: string;
  responseSnippet: string;
  latencyMs: number;
  tokenCost: number;
  privateNotes: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5.4 Collection: `/system_content/{contentId}`
```typescript
interface SystemContent {
  id: string;
  type: 'announcement' | 'featured_model';
  title: string;
  body: string;
  targetModel?: string;
  isPublished: boolean;
  updatedBy: string;
  updatedAt: Timestamp;
}
```

### 5.5 Firestore Security Rules Architecture
- **Rule 1 (Default Deny)**: `match /{document=**} { allow read, write: if false; }`
- **Rule 2 (Admin Role Verification)**: `function isAdmin() { return request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid)); }`
- **Rule 3 (User Isolation)**: Users can read and write only their own evaluation documents (`resource.data.ownerId == request.auth.uid`).
- **Rule 4 (RBAC Protection)**: Normal users cannot modify their own `role` or `status` attributes. Only admins can update these fields.
- **Rule 5 (Public Content)**: Any user can read `system_content` documents where `isPublished == true`. Only admins can write to `system_content`.

---

## 6. API Proxy Specification

### Endpoints
1. `GET /api/benchmarks/models`
   - *Description*: Fetches top benchmarked models and aggregate scores.
   - *Query Parameters*: `category` (optional), `provider` (optional), `limit` (default: 50).
   - *Headers*: Backend adds `Authorization: Bearer bld_free_0NtAzc6GalHHFvB19OYx-jHA3K4DsbCz2Ld2-g33tE4`.

2. `GET /api/benchmarks/search`
   - *Description*: Performs live on-demand query against BenchLM model directory.
   - *Query Parameters*: `q` (search term).

3. `POST /api/benchmarks/test-connection`
   - *Description*: Health check confirming API status and token validity.

---

## 7. Release Milestones & Implementation Roadmap

- **Milestone 1**: Firebase project provisioning, initial admin bootstrapping, Firestore security rules deployment, and blueprint generation.
- **Milestone 2**: Backend Express proxy server implementation with BenchLM integration and fallback repository.
- **Milestone 3**: Neo-brutalist component foundation, navigation bar, and public benchmark explorer with live search and category filtering.
- **Milestone 4**: Personal Eval Lab workspace with complete CRUD operations (create form, table view, modal edit, deletion).
- **Milestone 5**: Role-based admin console (user account table, role toggle, suspension toggle, announcement publisher).
- **Milestone 6**: End-to-end testing, security rule validation, and applet compilation.
