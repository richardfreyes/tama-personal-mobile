# 🐛 Debugging Guide

Tips and tools for debugging the Aqwire Personal mobile app across platforms.

---

## 🧰 Available Tools

| Tool | Best For | Setup Required |
|------|----------|----------------|
| **Expo Dev Tools** | Quick JS debugging, console logs | None (built-in) |
| **Reactotron** | Redux state, API calls, AsyncStorage | Yes — see [REACTOTRON.md](./REACTOTRON.md) |
| **React Native DevTools** | Component tree, profiling | None (built-in since RN 0.73) |
| **Chrome DevTools** | JS breakpoints, network tab | Press `j` in Expo CLI |

---

## 🖥 Expo CLI Shortcuts

When the dev server is running (`npm start`), these keyboard shortcuts are available in the terminal:

| Key | Action |
|-----|--------|
| `j` | Open JS debugger (Chrome DevTools) |
| `r` | Reload the app |
| `m` | Toggle the dev menu |
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator |
| `w` | Open in web browser |

---

## 📡 Debugging API Calls (RTK Query)

This project uses one RTK Query API slice:

| Slice | Base URL | File |
|-------|----------|------|
| `appApi` | Wiremo API | `redux/appApi.ts` |

### Viewing API calls

1. **Reactotron** (recommended) — Shows every fetch request with full URL, headers, status, and response body in the Network tab. See [REACTOTRON.md](./REACTOTRON.md).

2. **Redux actions** — Every RTK Query request dispatches actions you can trace:
   - `api/executeQuery/pending` — request started
   - `api/executeQuery/fulfilled` — response received
   - `api/executeQuery/rejected` — request failed

   These are visible in Reactotron's Redux timeline with full payload.

3. **Console logging** — Add a temporary `console.log` in your query's `transformResponse` or `onQueryStarted`:
   ```ts
   onQueryStarted: async (arg, { queryFulfilled }) => {
     const { data } = await queryFulfilled;
     console.log('Response:', data);
   },
   ```

### Debugging RTK Query cache issues

RTK Query caches responses by endpoint + serialized args. Common gotchas:

- **Stale data after navigation** — Lazy queries (`useLazy*`) retain previous `data` until the new query resolves. Gate your UI on the loading state or track initialization (see `useInitializeEnrollmentPaymentMethod` for the pattern).
- **Cache not updating** — Check that `invalidatesTags` / `providesTags` match between queries and mutations.
- **Resetting cache** — Dispatch `appApi.util.resetApiState()` to clear cached RTK Query data.

---

## 🔴 Common Issues & Fixes

### App crashes on startup

1. Clear Metro cache:
   ```bash
   npx expo start --clear
   ```
2. Reset node_modules:
   ```bash
   rm -rf node_modules && npm install
   ```
3. For native builds, clean and rebuild:
   ```bash
   npx expo prebuild --clean
   ```

### "Network request failed" on Android emulator

Android emulator can't reach `localhost` directly. The emulator maps `10.0.2.2` to the host machine's `localhost`. Ensure your API base URL uses `10.0.2.2` for the `local` environment, or use the `device` environment with your machine's IP.

### Redux state looks wrong

1. Open Reactotron — check the action timeline to see exactly which actions fired and in what order.
2. Check the `RESET_APP_STATE` action — dispatching `{ type: 'RESET_APP_STATE' }` wipes the entire Redux store (see `redux/store.ts`). This fires on logout.
3. RTK Query middleware order matters — `appApi.middleware` must be in the chain.

### Console logs not appearing

In production builds, `console.log`, `console.error`, and `console.warn` are silenced:
```ts
// app/_layout.tsx
if (!__DEV__) {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
}
```
This only affects production. In `__DEV__` mode, all console methods work normally and also appear in Reactotron's timeline.

---

## 📱 Platform-Specific Debugging

### iOS Simulator

- **View logs**: Open Console.app → filter by your app name
- **Simulate slow network**: Xcode → Open Developer Tool → Network Link Conditioner
- **Shake gesture**: `Cmd + D` to open the React Native dev menu

### Android Emulator

- **View native logs**:
  ```bash
  adb logcat *:E
  ```
- **Shake gesture**: `Cmd + M` (Mac) or `Ctrl + M` (Windows/Linux) to open the dev menu
- **Cleartext traffic**: Already enabled in `app.json` via `expo-build-properties` for local API calls

### Physical Device

- **Same Wi-Fi required** — Your phone and dev machine must be on the same network.
- **Reactotron on physical device** — If auto-detection fails, set `host` in `ReactotronConfig.ts`:
  ```ts
  .configure({ name: 'Aqwire Personal', host: '192.168.1.100' })
  ```
  Replace with your machine's local IP (`ifconfig | grep inet`).

---

## 🧪 Debugging Tests

```bash
# Run all tests
npm test

# Run a specific test file
npx jest path/to/test.ts

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Debug a test with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand path/to/test.ts
```

---

## 📚 Related Docs

- [REACTOTRON.md](./REACTOTRON.md) — Reactotron installation and usage
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) — Redux store architecture
- [SETUP.md](./SETUP.md) — Project setup and environment configuration
