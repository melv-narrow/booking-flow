# Bug Reports

## BUG-001: Layout Reflow on Plasterboard Branching Animation
**Severity:** Medium
**Priority:** P2
**Status:** Open
**Environment:** Next.js 14, Chrome 124, macOS / Local dev
**Steps to Reproduce:**
1. Navigate to Step 2 (Waste Type).
2. Click the "Plasterboard" waste type card to trigger the branching state.
3. Observe the expansion animation of the sub-options.
**Actual Result:** The sub-options expand using an animated `max-height` CSS property. This triggers intensive DOM layout reads and writes inside the render cycle (reflow), violating compositor-only animation guidelines.
**Expected Result:** The branching state transition should animate using compositor-friendly properties like `transform: scaleY` or `opacity` instead of geometry properties.
**Evidence:** Chrome DevTools Performance profile showing Recalculate Style & Layout warnings during state transition.
**Notes:** Vercel Web Interface Guidelines explicit anti-pattern. Fix requires shifting from layout-bound animations to GPU-accelerated ones.

## BUG-002: Compositor Paint Delays via Global Transitions
**Severity:** Medium
**Priority:** P3
**Status:** Open
**Environment:** Next.js 14, Chrome 124, macOS / Local dev
**Steps to Reproduce:**
1. Load the Skip Booking app.
2. Hover over any `Button`, `Input`, or `SkipCard` components.
**Actual Result:** The components use `transition-all` utility classes. This instructs the browser to interpolate all properties, causing redundant layout/paint cycles when changing background colors or borders on hover/focus.
**Expected Result:** Properties should be explicitly listed (e.g., `transition-colors`, `transition-opacity`, or explicit custom transition paths) rather than `all`.
**Evidence:** Source code inspection across `Button.tsx`, `Input.tsx`, and `SkipCard.tsx`.
**Notes:** Vercel Web Interface Guidelines specifically flags `transition: all` as an anti-pattern. Easy fix: replace `transition-all` with tight, specific transitions.

## BUG-003: Active Spellcheck on Postcode Input
**Severity:** High
**Priority:** P2
**Status:** Open
**Environment:** Next.js 14, iOS Safari 17, iPhone 15 Pro
**Steps to Reproduce:**
1. Open the booking flow on an iOS or Android device.
2. Focus the Postcode input field on Step 1.
3. Type a valid UK postcode like 'SW1A 1AA'.
**Actual Result:** The browser keyboard considers the postcode a standard word and actively spellchecks it, auto-correcting valid postcodes to dictionary words.
**Expected Result:** Native spellcheck should be disabled on code/reference inputs to prevent keyboard thrashing on mobile devices.
**Evidence:** step1-mobile.png / manual iOS test reproduction.
**Notes:** This is a key friction point for mobile conversion rates. The `Input` component requires a `spellCheck={false}` prop mapping, and the Postcode field must disable it.
