# Claude Design prompt: Wiremo Personal redesign

How to use: attach the screenshots of ONE folder at a time (or 8-12 hand-picked ones), paste
**Prompt 1** the first time, then **Prompt 2** for every later batch. The screenshots show
the current app with fictional mock data.

Suggested batches (in this order, so the design system is set by the first two):

1. `02-dashboard` + `06-payment-methods` + `01-authentication/02,04,05,06` (core look)
2. `04-payments` (biller details, confirm, receipt, failed, processing)
3. `05-transactions`
4. `03-enrollment`
5. `01-authentication` (rest) + `08-settings` + `07-notifications`

---

## Prompt 1 - first batch (design system + screens)

```
You are a senior product designer for fintech mobile apps. I'm attaching screenshots of the
CURRENT version of "Wiremo Personal", an iOS/Android app where people pay bills, save cards,
and enroll in auto-debit. Redesign these screens.

GOAL
Modern, clean, minimalist and simple, with smooth transitions. It should feel calm,
trustworthy and fast, like a premium fintech app. Less visual noise, more white space, clear
hierarchy, and one obvious action per screen.

KEEP (do not change)
- Every screen's purpose, content, fields, order of steps and all states shown in the
  screenshots (empty, loading, error, success, pending, declined, modals, bottom sheets).
  Don't invent features or remove any.
- Brand identity: aqua (#31D0DB) as the accent and aegean blue (#3F5770) as the deep tone.
  Refine and extend them, but keep them recognisable.
- Mobile portrait, 440 x 956 pt artboards, iOS conventions, 4 bottom tabs: Dashboard, Bills,
  Transactions, Payment Methods.

CHANGE
1. Visual language: a calm neutral base (white / very light grey), generous spacing on a 4/8 pt
   grid, 16-20 pt screen gutters, soft large-radius cards with no heavy borders or shadows
   (hairline borders or a very soft shadow only), one type family (Poppins or Inter) with a
   clear scale: Display, Title, Body, Caption, plus tabular numerals for all money amounts.
2. Colour: primary buttons must meet WCAG AA contrast (white on #31D0DB is only ~1.9:1;
   use a deeper aqua/teal for filled buttons or dark text on aqua). Semantic colours for
   success, warning, error and info, used sparingly. Provide a dark-mode palette too.
3. Money first: balances, amounts and fees get the strongest typographic weight. Status uses
   one consistent pill (dot + label) across the app.
4. Components, designed once and reused: primary / secondary / tertiary / destructive buttons,
   text inputs (default, focus, filled, error, disabled), cards, list rows, status pills,
   chips, segmented control, bottom sheet, modal / confirm dialog, snackbar / toast,
   skeleton loader, empty state, error state with retry, receipt, stepper, floating tab bar.
5. Fix these issues from the current app while redesigning:
   - The floating tab bar covers the bottom of some pages and hides their only button.
     Reserve space and keep the main action always visible and tappable.
   - Empty, error and success states each look different on every screen. Give them ONE
     consistent pattern (icon or illustration, short title, one line of help, one action).
   - Confirm dialogs use different button layouts. Use one pattern, with a clearly
     destructive style for delete / logout.
   - Titles like "Paypal" and "Qr Ph" are wrongly cased. Use PayPal and QR Ph.
   - Long values (emails, IDs) break mid-word. Use truncation or a stacked label-over-value row.
   - Raw codes ("DP", merchant IDs) should show friendly names.
   - Receipts have no clear success moment. Add a confident success state: large check,
     amount, status and a tidy details list.
   - Use one link colour, and keep the date-range picker inside the palette.

MOTION (specify it, since I can't see it in a still image)
- Show it as a short motion spec next to each screen and, if you can, as a clickable prototype.
- Durations 150-300 ms, ease-out for entering and ease-in for leaving. Use springs for sheets.
- Screen push / pop: subtle horizontal slide with a small fade. The back gesture follows the finger.
- Shared-element transitions where it helps: a biller card expands into Biller Details,
  a transaction row expands into Transaction Details.
- Bottom sheets and modals: slide up with a dimmed backdrop; dismiss by drag or tap outside.
- Tab bar: the active indicator glides between tabs.
- Skeleton shimmer for loading; content cross-fades in. Pull-to-refresh with a light spinner.
- Buttons: 0.97 scale on press, loading state inside the button, disabled to enabled fade.
- Inputs: floating label, animated focus ring, error shake of at most 4 px plus the message
  sliding in.
- Success: check mark draws itself, amount counts up, light haptic. Failure: gentle, no harsh red flash.
- Respect "Reduce Motion" with a cross-fade fallback.

DELIVERABLES
1. A short design-system sheet: colour tokens (light and dark), type scale, spacing, radii,
   elevation, icon style, and the component set above in all their states.
2. Redesigned versions of every attached screen, same state coverage as the screenshots,
   grouped by flow and named like the originals so I can map old to new.
3. A short rationale per screen (2-3 lines) and a list of any content changes you made.

Start with the design system, then the screens. Ask me before changing any flow or copy.
```

---

## Prompt 2 - every later batch

```
Continue the Wiremo Personal redesign. Reuse the design system, tokens, components and motion
rules you already created. Don't introduce new styles unless a screen truly needs it, and tell
me if you do.

Here are the current screenshots for the next flow: <flow name>. Redesign every screen and
state shown, keep all content, fields and steps, and apply the same states, patterns and
transitions as before (empty, loading, error, success, dialogs, sheets).

Call out anything on these screens that doesn't fit the system so I can decide, and add the
motion spec for any transition unique to this flow.
```

---

## Optional follow-ups

- "Make a clickable prototype of the pay-a-bill flow: Bills tab -> biller -> amount -> confirm -> success receipt, with all transitions."
- "Show the same 5 key screens in dark mode."
- "Give me the design tokens as JSON, plus a React Native Paper theme object, so developers can implement them."
- "Make the dashboard calmer: fewer cards, one main action, a clearer 'what needs my attention' area."
