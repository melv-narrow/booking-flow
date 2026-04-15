# UX Brief — REM Waste Booking Flow

> **Purpose:** Living reference for all UI decisions. Compiled from research on 5 UK skip hire sites, multi-step form UX literature, GOV.UK address patterns, and WCAG-compliant disabled state guidance.
>
> **Last updated:** 15 April 2026 | **Author:** Melvin

---

## 1. Skip Hire Industry UX Patterns

### What competitors do well

| Pattern | Observed On | Adopt? |
|---------|-------------|--------|
| Postcode-first flow (availability + pricing) | HIPPO, Any Waste, GB Skip Hire | ✅ Yes — our Step 1 |
| Skip size described in relatable terms ("holds X bin bags", "small kitchen reno") | HIPPO, Travis Perkins | ✅ Yes — add helper text per size |
| Visual skip illustrations or photos alongside dimensions | SH Skip Hire, Fowles | ⚠️ Nice-to-have, not in spec |
| Price shown per card, not after selection | Most sites | ✅ Yes — price on every SkipCard |
| Permit info collected mid-flow | HIPPO, GB Skip Hire | ❌ Not in assessment scope |
| Progress stepper with descriptive labels | HIPPO, SH Skip Hire | ✅ Yes — our StepIndicator |

### What competitors do poorly

- **No waste type step** — most skip sites don't ask waste type upfront, leading to post-booking issues. Our flow is better: waste type at Step 2 filters skip availability.
- **Custom dropdowns for address** — native `<select>` is faster, more accessible, and less brittle. We use native.
- **Hidden pricing until checkout** — erodes trust. We show price on every skip card.
- **No explanation for disabled options** — skip sites grey out sizes without saying why. We will always explain.

---

## 2. Multi-Step Form UX Directives

### Progress Indicator

- **Use a labelled stepper, not a progress bar.** Users need to know *what* is at each step, not just *how far* they are.
- Labels: **Location → Waste Type → Skip Size → Review**
- Current step: highlighted with colour + `aria-current="step"`
- Completed steps: checkmark icon
- Stepper stays visible at all times (fixed/sticky on mobile)

### Navigation

- **Always show Back and Next.** Back is secondary (ghost/text), Next is primary.
- Back must preserve all previous state — no re-fetching, no clearing.
- Next is disabled until step validation passes. Use `aria-disabled="true"` (not HTML `disabled`) so screen readers can still reach it.

### Validation Timing

- **Validate on step transition (clicking Next), not on every keystroke.**
- Exception: postcode field validates format on blur to give early feedback.
- Error messages appear inline, below the field, immediately on validation failure.
- Error messages must state cause + fix: "Enter a valid UK postcode (e.g. SW1A 1AA)" — not "Invalid input".

### Mobile Form Patterns

- Single column layout. No multi-column on mobile.
- Input height ≥ 44px (touch target).
- Next/Back buttons in fixed bottom bar ("thumb zone").
- Labels above inputs, never placeholder-only.
- Postcode input triggers text keyboard (not numeric — UK postcodes have letters).

---

## 3. UK Postcode Input UX

### Input Behaviour

- **Auto-uppercase** as user types (`onChange` transform to uppercase).
- Accept any spacing/format — normalise on submission (strip whitespace, re-format).
- No aggressive validation while typing. Validate on blur or on "Find address" click.

### Address Lookup Flow

```
[Postcode input] [Find address ▸]
         ↓ (on success)
[Address dropdown — native <select>]
[Enter address manually ↗ link]
         ↓ (on select or manual entry)
[Next ▸]
```

### State Handling

| Postcode | UI State |
|----------|----------|
| `SW1A 1AA` | → Dropdown with 12+ addresses |
| `EC1A 1BB` | → Friendly empty message: "No addresses found for this postcode." + "Enter address manually" link. **Not an error.** |
| `M1 1AE` | → Loading spinner in button, input stays visible, 1500ms delay |
| `BS1 4DJ` | → Error alert: "Something went wrong. Please try again." + "Try again" button. Success on retry. |

### Key Decisions

- Use native `<select>` for address dropdown — not a custom autocomplete.
- "Enter manually" reveals a single text input (one line), not a full address form. Assessment spec only needs `addressId` or `manualAddress`.
- After selecting an address, user can change it by re-selecting from dropdown or clicking "Enter manually."

---

## 4. Disabled State UX

### The Problem

Greyed-out options without explanation cause confusion and accessibility failures:
- Users don't know *why* it's disabled
- `disabled` HTML attribute removes keyboard focus → screen readers skip it entirely
- Low contrast grey fails WCAG perceivability

### Our Approach

**Disabled skip cards must:**

1. **Remain visible** in the grid — never removed from DOM or hidden
2. **Show reduced opacity** (0.5) + `cursor-not-allowed`
3. **Display a clear label**: "Not available for heavy waste" — directly on the card, not in a tooltip
4. **Use `aria-disabled="true"`** instead of HTML `disabled` — keeps the card focusable for screen readers
5. **Prevent selection** via click/keyboard handler guard, not by removing the handler
6. **Maintain position** in the grid — disabled cards don't shift to the end or collapse

### Why Not Tooltips?

- Tooltips fail on touch devices
- Tooltips on disabled elements require `aria-disabled` + complex focus management
- WCAG 1.4.13 compliance adds unnecessary complexity
- **Permanent visible label is simpler, more accessible, and more informative**

---

## 5. Waste Type Selection UX

### Card-Based Selection (not dropdown)

This is a *choice*, not a *form field*. Use selectable cards:

| Card | Helper Text |
|------|-------------|
| **General Waste** | Household, garden, and mixed non-hazardous waste |
| **Heavy Waste** | Soil, concrete, rubble, and similar dense materials |
| **Plasterboard** | Plasterboard must be separated or declared. Choose how you'll handle it below. |

### Plasterboard Branching

- Selecting "Plasterboard" smoothly reveals 3 sub-options (CSS `max-height` transition, not `display` toggle)
- Sub-option labels in plain English:
  - `bag_it` → "I'll bag it separately"
  - `mixed_load` → "It will be mixed with other waste"
  - `separate_collection` → "I need a separate collection"
- Switching away from Plasterboard: collapse sub-options AND clear selected sub-option from state
- Validation: Next blocked if Plasterboard selected but no sub-option chosen

---

## 6. Skip Selection UX

### Grid Layout

- **Mobile (< 768px):** 2 columns
- **Tablet (768–1024px):** 3 columns
- **Desktop (> 1024px):** 4 columns

### Card Content

Each skip card presents customer-centric details:
- **Size name** (e.g. "4 Yard Skip")
- **Relatable description** (e.g. "Holds roughly 30–40 bin bags", "Ideal for small kitchen refits") to help users gauge volume accurately
- **Price** (e.g. "£120")
- **Availability badge** (enabled: nothing extra; disabled: "Not available" label)

### Selection Feedback

- Selected card: teal border + checkmark badge (top-right corner)
- Unselected enabled card: neutral border, hover shows subtle elevation
- Disabled card: 0.5 opacity, "Not available for heavy waste" text, no hover effect

### Mobile Sticky Footer

On mobile, explicitly include a sticky bottom bar to keep the primary call-to-action ("Next") always reachable in the "thumb zone":
- "Selected: 4 Yard — £120" (or "No skip selected")
- Next button in the bar

---

## 7. Review & Confirm UX

### Summary Layout

Clear, scannable summary:

```
📍 Location:     10 Downing Street, London (SW1A 1AA)
🗑️ Waste Type:   Heavy Waste
📦 Skip Size:    4 Yard Skip
💷 Price:        £120.00
```

*If plasterboard:* show selected option as additional line.

### Price Breakdown

Keep it honest and simple:
- Base price: £120.00
- **Total: £120.00**
- No fake tax/delivery rows unless spec requires them.

### Confirm Button Behaviour

1. User clicks "Confirm Booking"
2. **Immediately** disable button + show spinner inside button text
3. Double-submit prevention: `useRef` flag set **synchronously** before `await` call (not `useState` — state updates are batched/async)
4. On success: replace form with confirmation screen (same route, not navigation)
5. On error: show inline error below button, form remains intact for retry

### Confirmation Screen

- ✅ Success icon
- Booking reference: `BK-12345`
- "Start a new booking" link (resets all state)

---

## 8. Visual Design Tokens (Phase 2 Reference)

| Token | Value | Rationale |
|-------|-------|-----------|
| Primary | `#01696f` (teal) | Environmental brand signal |
| Primary hover | `#01565b` | Darkened for contrast |
| Error | `#dc2626` | Standard red |
| Warning | `#d97706` | Amber |
| Success | `#16a34a` | Green |
| Surface | `#ffffff` | Clean background |
| Surface muted | `#f8fafc` | Subtle card backgrounds |
| Text primary | `#0f172a` | Near-black, high contrast |
| Text secondary | `#64748b` | Supporting text |
| Border | `#e2e8f0` | Neutral borders |
| Disabled opacity | `0.5` | Clear but not invisible |
| Border radius (cards) | `8px` | Modern, not overly round |
| Border radius (chips) | `4px` | Compact elements |
| Font | `Inter` | Clean sans-serif, highly readable and consumer-friendly |
| Base size | `16px` | Prevents iOS auto-zoom |
| Spacing unit | `4px` | 4/8/12/16/20/24/32/48 scale |

---

## 9. Accessibility Baseline

- All interactive elements: visible focus ring (2px solid, offset 2px)
- Colour contrast: ≥ 4.5:1 for body text, ≥ 3:1 for large text
- Skip cards: `role="radiogroup"` container, `role="radio"` per card
- Error messages: `role="alert"` or `aria-live="assertive"`
- Step indicator: `aria-current="step"` on active step
- Loading states: `aria-live="polite"` region
- All inputs: associated `<label>` with `htmlFor`
- Touch targets: ≥ 44×44px
- `prefers-reduced-motion`: disable step transitions

---

## 10. Anti-Patterns to Avoid

These are explicit guards against common AI-generated UI patterns:

| Anti-Pattern | Why It's Bad | Our Alternative |
|--------------|--------------|-----------------|
| Gradient buttons | Feels decorative, not transactional | Solid teal primary |
| Emoji as icons | Inconsistent cross-platform, not semantic | SVG icons (Lucide) or text labels |
| All text centred | Harms scannability of forms | Left-align form content |
| Custom dropdowns | Overengineered, accessibility pitfalls | Native `<select>` |
| Hidden disabled items | User can't see what's unavailable | Keep in grid, show explanation |
| Skeleton loaders for everything | Over-engineered for this scope | Simple spinner for API calls, skeleton only for skip grid |
| State management library | Over-engineering for 4-step form | `useState` at page level, prop drill |
| Tooltip on disabled items | Fails on touch, a11y complex | Inline label on card |
| `display: none` for branching | Jarring, no animation | `max-height` CSS transition |
| Random booking IDs | Makes tests flaky | Deterministic IDs from input |

---

*This brief is the authoritative reference for all UI decisions in the booking flow. When in doubt, check here first.*
