# ⚡ Reactotron Setup & Usage

Reactotron is a desktop app for inspecting Redux state, API calls, AsyncStorage, and console logs in development. It connects over WebSocket — no native module linking required.

---

## 📋 Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | v18+ |
| Reactotron Desktop App | Latest |

Download the desktop app from: [github.com/infinitered/reactotron/releases](https://github.com/infinitered/reactotron/releases)

---

## 📦 Installation

The dev dependencies are already installed in this project:

```bash
npm install --save-dev reactotron-react-native reactotron-redux
```

| Package | Purpose |
|---------|---------|
| `reactotron-react-native` | Core Reactotron client for React Native |
| `reactotron-redux` | Redux action/state monitoring plugin |

---

## 🗂 Project Files

### `ReactotronConfig.ts` (project root)

The configuration file that creates and connects the Reactotron instance:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({ name: 'Aqwire Personal' })
  .useReactNative({
    asyncStorage: true,
    networking: { ignoreUrls: /symbolicate|logs$/ },
    editor: false,
    errors: { veto: () => false },
    overlay: false,
  })
  .use(reactotronRedux())
  .connect();

export default reactotron;
```

**Plugin breakdown:**

| Option | What it does |
|--------|--------------|
| `setAsyncStorageHandler` | Enables AsyncStorage key/value browsing in Reactotron |
| `asyncStorage: true` | Tracks AsyncStorage reads/writes in the timeline |
| `networking` | Intercepts `fetch`/`XMLHttpRequest` — logs all API calls with request/response |
| `ignoreUrls` | Filters out Expo internal requests (symbolicate, logs) to reduce noise |
| `errors` | Captures JS errors in the timeline |
| `reactotronRedux()` | Adds Redux action logging, state snapshots, and the store enhancer |

### `redux/store.ts`

The Redux store conditionally loads Reactotron in development:

```ts
const reactotron: { createEnhancer?: () => any } | undefined = __DEV__
  ? require('../ReactotronConfig').default
  : undefined;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(appApi.middleware),
  enhancers: (getDefaultEnhancers) => {
    if (__DEV__ && reactotron?.createEnhancer) {
      return getDefaultEnhancers().concat(reactotron.createEnhancer());
    }
    return getDefaultEnhancers();
  },
});
```

**Why `require()` instead of `import`?**

Using a conditional `require()` guarded by `__DEV__` lets Metro's dead-code elimination strip Reactotron entirely from production bundles. A top-level `import` would always be included.

---

## 🚀 Usage

### Starting a session

1. Open the **Reactotron desktop app**
2. Start the dev server:
   ```bash
   npm start
   ```
3. Launch the app on your emulator/simulator or device
4. Reactotron auto-connects — you should see "Connection established" in the desktop app

### Reactotron tabs

| Tab | What you see |
|-----|--------------|
| **Timeline** | Chronological stream of all events — Redux actions, API calls, console logs, errors |
| **State** | Browse the full Redux store tree. Expand any slice (`login`, `csrf`, `appApi`, `snackbar`, `modal`, `enrollmentReview`) |
| **Network** | All `fetch` requests with URL, method, status code, headers, and response body |
| **AsyncStorage** | Browse all stored key/value pairs (e.g., `wiremo.token`) |

### Inspecting Redux actions

Every Redux action appears in the Timeline with:
- **Action type** — e.g., `appApi/executeQuery/fulfilled`
- **Payload** — Full request/response data for RTK Query actions
- **State diff** — What changed in the store after this action

Click any action to expand its details.

### Inspecting API calls

All RTK Query `fetch` requests appear in the Timeline and Network tabs:

- **Request**: method, URL, headers, body
- **Response**: status code, headers, response body
- **Timing**: duration in milliseconds

The `ignoreUrls` filter in the config hides Expo's internal symbolicate and log requests.

### Inspecting AsyncStorage

Go to the **AsyncStorage** tab to see all stored keys. This project stores:
- `wiremo.token` — JWT authentication token

You can view, edit, or delete values directly from Reactotron.

---

## 📱 Connection Guide by Platform

| Platform | Connection | Notes |
|----------|-----------|-------|
| **iOS Simulator** | Automatic | Connects to `localhost` |
| **Android Emulator** | Automatic | Maps `10.0.2.2` to host `localhost` |
| **Physical Device** | May need manual IP | See below |

### Physical device setup

If Reactotron doesn't auto-connect on a physical device:

1. Find your machine's local IP:
   ```bash
   # macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # or
   ipconfig getifaddr en0
   ```

2. Update `ReactotronConfig.ts` with your IP:
   ```ts
   .configure({ name: 'Aqwire Personal', host: '192.168.1.100' })
   ```

3. Ensure your phone and machine are on the **same Wi-Fi network**

4. Restart the app

> **Tip**: Don't commit the `host` change. Use it only during local development on a physical device.

---

## 🔧 Troubleshooting

### Reactotron doesn't connect

1. **Desktop app running?** — Must be open before the app starts
2. **Same machine?** — The desktop app must run on the same machine as the dev server
3. **Firewall?** — Reactotron uses port `9090` by default. Ensure it's not blocked
4. **Restart both** — Close Reactotron, kill the app, restart Reactotron first, then the app

### No Redux actions showing

- Verify the enhancer is loaded: check for `"Reactotron"` in the Reactotron connection log
- Ensure `redux/store.ts` has the `enhancers` option with `reactotron.createEnhancer()`
- Run `console.log('Reactotron:', __DEV__, !!reactotron)` in store.ts to verify

### No network requests showing

- `networking` must be `true` (or an options object) in `useReactNative()`
- Requests made before Reactotron connects won't appear — connect first, then navigate
- The `ignoreUrls` regex filters out matches — check it's not too broad

### Too much noise in Timeline

Adjust the config to disable features you don't need:

```ts
.useReactNative({
  asyncStorage: false,   // disable AsyncStorage tracking
  networking: false,      // disable network interception
  errors: false,          // disable error capture
})
```

---

## 🛡 Production Safety

Reactotron is **completely excluded from production builds**:

1. Packages are in `devDependencies` — not bundled in production
2. The `require()` in `store.ts` is inside an `if (__DEV__)` block — Metro strips it in production builds
3. `ReactotronConfig.ts` is never imported by any production code path

No manual steps needed to disable it for releases.

---

## 📚 Related Docs

- [DEBUGGING.md](./DEBUGGING.md) — General debugging tips and tools
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) — Redux store architecture
- [SETUP.md](./SETUP.md) — Project setup and environment configuration
