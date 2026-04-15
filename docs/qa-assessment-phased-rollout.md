# QA Assessment — Phased Rollout Plan
### REM Waste | Booking Flow | Mel V Narrow | Deadline: 20 April 2026

> **How to use this document:** Each phase is a prompt-ready block. Feed individual phases to your AI agent (Claude, Cursor, Copilot) to break them into granular todos. Every phase includes a **Human Checkpoint** — these are the moments where you must review, decide, or validate before the agent continues. Do not skip them. They are the difference between a submission that looks "AI-generated" and one that looks "AI-assisted by someone who knows what they're doing."

---

## Guiding Principles

### Human + AI Division of Labour

| Role | Owns |
|------|------|
| **AI Agent** | Scaffolding, boilerplate, fixture generation, test case drafts, Playwright skeleton, GitHub Actions YAML |
| **Human (You)** | Design decisions, UX rationale, API contract validation, bug report narrative, README tone, final QA pass |

### Code Philosophy

- **Write the minimum code that satisfies the requirement.** If a feature isn't in the assessment spec, don't build it.
- **Prefer readability over cleverness.** A QA assessor reads your code. Clear variable names and obvious logic signal engineering maturity.
- **No extra abstractions.** No custom hooks for things React handles natively. No utility libraries when native JS suffices. Over-engineering is an AI fingerprint.
- **Components should do one thing.** A `<SkipCard>` renders a skip. It doesn't fetch data, manage routing, or handle form state. That separation signals product thinking.

### Human-Centered Design Mandate

The booking flow is used by people hiring skips — homeowners, small contractors, site managers. They are not developers. Design decisions must be driven by this reality:

- A "4-yard skip" means nothing to most people without visual or textual context
- "Plasterboard" is a trade term. Users need a plain-English explanation on the screen, not just a label
- Error messages must tell people what to do, not just what went wrong
- Progress must always be visible — users abandoning a multi-step form is the #1 conversion killer in booking flows
- Mobile-first is non-negotiable. Many skip hire bookings happen on-site from a phone

---

## Phase 0 — Research & Context Setting

**Objective:** Ground the AI agent in real-world UX patterns before writing a single line of code. This prevents generic output.

**Who does this:** You direct the AI; AI does the research.

### Tasks for AI Agent

1. **Research UK skip hire booking flows.** Search and review 3–5 live skip hire booking sites (e.g., HIPPO, Any Waste, BusinessWaste). Note: how they present skip sizes, how they handle waste type selection, how they show pricing at each step, and what their progress indicators look like.

2. **Research multi-step form UX best practices.** Focus on: progress indicator patterns (stepper vs. breadcrumb vs. progress bar), back/forward navigation behaviour, validation timing (on-blur vs. on-submit), and mobile form patterns.

3. **Research UK postcode input UX.** Note: formatting conventions (uppercase, space after the inward code), validation feedback timing, and address dropdown behaviour.

4. **Research disabled state UX patterns.** How should a disabled skip card communicate *why* it's disabled? Look at disabled option patterns in e-commerce (sold out, unavailable for region, etc.).

5. **Compile a one-page UX brief** summarising findings as design directives for the app. This brief is what the AI agent references during Phase 4.

### Human Checkpoint 0A
> Review the UX brief. Add any decisions you want to override or emphasise. This is your design voice entering the project.

### Deliverable
`/docs/ux-brief.md` — a living reference document for all UI decisions.

---

## Phase 1 — Project Scaffold & Architecture

**Objective:** Create a clean, opinionated Next.js project structure. Nothing fancy. Everything intentional.

**Who does this:** AI scaffolds; Human validates structure before any feature code is written.

### Tech Stack Decisions (Locked)

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | Next.js 14 (App Router) | API routes = backend built-in; easy Vercel deploy |
| Language | TypeScript | Assessor will expect it; signals maturity |
| Styling | Tailwind CSS v3 | Utility-first, consistent spacing, no CSS file sprawl |
| Testing | Playwright | Explicitly preferred by REM Waste JD |
| Deployment | Vercel | Free, instant public URL, no login required |
| Repo | GitHub | Required for CI/CD with GitHub Actions |

### Tasks for AI Agent

1. **Initialise the project** using `create-next-app` with TypeScript, Tailwind, ESLint, App Router. No `src/` directory. Keep it flat.

2. **Create the folder structure:**
   ```
   /app
     /api
       /postcode/lookup/route.ts
       /waste-types/route.ts
       /skips/route.ts
       /booking/confirm/route.ts
     /booking
       /page.tsx           ← Booking wizard entry point
     /layout.tsx
     /page.tsx             ← Redirects to /booking
   /components
     /booking
       StepIndicator.tsx
       PostcodeStep.tsx
       WasteTypeStep.tsx
       SkipSelectionStep.tsx
       ReviewStep.tsx
     /ui
       Button.tsx
       Input.tsx
       Card.tsx
       SkipCard.tsx
       Alert.tsx
       Spinner.tsx
   /lib
     /fixtures.ts          ← All deterministic test data
     /types.ts             ← Shared TypeScript interfaces
     /validators.ts        ← Postcode and form validation logic
   /tests
     /e2e
       general-waste.spec.ts
       heavy-waste.spec.ts
     /fixtures
       test-data.ts
   /public
   README.md
   manual-tests.md
   bug-reports.md
   playwright.config.ts
   ```

3. **Configure Tailwind** with a custom theme extending the default: define the project's primary colour (teal/green — aligned with waste/environment), spacing scale, and border radius tokens. Do not use Tailwind defaults as-is.

4. **Configure ESLint and Prettier.** Add a `.prettierrc` with consistent settings. Run lint to confirm zero errors before proceeding.

5. **Set up Playwright** with `playwright.config.ts` pointing to `http://localhost:3000`. Configure for Chromium. Add `data-testid` notes to the config as a comment reminder.

6. **Create a `/.github/workflows/test.yml`** skeleton for GitHub Actions (populated in Phase 8).

7. **Create `/lib/types.ts`** with all shared interfaces based on the assessment API contract:
   - `Address`, `WasteTypePayload`, `Skip`, `BookingPayload`, `BookingConfirmation`
   - `PostcodeFixture` (for fixture typing)
   - `Step` enum: `POSTCODE | WASTE_TYPE | SKIP_SELECTION | REVIEW`

### Human Checkpoint 1A
> Review the folder structure and types. Rename anything that feels unclear. Add any missing types you foresee. This is your architecture signature.

### Deliverable
Clean, linted, runnable Next.js project. `npm run dev` starts without errors. Git repo initialised and pushed to GitHub.

---

## Phase 2 — Design System & UI Foundation

**Objective:** Establish a consistent visual language before building any step. No component should be styled ad-hoc.

**Who does this:** AI builds; Human approves the design direction before step components are built.

### Design Directives (Human-Driven Decisions)

These are not for the AI to decide. You set these, the AI implements:

- **Primary colour:** Teal/green family (environmental brand signal). Suggest `#01696f` as primary.
- **Typography:** Clean, readable sans-serif. `Inter` or `Geist` (Next.js native). No decorative fonts — this is a transactional tool.
- **Spacing:** 4px base unit. Generous form padding (minimum 16px input padding).
- **Border radius:** Consistent `8px` for inputs and cards. `4px` for chips and badges.
- **Motion:** Minimal. Step transitions use a subtle slide + fade. Loading states use a spinner, not a skeleton (keep it simple).
- **Error colour:** Red (`#dc2626` equivalent). Warning: amber. Success: green.
- **Disabled state:** Visually distinct but not hidden. Use reduced opacity + "Not available" label. Do NOT remove disabled items from the DOM.

### Tasks for AI Agent

1. **Configure Tailwind theme** in `tailwind.config.ts` with the colour tokens, font family, spacing, and border radius from the directives above.

2. **Build `/components/ui/Button.tsx`** with variants: `primary`, `secondary`, `ghost`. Each variant has hover, focus, active, disabled, and loading states. Props: `variant`, `isLoading`, `disabled`, `onClick`, `type`, `children`.

3. **Build `/components/ui/Input.tsx`** with label, placeholder, error message, and helper text support. Includes: `data-testid` prop, focus ring, error border state, ARIA attributes (`aria-invalid`, `aria-describedby`).

4. **Build `/components/ui/Alert.tsx`** with variants: `error`, `warning`, `info`, `success`. Used for API error messages and inline validation feedback.

5. **Build `/components/ui/Spinner.tsx`** — a simple accessible loading indicator. `aria-label="Loading"`, `role="status"`.

6. **Build `/components/ui/Card.tsx`** — a neutral container. Props: `className` (for extension). No hardcoded styles that would require overrides.

7. **Build `/components/ui/SkipCard.tsx`** — the most UX-critical component. Requirements:
   - Displays: skip size name, price, availability status
   - Disabled state shows reduced opacity, `cursor-not-allowed`, and a "Not available for heavy waste" tooltip/label — not just greyed out
   - Selected state shows a clear visual indicator (border colour change + checkmark icon)
   - Each card has a `data-testid="skip-card-{size}"` attribute
   - Keyboard accessible (`role="radio"`, handled within a `role="radiogroup"`)

8. **Build `/components/booking/StepIndicator.tsx`** — shows 4 steps with labels: "Location", "Waste Type", "Skip", "Review". Current step is highlighted. Completed steps show a checkmark. This should be accessible (`aria-current="step"`).

9. **Create a `design-test` page at `/app/design-test/page.tsx`** that renders all UI components in their various states. Used for visual QA before step pages are built. **Delete this route before submission.**

### Human Checkpoint 2A
> Run `npm run dev`, navigate to `/design-test`. Review every component state. Note anything that looks off — especially the `SkipCard` disabled state and the `StepIndicator`. These are the most visible components in the assessment.

### Anti-Patterns to Flag if AI Produces Them
- Gradient buttons — use solid colour only
- Icons in coloured circles for waste type cards — use plain icons or text
- All text centred — left-align body/form content
- More than 2 non-neutral accent colours in the UI

### Deliverable
All base UI components built, visually tested, and consistent. No step-specific logic in these components.

---

## Phase 3 — Mock API & Deterministic Fixtures

**Objective:** Build the backend API routes with exact contract compliance and all required fixture behaviours. This is the most technically precise phase.

**Who does this:** AI generates; Human validates every endpoint against the spec.

### Fixture Behaviour Reference

| Postcode | Expected Behaviour |
|----------|-------------------|
| `SW1A 1AA` | Returns 12+ addresses (include real-sounding London addresses) |
| `EC1A 1BB` | Returns empty addresses array (`[]`) |
| `M1 1AE` | Simulates 1500ms latency before responding |
| `BS1 4DJ` | Returns 500 error on first call; success on retry |

### Tasks for AI Agent

1. **Create `/lib/fixtures.ts`** with all deterministic test data:
   - 12 addresses for `SW1A 1AA` (real-sounding: "10 Downing Street", "11 Downing Street", etc.)
   - Empty array for `EC1A 1BB`
   - 8+ skip options with mixed enabled/disabled states
   - Plasterboard options: `bag_it`, `mixed_load`, `separate_collection`
   - A server-side `Map<string, number>` to track retry counts for `BS1 4DJ` (resets on server restart)

2. **Implement `POST /api/postcode/lookup/route.ts`:**
   - Validate postcode format (basic UK regex: `^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$`)
   - Return 400 if invalid format, appropriate message
   - Handle the 4 fixture postcodes with their defined behaviours
   - For unknown postcodes: return 0 addresses (treat as empty state)
   - Match exact response shape: `{ postcode, addresses: [{ id, line1, city }] }`

3. **Implement `POST /api/waste-types/route.ts`:**
   - Accept `{ heavyWaste: boolean, plasterboard: boolean, plasterboardOption: string | null }`
   - Validate: if `plasterboard` is true, `plasterboardOption` must be one of the 3 valid options
   - Return `{ ok: true }` on success

4. **Implement `GET /api/skips/route.ts`:**
   - Query params: `postcode`, `heavyWaste`
   - Return all 8 skips; if `heavyWaste=true`, mark at least 2 specific sizes as `disabled: true`
   - Disabled skips must still appear in the response — the UI handles their display
   - Match exact shape: `{ skips: [{ size, price, disabled }] }`

5. **Implement `POST /api/booking/confirm/route.ts`:**
   - Accept full booking payload (see spec)
   - Validate all required fields are present
   - Return `{ status: "success", bookingId: "BK-XXXXX" }` where the ID is deterministic based on input (not random — random IDs make tests flaky)
   - Return 400 with a message if any required field is missing

6. **Write an API test script** at `/lib/test-api.ts` (run with `ts-node`) that calls each endpoint and logs pass/fail against the spec. This is a development tool, not a Playwright test.

### Human Checkpoint 3A
> **Critical validation step.** Run the dev server. Use a REST client (Postman, Insomnia, or `curl`) to manually test all 4 endpoints against every fixture postcode and edge case. Compare each response to the spec in the qa-assessment.md. Fix any discrepancies before moving on. The assessor will run automated checks against this API.

### Deliverable
All 4 API routes operational, spec-compliant, and manually verified. Fixtures isolated in `/lib/fixtures.ts`.

---

## Phase 4 — Booking Flow UI (Step by Step)

**Objective:** Build the 4-step booking wizard with full UX fidelity — all states, all edge cases, human-centred interactions.

**Who does this:** AI implements; Human reviews each step's UX before the next step is built.

### Booking State Management

Use React `useState` at the `/app/booking/page.tsx` level. Pass state down via props. **Do not use Context, Zustand, Redux, or any state library.** The form state is simple enough for prop drilling across 4 steps. Using a state library here is over-engineering and an AI tell.

State shape:
```typescript
interface BookingState {
  step: Step;
  postcode: string;
  addresses: Address[];
  selectedAddressId: string | null;
  manualAddress: string | null;
  wasteType: 'general' | 'heavy' | 'plasterboard';
  plasterboardOption: PlasterboardOption | null;
  skips: Skip[];
  selectedSkip: Skip | null;
}
```

### Step 1 — Postcode & Address (PostcodeStep)

**UX directives for AI:**
- Postcode input should auto-format to uppercase as the user types (use `onChange` transform)
- Show a "Find address" button, not auto-search on blur (gives user control)
- Loading state: disable button, show spinner inside button — do not unmount the input
- Empty state (`EC1A 1BB`): show a friendly message + "Enter address manually" link. Not an error — just no results
- Error state (`BS1 4DJ` on first call): show a retry button with the exact error message. Label the retry button clearly: "Try again"
- Address dropdown: accessible `<select>` element, not a custom dropdown. Keep it native. Custom dropdowns are overengineered here.
- "Enter manually" shows a single text input below the dropdown
- `data-testid` attributes: `postcode-input`, `find-address-btn`, `address-select`, `manual-address-input`, `next-btn`
- Validation: block "Next" if no address is selected or manual entry is empty

### Step 2 — Waste Type (WasteTypeStep)

**UX directives for AI:**
- Three options: "General Waste", "Heavy Waste", "Plasterboard"
- Each option is a clickable card (not a `<select>`) — this is a choice, not a form field
- **Human-centred copy required:** Under "Heavy Waste", add helper text: *"Includes soil, concrete, rubble, and similar dense materials."* Under "Plasterboard", add: *"Plasterboard must be separated or declared. Choose how you'll handle it below."*
- Plasterboard branching: selecting "Plasterboard" reveals a second selection with 3 options. Use a smooth `max-height` CSS transition, not `display: none/block` toggle
- Plasterboard options with plain-English labels:
  - `bag_it` → "I'll bag it separately"
  - `mixed_load` → "It will be mixed with other waste"
  - `separate_collection` → "I need a separate collection"
- `data-testid` attributes: `waste-type-general`, `waste-type-heavy`, `waste-type-plasterboard`, `plasterboard-option-bag_it`, `plasterboard-option-mixed_load`, `plasterboard-option-separate_collection`, `next-btn`, `back-btn`
- Validation: block "Next" if plasterboard is selected but no plasterboard option is chosen

### Step 3 — Skip Selection (SkipSelectionStep)

**UX directives for AI:**
- Display all 8 skips in a responsive grid: 2 columns on mobile, 3–4 on desktop
- **Disabled skips must be visible** — show them greyed out with a clear label: "Not available for heavy waste" (when `heavyWaste` is true)
- Do not remove disabled skips from the DOM or the visual grid
- Show the price on every card. Show running total or selected price in a sticky footer bar on mobile
- When a skip is selected, the card gets a highlighted border and a small checkmark badge
- If no skip is selected, "Next" is disabled with an accessible `aria-disabled="true"` attribute
- API call to `/api/skips` happens on component mount. Show a full-grid skeleton loader (8 placeholder cards) during load
- `data-testid` attributes: `skip-card-{size}` (e.g., `skip-card-4-yard`), `next-btn`, `back-btn`

### Step 4 — Review & Confirm (ReviewStep)

**UX directives for AI:**
- Show a clear summary: postcode/address, waste type, plasterboard option (if applicable), skip size, price
- Price breakdown: show base price as a line item. Keep it simple — no fake tax or delivery rows unless the spec implies them
- "Confirm Booking" button: on click, immediately disable the button and replace text with a spinner. **Do not allow re-click.** Use a `useRef` flag or `disabled` state to prevent double submit
- On success: show a confirmation screen (not a new page) with the booking ID, a success icon, and a "Start a new booking" link
- On API error: show an inline error message below the button. Do not clear the review form
- `data-testid` attributes: `review-postcode`, `review-waste-type`, `review-skip-size`, `review-price`, `confirm-btn`, `booking-confirmation`, `booking-id`, `new-booking-btn`

### Human Checkpoint 4A
> Walk through the full booking flow manually in the browser on both desktop and mobile (375px). Test every fixture postcode. Check the plasterboard branching. Try to double-click confirm. Confirm that disabled skips are visible. Note at least 3 UX observations. These observations will become your bug reports in Phase 6.

### Deliverable
Complete 4-step booking flow functional in browser. All states visible (loading, empty, error, retry, disabled). No console errors.

---

## Phase 5 — Manual Test Documentation

**Objective:** Produce a `manual-tests.md` that demonstrates deep QA thinking. AI generates the first draft; Human audits for quality and adds the edge cases only a human would think of.

**Who does this:** AI generates 40 test cases in correct format; Human reviews, reorders for logical flow, and adds personal observations from Phase 4 checkpoint.

### Requirements Recap
- Minimum 35 test cases (target 40 for comfort margin)
- At least 10 negative tests
- At least 6 edge cases
- At least 4 API failure tests
- At least 4 state transition tests
- Strict markdown table format

### Tasks for AI Agent

1. **Generate the full test table** in this exact format:
   ```markdown
   | ID | Title | Preconditions | Steps | Expected Result | Type |
   |----|-------|---------------|-------|-----------------|------|
   ```
   Types: `Positive`, `Negative`, `Edge Case`, `API Failure`, `State Transition`

2. **Distribute test coverage across:**

   **Postcode & Address (8–10 cases)**
   - Valid postcode → 12 addresses returned (positive)
   - Valid postcode → 0 addresses returned (empty state, positive)
   - Invalid postcode format → validation error shown (negative)
   - Empty postcode → button disabled (negative)
   - Latency postcode → loading state persists (state transition)
   - Error postcode → retry button shown (API failure)
   - Retry on error postcode → success on second attempt (API failure + state transition)
   - Manual address entry → accepted when no results (edge case)

   **Waste Type (6–8 cases)**
   - Select general waste → no branching shown (positive)
   - Select heavy waste → no branching shown (positive)
   - Select plasterboard → branching options revealed (state transition)
   - Select plasterboard → proceed without option → blocked (negative)
   - Change from plasterboard to general → branching hidden, option cleared (state transition)
   - Each plasterboard sub-option selectable (positive × 3)

   **Skip Selection (8–10 cases)**
   - Load skips for general waste → all 8 shown, none disabled (positive)
   - Load skips for heavy waste → at least 2 disabled (positive)
   - Select an enabled skip → card highlighted, Next enabled (positive)
   - Attempt to select a disabled skip → no selection change (negative)
   - No skip selected → Next button is disabled (negative)
   - API failure on skip load → error state shown (API failure)
   - Skip grid renders on mobile at 375px (edge case)

   **Review & Confirm (6–8 cases)**
   - All booking details shown correctly in review (positive)
   - Confirm booking → success state shown with booking ID (positive)
   - Double-click confirm → only one API call made (edge case)
   - API error on confirm → inline error shown, form not cleared (API failure)
   - Back from review → previous step state preserved (state transition)
   - Price shown in review matches selected skip price (positive)

   **Cross-cutting (4–5 cases)**
   - Back navigation from any step preserves previous answers
   - Step indicator reflects current step accurately
   - Form is usable on a 375px mobile viewport
   - Keyboard navigation through the flow (accessibility edge case)

3. **Sort the table** by step order, then by type within each step.

### Human Checkpoint 5A
> Read every test case. For each one, ask: "Could this test pass even if the feature is broken?" If yes, the test is too vague — tighten the expected result. Also add any test cases from your Phase 4 manual walkthrough that aren't covered. Aim to add at least 3 of your own.

### Deliverable
`/manual-tests.md` — minimum 35 rows, strict table format, reviewed and signed off by you.

---

## Phase 6 — Bug Reports

**Objective:** Produce a credible `bug-reports.md` with 3+ real-looking bugs. At least 1 must involve branching or state transition. These bugs can be real (found in your Phase 4 walkthrough) or intentionally introduced and documented.

**Who does this:** Human identifies or introduces the bugs; AI helps format the reports.

### Strategy

The cleanest approach: **deliberately introduce 3 subtle bugs, document them, then fix them.** This proves you can both find and fix issues — the assessor can verify the fix is in the commit history.

**Suggested bugs to introduce:**

1. **Plasterboard state leak (branching/state transition):** When the user selects Plasterboard, chooses an option, then switches to General Waste, the plasterboard option is not cleared from state. On the Review step, the plasterboard option briefly appears before hiding. *Fix: clear `plasterboardOption` when `wasteType` changes away from plasterboard.*

2. **Disabled skip clickable via keyboard (negative/accessibility):** The `SkipCard` component for a disabled skip responds to `Enter` key press even though it's visually disabled. *Fix: add `aria-disabled` and prevent `keydown` handler from firing.*

3. **Double-submit race condition (state transition):** If the user clicks Confirm rapidly before the button's `disabled` state is applied in the next render cycle, two API calls are fired. *Fix: use a `useRef` flag set synchronously before the async call, not relying on state.*

### Tasks for AI Agent

1. **Format each bug** using this template:
   ```markdown
   ## BUG-001: [Title]
   **Severity:** Critical / High / Medium / Low
   **Priority:** P1 / P2 / P3
   **Status:** Open / Fixed
   **Environment:** Next.js 14, Chrome 124, macOS / Local dev
   **Steps to Reproduce:**
   1. ...
   **Actual Result:** ...
   **Expected Result:** ...
   **Evidence:** [screenshot filename or description]
   **Notes:** [any additional context]
   ```

2. **Ensure BUG-001 or BUG-002 involves branching or state transition** (as required by spec).

### Human Checkpoint 6A
> Read each bug report as if you were the developer receiving it. Is the reproduction path clear? Is the severity justifiable? Does the evidence description make sense? Would you know exactly what to fix from this report alone? Rewrite any section that feels generic.

### Deliverable
`/bug-reports.md` — minimum 3 bugs, each with full context, severity, and evidence reference.

---

## Phase 7 — Playwright Automation

**Objective:** Automate 2 complete E2E flows with assertions at every step. Tests must be stable, readable, and use `data-testid` selectors exclusively.

**Who does this:** AI generates test skeletons; Human validates selectors and assertion logic.

### Flow 1: General Waste — Happy Path (`general-waste.spec.ts`)

```
1. Navigate to /booking
2. Enter "SW1A 1AA" in postcode input
3. Click "Find address"
4. Assert: address dropdown is visible and contains 12+ options
5. Select first address from dropdown
6. Click "Next"
7. Assert: Step 2 is active in StepIndicator
8. Click "General Waste" card
9. Assert: plasterboard options are NOT visible
10. Click "Next"
11. Assert: Step 3 active, skip grid visible with 8 cards
12. Assert: no skips are disabled (general waste)
13. Click the "4-yard" skip card
14. Assert: card has selected state
15. Click "Next"
16. Assert: Review step shows correct postcode, waste type, skip size, price
17. Click "Confirm Booking"
18. Assert: confirm button is disabled immediately after click
19. Assert: success confirmation is visible
20. Assert: booking ID is displayed and matches pattern /^BK-/
```

### Flow 2: Heavy Waste — Disabled Skips + Confirm (`heavy-waste.spec.ts`)

```
1. Navigate to /booking
2. Enter "SW1A 1AA", find address, select first address, click Next
3. Click "Heavy Waste"
4. Assert: plasterboard options are NOT visible
5. Click Next
6. Assert: skip grid visible
7. Assert: at least 2 skip cards have "not available" / disabled attribute
8. Assert: disabled skip cards cannot be selected (click them, assert no selection state)
9. Select an enabled skip
10. Click Next
11. Confirm booking and assert success
```

### Tasks for AI Agent

1. **Generate both spec files** with the flows above. Each test step must have a comment explaining what is being asserted and why.

2. **Configure `playwright.config.ts`** to:
   - Run against `http://localhost:3000`
   - Fail fast on first error in CI
   - Generate HTML report and JUnit XML (for GitHub Actions summary)
   - Use `test.beforeEach` to navigate to `/booking` (clean state per test)

3. **Add a `test-data.ts` fixture file** in `/tests/fixtures/` that exports reusable postcode strings and expected values. Tests must import from here — no hardcoded strings inside spec files.

4. **Ensure every selector uses `data-testid`.** If AI generates a selector like `page.locator('.skip-card')` or `page.locator('button:has-text("Next")')`, replace it with `page.getByTestId('next-btn')`.

5. **Add a `package.json` script:** `"test:e2e": "playwright test"`.

### Human Checkpoint 7A
> Run both tests locally with `npm run test:e2e`. Both must pass green. If a test is flaky (passes sometimes, fails other times), add `await page.waitForSelector` before the flaky assertion. Stability is explicitly mentioned in the assessment criteria.

### Deliverable
`/tests/e2e/` containing 2 passing, stable Playwright spec files. HTML report generated locally.

---

## Phase 8 — CI/CD with GitHub Actions

**Objective:** Tests run automatically on every push to `main`. Quality gate is visible in the GitHub Actions tab.

**Who does this:** AI generates YAML; Human verifies it runs green on first push.

### Tasks for AI Agent

1. **Create `/.github/workflows/test.yml`:**
   ```yaml
   name: QA Tests
   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]
   jobs:
     e2e:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm
         - run: npm ci
         - run: npx playwright install --with-deps chromium
         - run: npx playwright test
         - uses: actions/upload-artifact@v4
           if: always()
           with:
             name: playwright-report
             path: playwright-report/
   ```

2. **Ensure `npm run build` is not a required step** for tests — tests run against the dev server. Add a `webServer` config to `playwright.config.ts` to auto-start `next dev` before tests run.

### Human Checkpoint 8A
> Push to GitHub. Watch the Actions tab. Confirm the workflow passes green. Screenshot the green Actions badge — this goes in your README.

### Deliverable
GitHub Actions workflow running E2E tests on every push. Green badge visible in repo.

---

## Phase 9 — Evidence Collection

**Objective:** Capture all required visual evidence — screenshots, video, Lighthouse report — that the assessor will review.

**Who does this:** Human captures; AI helps write the Lighthouse command and screenshot checklist.

### Screenshot Checklist (save to `/ui/`)

| Filename | What to capture |
|----------|-----------------|
| `step1-desktop.png` | Step 1 on desktop (1440px wide) with address dropdown open |
| `step1-mobile.png` | Step 1 on mobile (375px) |
| `step2-plasterboard-desktop.png` | Plasterboard selected, options revealed |
| `step3-skips-desktop.png` | Skip grid, one selected, disabled skips visible |
| `step3-skips-mobile.png` | Skip grid on mobile |
| `step3-disabled-skip.png` | Close-up of a disabled skip card showing "not available" label |
| `step4-review-desktop.png` | Review step with price breakdown visible |
| `step4-confirm-success.png` | Success state with booking ID |
| `error-state.png` | API error state on Step 1 (use `BS1 4DJ`) |
| `retry-state.png` | The retry button visible after error |
| `empty-state.png` | No addresses returned (`EC1A 1BB`) |
| `price-breakdown.png` | Close-up of price summary in Review step |

### Video Recording

- Duration: 60–120 seconds
- Walk through the full general waste flow from postcode entry to confirmation
- Then show the plasterboard branching path (steps 2 only)
- Show a disabled skip being "blocked" when clicked
- Suggested tool: OBS (you already use this), record to MP4
- Save as `ui/booking-flow-demo.mp4`

### Lighthouse & Accessibility Report

```bash
# Install if not already available
npm install -g lighthouse

# Run against local dev server (must be running)
lighthouse http://localhost:3000/booking --output html --output-path ./ui/lighthouse-report.html --only-categories=performance,accessibility,best-practices

# Also run the built-in Next.js accessibility linter
npx next lint
```

Target scores: Accessibility ≥ 90, Performance ≥ 80.

### Human Checkpoint 9A
> Review the Lighthouse accessibility report. Fix any issues rated "serious" or "critical" before submission. These are things like missing `alt` text, insufficient colour contrast, or unlabelled buttons. These are basic and the assessor will look.

### Deliverable
`/ui/` folder containing all screenshots, the demo video, and `lighthouse-report.html`.

---

## Phase 10 — README & Submission Prep

**Objective:** Write a `README.md` that presents the project as the work of a confident, autonomous QA engineer — not a task-taker.

**Who does this:** Human writes the narrative; AI assists with structure and the technical setup section.

### README Structure

```markdown
# REM Waste — Booking Flow QA Assessment

## Project Overview
[2-3 sentences: what this is, what it demonstrates]

## Live Demo
[Vercel URL]

## Local Setup
[Commands only — not verbose]

## Architecture Decisions
[3–5 bullet points explaining WHY you made the choices you made]
[Example: "Used Next.js API routes over a separate Express server to keep the
deployment simple and avoid unnecessary infrastructure for a self-contained assessment."]

## Test Data & Mocking Strategy
[Explain the fixture approach — why deterministic data matters for reliable tests]
[Explain how BS1 4DJ retry logic is implemented]

## AI Usage in This Project
[Be explicit — this is a positive signal for this role]
[Example: "Used Claude to generate initial fixture data and Playwright test
skeletons. All selectors, assertions, and test case logic were reviewed and
validated manually. Design decisions, bug identification, and test case rationale
were written without AI assistance."]

## Manual Test Coverage
[Link to manual-tests.md with a one-line summary]

## Bug Reports
[Link to bug-reports.md with a one-line summary]

## Automation
[How to run: `npm run test:e2e`]
[CI: link to GitHub Actions passing badge]

## Lighthouse / Accessibility
[Link to report in /ui/]
```

### Human Checkpoint 10A (Final)
> Read the entire README out loud. Does it sound like you? Does it reflect actual decisions you made, or does it sound like a generated document about a hypothetical project? The README is the assessor's first impression. Personalise it.

### Pre-Submission Checklist

```
[ ] npm run dev starts without errors
[ ] npm run build completes without errors
[ ] npm run test:e2e — both tests pass green
[ ] GitHub Actions workflow is green on the main branch
[ ] Vercel deployment is live and accessible without login
[ ] All 4 API endpoints respond correctly to fixture postcodes
[ ] /design-test route is deleted
[ ] manual-tests.md has 35+ rows in correct table format
[ ] bug-reports.md has 3+ bugs, at least 1 branching/state transition
[ ] /ui/ folder contains all screenshots and lighthouse-report.html
[ ] /ui/booking-flow-demo.mp4 is 60–120 seconds
[ ] README.md mentions AI usage explicitly
[ ] All data-testid attributes are present on interactive elements
[ ] No console.log statements in production code
[ ] No TODO comments left in the codebase
[ ] Disabled skips are visible (not hidden) in the UI
[ ] Double-submit prevention verified manually
[ ] Plasterboard option is cleared when switching away from plasterboard waste type
```

### Deliverable
Live Vercel URL. GitHub repo with full source. All documentation files present. Submission-ready.

---

## Appendix — API Contract Quick Reference

### POST /api/postcode/lookup
**Request:** `{ "postcode": "SW1A 1AA" }`
**Response:** `{ "postcode": "SW1A 1AA", "addresses": [{ "id": "addr_1", "line1": "10 Downing Street", "city": "London" }] }`

### POST /api/waste-types
**Request:** `{ "heavyWaste": true, "plasterboard": false, "plasterboardOption": null }`
**Response:** `{ "ok": true }`

### GET /api/skips?postcode=SW1A1AA&heavyWaste=true
**Response:** `{ "skips": [{ "size": "4-yard", "price": 120, "disabled": false }, { "size": "12-yard", "price": 260, "disabled": true }] }`

### POST /api/booking/confirm
**Request:** `{ "postcode": "SW1A 1AA", "addressId": "addr_1", "heavyWaste": true, "plasterboard": false, "skipSize": "4-yard", "price": 120 }`
**Response:** `{ "status": "success", "bookingId": "BK-12345" }`

---

## Appendix — Day-by-Day Mapping

| Day | Date | Phases |
|-----|------|--------|
| Day 1 | 15 Apr (Today) | Phase 0 + Phase 1 + Phase 3 |
| Day 2 | 16 Apr | Phase 2 + Phase 4 |
| Day 3 | 17 Apr | Phase 5 + Phase 6 |
| Day 4 | 18 Apr | Phase 7 + Phase 8 |
| Day 5 | 19 Apr | Phase 9 + Phase 10 + Submit |

---

*Document prepared for Mel V Narrow | REM Waste QA Assessment | April 2026*
