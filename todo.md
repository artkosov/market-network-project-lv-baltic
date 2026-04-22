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

## Phase 10: UX Polish & Advanced Features

### Analytics Dashboard
- [x] Employer analytics page (/darbadevetajs/analytics) with Recharts charts
- [x] Bar chart: matches per job posting
- [x] Pie chart: vacancy status distribution (active/paused/closed)
- [x] Pie chart: job type distribution (full_time/part_time/contract)
- [x] Pie chart: remote policy distribution (onsite/hybrid/remote)
- [x] Bar chart: salary range per vacancy
- [x] KPI cards: total jobs, total matches, avg matches/job, avg salary
- [x] Analytics link in employer navigation bar

### Enhanced EmployerProfile
- [x] Logo upload with image preview (JPG/PNG/WebP/SVG, max 2MB)
- [x] Industry dropdown with 14 Latvian industry categories
- [x] Registration number field (Latvian company reg. number)
- [x] Social links section (LinkedIn, Twitter/X, Facebook)
- [x] Profile completion progress bar with 6 completion indicators
- [x] GDPR compliance notice card
- [x] Back-to-dashboard navigation button

### Enhanced JobPostings
- [x] Real-time search filter (by title and city)
- [x] Status filter buttons (all/active/paused/closed)
- [x] Stats row (active/paused/closed counts)
- [x] Skills preview badges on each job card
- [x] Job close confirmation dialog
- [x] Analytics button in header
- [x] Remote policy and experience years display

### Enhanced Matches UI
- [x] Stats cards (total, 90%+ count, average score)
- [x] Full-text search filter
- [x] Status dropdown filter
- [x] Minimum score filter (all/50%+/70%+/90%+)
- [x] Sort by score or date
- [x] Color-coded score badges (green/gold/yellow/grey)
- [x] "Izcils" badge for 90%+ matches
- [x] Skills badges in employer view
- [x] Green border highlight for 90%+ matches

### Telegram Notifications Component
- [x] TelegramSetup component with step-by-step instructions
- [x] Bot link and /start command copy button
- [x] Chat ID input with save functionality
- [x] Active status indicator

### Admin Panel
- [x] /admin route with role-based access control (admin only)
- [x] Platform KPI cards (users, jobs, matches, subscribers)
- [x] Subscription plans display
- [x] System status health check
- [x] Admin action cards (user management, GDPR reports, analytics)

### Enhanced Home Page
- [x] Testimonials section with 3 user reviews and star ratings
- [x] FAQ accordion section with 6 questions
- [x] 4-column footer with platform links, legal links, contact info
- [x] "Atsauksmes" nav link
- [x] Updated features grid (7 features including Analytics)
- [x] Telegram paziņojumi in candidate CTA feature list
- [x] Analytics un pārskati in employer CTA feature list
- [x] GDPR status indicator in footer
