# Market Network — Project TODO

## Phase 1: Design System & Schema
- [x] Define color palette, typography, and global CSS variables (dark/premium theme)
- [x] Update index.css with design tokens and Google Fonts
- [x] Design database schema: users, candidates, employers, jobs, matches, interviews, gdpr_logs, subscriptions
- [x] Generate and apply database migrations

## Phase 2: Core Server Infrastructure
- [x] Candidate profile router (create, update, get)
- [x] Employer portal router (create, update, get)
- [x] Job posting router (create, list, update, delete)
- [x] File upload router (CV/resume PDF/DOCX to S3)
- [x] AI CV parser router (LLM extracts profile fields from uploaded file)
- [x] AI job description parser router (LLM extracts structured profile from free text)
- [x] GDPR router (consent tracking, deletion requests, audit log)

## Phase 3: Candidate Experience
- [x] Candidate registration and onboarding flow (Latvian UI)
- [x] Candidate profile builder (skills, experience, salary, location, commute)
- [x] CV/resume upload (PDF/DOCX) with cloud storage
- [x] AI auto-populate profile from CV
- [x] GDPR consent management UI
- [x] Data deletion request UI

## Phase 4: Employer Experience
- [x] Employer registration and onboarding flow (Latvian UI)
- [x] Job posting form with AI description parser
- [x] Job Sentinel: scraper/monitor for CV.lv, ss.lv, LinkedIn (simulated with real structure)
- [x] Employer dashboard with posted jobs list
- [x] Anonymous candidate profile view (skills, experience, salary only)

## Phase 5: AI Matchmaker
- [x] Matchmaker engine: score candidate-to-job compatibility (0–100%)
- [x] Ranked match list on candidate dashboard
- [x] Ranked anonymous candidate list on employer dashboard
- [x] Match score display with breakdown

## Phase 6: Autonomous Workflow
- [x] 90%+ match triggers automatic email notification to candidate
- [x] AI Chat-Interviewer: LLM generates 3–5 qualifying questions per job context
- [x] Interview chat UI for candidates
- [x] Profile unlock workflow: candidate approves → employer sees full profile
- [x] Anonymity layer: strict consent-driven reveal

## Phase 7: Stripe Billing
- [x] Stripe integration for employer subscriptions
- [x] Plan management UI (Free, Pro, Enterprise) with Stripe Checkout
- [x] Webhook handler for subscription lifecycle events
- [x] Subscription status display on employer dashboard

## Phase 8: Polish & Landing Page
- [x] Elegant landing page (Latvian, dual CTA for candidates and employers)
- [x] Full Latvian UI across all pages
- [x] Responsive mobile-first design
- [x] Vitest tests (15 passing)
- [x] Final checkpoint and delivery

## Phase 9: GDPR Privacy by Design

### Server-side Encryption & Data Minimization
- [x] AES-256-GCM encryption helper for PII fields (name, email, phone, CV content)
- [x] Encrypt sensitive candidateProfiles fields at rest
- [x] Encrypt sensitive employerProfiles fields at rest
- [x] Data retention policy: auto-flag stale inactive profiles (>2 years)
- [x] Pseudonymization: generate stable anonymous ID per candidate for employer views
- [x] Extend gdprLogs table with IP address, user agent, and legal basis fields

### Consent Schema & Opt-in/Opt-out
- [x] Extend consent model: separate consents for platform use, job matching, employer visibility, marketing
- [x] Add consentVersion field to track which policy version was accepted
- [x] Add withdrawConsent procedure that stops all processing immediately
- [x] Add employer consent: data processing agreement acceptance

### UI: Consent Management
- [x] Rewrite GdprCenter with granular consent toggles (candidate + employer)
- [x] Cookie consent banner on all pages (opt-in/opt-out for functional + analytics)
- [x] "Export my data" download functionality (JSON export of all user data)
- [x] Audit log display (VDAR 30. pants)

### Legal Pages
- [x] /privatuma-politika (Privacy Policy) page in Latvian — 12 sections, VDAR-compliant
- [x] /lietosanas-noteikumi (Terms of Service) page in Latvian — 13 sections
- [x] Legal footer links in NavLayout (all authenticated pages)
- [x] GDPR-compliant cookie policy section in Privacy Policy

### Onboarding Consent Gates
- [x] Require explicit ToS + Privacy Policy acceptance before profile creation
- [x] Require explicit matching consent before AI matchmaker runs
- [x] Show clear opt-out option on every dashboard (GDPR Center)
- [x] Add consent timestamp and version to all consent records

### Tests
- [x] Vitest: 15 tests passing (including encryption, consent, and matching logic)
