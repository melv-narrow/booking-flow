# Bug Reports

## BUG-001: Layout Reflow on Plasterboard Branching Animation
**Severity:** Medium
**Priority:** P2
**Status:** Open
**Environment:** Next.js 14, Chrome 124, macOS / Local dev
**Steps to Reproduce:**
1. Navigate to Step 2 (Waste Type).
2. Click the "Plasterboard" waste type card to trigger the branching state.
3. Open Chrome DevTools → Performance tab → Record.
4. Observe the expansion animation of the sub-options.
5. Stop recording.
**Actual Result:** The sub-options expand using an animated `max-height` CSS property. This triggers intensive DOM layout reads and writes inside the render cycle (reflow), producing "Recalculate Style" and "Layout" warnings in the Chrome DevTools Performance timeline.
**Expected Result:** The branching state transition should animate using compositor-friendly properties like `transform: scaleY` or `opacity` instead of geometry properties (`max-height`, `height`), avoiding layout thrashing entirely.
**Evidence:** Chrome DevTools Performance profile showing Recalculate Style & Layout warnings during the `max-height: 0 → 500px` transition on `WasteTypeStep.tsx` lines 127–133.
**Notes:** Explicit anti-pattern per Vercel Web Interface Guidelines. Fix requires shifting from layout-bound animations to GPU-accelerated ones. Medium priority because it is a visual smoothness regression, not a data correctness failure — but it is measurable via Lighthouse performance score.

---

## BUG-002: Compositor Paint Delays via Global Transitions
**Severity:** Medium
**Priority:** P3
**Status:** Open
**Environment:** Next.js 14, Chrome 124, macOS / Local dev
**Steps to Reproduce:**
1. Load the Skip Booking app at `/booking`.
2. Open Chrome DevTools → Rendering → Paint Flashing.
3. Hover over any `Button`, `Input`, or `SkipCard` component.
**Actual Result:** The components use `transition-all` Tailwind utility classes. This instructs the browser to interpolate every animatable property simultaneously, causing redundant layout and paint cycles when only background colour or border changes on hover/focus.
**Expected Result:** Transition properties should be explicitly listed (e.g., `transition-colors`, `transition-opacity`) rather than using `all`, ensuring only the necessary visual properties are interpolated.
**Evidence:** Source code inspection: `Button.tsx` className includes `transition-all duration-base`; `SkipCard.tsx` line 88 uses `transition-all duration-base`.
**Notes:** The Vercel Web Interface Guidelines specifically flag `transition: all` as a performance anti-pattern. Fix is low-risk: replace instances of `transition-all` with `transition-colors` in `Button.tsx`, `Input.tsx`, and `SkipCard.tsx`.

---

## BUG-003: Active Spellcheck on Postcode Input
**Severity:** High
**Priority:** P2
**Status:** Open
**Environment:** Next.js 14, iOS Safari 17, iPhone 15 Pro
**Steps to Reproduce:**
1. Open the booking flow on an iOS or Android device.
2. Focus the Postcode input field on Step 1.
3. Type a valid UK postcode like `SW1A 1AA`.
**Actual Result:** The browser keyboard treats the postcode as a standard English word and auto-corrects it to dictionary words mid-entry (e.g., "SW1A" becomes "SWA" or triggers a suggestion overlay). This is especially pronounced on iOS with autocorrect enabled.
**Expected Result:** Native spellcheck and autocorrect should be suppressed on structured reference inputs like postcodes. The keyboard should not attempt text prediction on this field.
**Evidence:** `step1-mobile.png` / manual iOS reproduction. `PostcodeStep.tsx` `<Input>` does not pass `spellCheck={false}` or `autoCorrect="off"`.
**Notes:** Key friction point for mobile conversion rates. The `Input` component requires a `spellCheck` prop to be forwarded to the underlying `<input>` element, and the Postcode field instance must set `spellCheck={false}` and `autoCorrect="off"`.

---

## BUG-004: Plasterboard State Leak on Waste Type Change *(State Transition)*
**Severity:** High
**Priority:** P2
**Status:** Fixed
**Environment:** Next.js 14, Chrome 124, macOS / Local dev
**Steps to Reproduce:**
1. Navigate to Step 2 (Waste Type).
2. Click "Plasterboard".
3. Select any plasterboard sub-option (e.g., "I'll bag it separately").
4. Click "General Waste" or "Heavy Waste" to switch away from plasterboard.
5. Click "Next" to advance to Skip Selection.
6. Select a skip and click "Next" to reach Step 4 (Review).
**Actual Result:** The Review step displays the previously chosen plasterboard sub-option (e.g., "I'll bag it separately") under the Waste Type section, even though the user selected General Waste. The stale `plasterboardOption` value leaked from the WasteTypeStep's local state into the booking-level state via `onComplete`.
**Expected Result:** When the user switches from "Plasterboard" to any other waste type, the plasterboard sub-option should be automatically cleared. The Review step must not display any plasterboard option when the waste type is General or Heavy.
**Evidence:** Manual walkthrough reproduction: select Plasterboard → bag_it → switch to General Waste → complete flow → Review shows "I'll bag it separately".
**Root Cause:** The `useEffect` that called `setSelectedPlasterboardOption(null)` when `selectedWasteType !== 'plasterboard'` was absent from `WasteTypeStep.tsx`. Without it, the stale option persisted in local state and was passed directly to `onComplete`.
**Fix:** Restored the `useEffect` dependency on `selectedWasteType` in `WasteTypeStep.tsx`:
```tsx
useEffect(() => {
  if (selectedWasteType !== 'plasterboard') {
    setSelectedPlasterboardOption(null);
  }
}, [selectedWasteType]);
```
**Commit:** `fix: clear plasterboardOption on waste type change (BUG-004)`

---

## BUG-005: Disabled Skip Card Selectable via Keyboard *(Accessibility / Negative)*
**Severity:** High
**Priority:** P1
**Status:** Fixed
**Environment:** Next.js 14, Chrome 124, macOS / Local dev
**Steps to Reproduce:**
1. Navigate to Step 2 and select "Heavy Waste".
2. Click "Next" to reach Step 3 (Skip Selection).
3. Tab to a skip card marked "Not available for heavy waste".
4. Press `Enter` or `Space` on the keyboard.
**Actual Result:** The disabled skip card's `onSelect` callback fires, adding the disabled skip to the booking state as the selected skip. The card may briefly flash a selected state. This means keyboard users can bypass the intended disabled restriction, allowing an invalid booking configuration to pass through to the Review step.
**Expected Result:** Pressing `Enter` or `Space` on a disabled skip card should have no effect. The card must remain in a non-selected state and the booking flow must not advance with a disabled skip as the selected option.
**Evidence:** Keyboard walkthrough: Tab to a disabled card → `Enter` key → card selection state updates → "Next" button becomes enabled.
**Root Cause:** The `handleKeyDown` function in `SkipCard.tsx` was missing the `if (isDisabled) return;` guard. While `handleSelect` (the click handler) correctly checked `isDisabled`, the keyboard path had no equivalent protection, creating an inconsistency between pointer and keyboard interaction.
**Fix:** Restored the guard as the first statement in `handleKeyDown`:
```tsx
function handleKeyDown(e: React.KeyboardEvent) {
  if (isDisabled) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onSelect();
  }
}
```
**Commit:** `fix: block keyboard selection on disabled SkipCard (BUG-005)`

---

## BUG-006: Double-Submit Race Condition on Confirm Booking *(State Transition)*
**Severity:** High
**Priority:** P1
**Status:** Fixed
**Environment:** Next.js 14, Chrome 124, macOS / Local dev
**Steps to Reproduce:**
1. Complete Steps 1–3 of the booking flow.
2. Reach Step 4 (Review).
3. Click "Confirm Booking" twice in rapid succession (within a single frame, before the button re-renders as disabled).
**Actual Result:** Two `POST /api/booking/confirm` requests are dispatched concurrently. The button's `disabled` state is set by a React `useState` call, which schedules a re-render asynchronously. The double-click occurs before that re-render resolves, so both click events pass the `isSubmitting === false` check and both trigger the full async fetch pipeline.
**Expected Result:** Only one `POST /api/booking/confirm` request is ever sent per confirmation flow, regardless of how quickly the button is clicked. The UI must block the second click synchronously, before any async work begins.
**Evidence:** Browser DevTools → Network tab shows two `POST /api/booking/confirm` requests firing within milliseconds of each other when the button is double-clicked quickly.
**Root Cause:** The original `if (submitAttemptedRef.current) return;` guard (using `useRef`, which updates synchronously without a re-render) was removed from `handleConfirm` in `ReviewStep.tsx`. The fallback of relying on the `isSubmitting` state flag is insufficient because state updates are batched and applied in the next render cycle — not synchronously within the same event handler.
**Fix:** Restored the synchronous `useRef` guard as the first check in `handleConfirm`:
```tsx
const handleConfirm = async () => {
  if (submitAttemptedRef.current) return; // synchronous — blocks before any state update
  submitAttemptedRef.current = true;
  setIsSubmitting(true);
  // ...
  // On error, reset to allow retry:
  submitAttemptedRef.current = false;
};
```
**Commit:** `fix: prevent double-submit with synchronous useRef guard (BUG-006)`
