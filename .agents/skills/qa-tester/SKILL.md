---
name: qa-tester
description: QA-test the TamaPay mobile app (tama-personal-mobile). Use when asked to test, QA, verify, smoke-test or reproduce a bug in a screen or flow (login, dashboard, bills, payment methods, transactions, notifications, settings) — runs the Jest suite, then drives the iOS simulator to check the change on a real screen and reports pass/fail with evidence.
---

# QA tester — TamaPay mobile

Verify a change the way a user would see it. Do the cheap checks first, then the simulator, and report only what you actually observed.

## 1. Scope the test
- Ask or infer: which screen/flow, what changed, expected behavior. If it's a bug report with a screen recording, note the recording may be unreadable (Desktop is often not accessible, `ffmpeg` is not installed) — ask for the symptom instead of guessing.
- List the checks as a short table: **Check · Steps · Expected**. Include the happy path, one empty/error state, and anything adjacent the change could break (e.g. changing the shared sheet affects Transactions filter, Notifications menu and Settings photo sheet).

## 2. Static + unit checks (always run first)
Run from `tama-personal-mobile/`:

```bash
npx tsc --noEmit            # clean as of 2026-10-08 (0 errors) — any error is new
npx expo lint               # 0 errors, ~22 pre-existing warnings
npx jest <path-or-name>     # targeted first
npx jest                    # full suite before reporting done (~160 suites)
```

Report counts exactly (`Test Suites: x passed`, `Tests: y passed`). Existing `act()` warnings from animations are noise. When a component changes, update its test in `__tests__/` (mirrors the source tree) instead of leaving a stale mock.

## 3. Simulator checks
Use the iOS Simulator tool (`mcp__Claude_Code_iOS_Simulator__control`). Open the live panel with `attach` before anything slow.

### Getting the app up
- Metro must be running (`curl -s localhost:8081/status` → `packager-status:running`). If not, ask the user to start it (`npm start`) — don't leave a second server running.
- App runs in **Expo Go**. Reload / deep-link with:
  ```bash
  xcrun simctl openurl booted "exp://$(ipconfig getifaddr en0 || echo 127.0.0.1):8081/--/<route>"
  ```
  Routes: `/transactions`, `/notifications`, `/settings`, `/dashboard`, `/bills`, `/payment-methods`.
- A cold reload takes **~1–2 minutes** (25 MB bundle, "Opening project…" → splash → screen). Wait with `Monitor` (an `until` loop or a bounded `sleep`), never poll with repeated screenshots. If the app is stuck/blank, `xcrun simctl terminate booted host.exp.Exponent`, relaunch, then `openurl` again.
- Fast refresh applies code edits in ~10 s but **resets open sheets/modals** — reopen after each edit.

### Login / session
- Sessions expire; a 401 shows "For your security, we logged you out" and the login screen.
- **Never type the user's credentials.** The backend is a real dev server, not a local one. Stop, tell the user the app is on the login screen, and wait until they log in. Only use values from the project's own seed/fixtures if the target is a local mock server (`npm run start:mock` + `__mocks__/server`).

### Driving the UI (gotchas learned the hard way)
- Tap coordinates are **device points** (402×874 on iPhone 18 Pro). Screenshots come back at 920×2000, so divide screenshot pixels by ~2.29.
- The simulator/app can be **laggy**: a tap may only take effect seconds later and a screenshot taken right after can show the old state. Wait ~4–6 s before judging "nothing happened".
- The **Expo dev-menu gear** floats top-right (≈ x 340–392, y 62–115 pt) and swallows taps on header buttons there (e.g. the ⋮ on Notifications). Tap just left of it (≈ x 322–325).
- Bottom tab bar (y ≈ 815 pt): Home x≈67, Bills ≈156, History ≈245, Wallet ≈335.
- Prefer `screenshot` with `scale` 0.3–0.4 for state checks; full scale only when reading small text.
- To prove a handler fires when UI shows nothing, temporarily add an `Alert.alert('dbg', …)` — and **remove it** afterwards (grep for `dbg`). Never leave debug code, edits to `node_modules`, or backup files in the repo.

### Per-area checklist
| Area | Check |
|---|---|
| Transactions | List loads; filter button opens sheet; tick status/type + Apply → list filtered; reopen sheet shows the applied selections; Reset clears; search works; scroll loads more |
| Notifications | ⋮ opens menu sheet; backdrop tap closes; Unread/Recent toggle |
| Settings | Profile block opens "Upload Profile Photo" sheet (library / camera / remove, correct icons); Profile, Account & Security, Help, About, Contact, Logout navigate |
| Bottom sheets (all) | Opens at the right height, backdrop dims the page, backdrop tap and drag-down close it, content isn't blank/clipped, keyboard doesn't cover inputs. `SlideUpScreenModal` is a native `Modal`, so it floats above navigation: any sheet row that does `router.push` must call `ref.current?.close()` first (bug found in Notifications → Notification Settings) |
| Bills / Payment methods | List renders, add flow reachable, form validation messages |
| Auth | Login error states; logout returns to login |

### Router-link sweep
- Static: extract literal `router.push/replace`, `href` and `pathname` targets and match them to `app/**` routes (all 45 matched as of 2026-10-08).
- Live: deep-link each route (`xcrun simctl openurl booted "exp://<host>:8081/--/<route>"`) and screenshot with `xcrun simctl io booted screenshot`. Run the loop in the background (~10 s/route with `sleep 9`) but wait for it with a foreground `until grep -q <done-marker> <log>; do sleep 5; done` — the job barely advances while you only poll with short Monitors. Build a contact sheet (a small Swift/AppKit script) to review 6 screens per image; run it and shrink images with `sips -Z 420` before reading. Tap-through is needed for flows that carry params.
- Never tap Confirm/Pay/Delete/Save/Logout/Deactivate while sweeping; stop at the screen before any money or account change.

## 4. Report
Use this shape, and keep it short:

- **Result:** PASS / FAIL / BLOCKED (say why — e.g. blocked on login)
- **Ran:** commands with real counts (tsc, jest, simulator screens visited)
- **Evidence:** what you saw per check (✔/✘ + one line). Quote exact text for failures.
- **Not tested:** Android, other screens, flows you couldn't reach — list explicitly. Never imply coverage you didn't have.
- **Bugs found:** file:line, repro steps, expected vs actual. Fix only if asked; otherwise propose.

## 5. Leave things clean
- Restore any file you instrumented; confirm with `grep -rn "dbg" app components`.
- Don't change `package.json`/lockfile while testing unless the user asked.
- Leave the simulator on a sensible screen and mention if the user needs to log in again.
