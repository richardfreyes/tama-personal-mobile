# Installation Guide

Quick setup guide for getting the project running on your local machine.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Required For | Installation |
|------|---------|--------------|--------------|
| **Node.js** | v18+ LTS | Running the app | [nodejs.org](https://nodejs.org) |
| **Git** | Latest | Cloning repository | [git-scm.com](https://git-scm.com) |
| **Xcode** | Latest | iOS development | App Store (Mac only) |
| **Android Studio** | Latest | Android development | [developer.android.com](https://developer.android.com/studio) |
| **Watchman** | Latest | File watching (Mac) | `brew install watchman` |

---

## 🎯 One-Line Setup

```bash
cd tama-personal-mobile && npm install && cd __mocks__/server && npm install && cd ../.. && npm start
```

Then start the mock server in a separate terminal:

```bash
cd __mocks__/server && npm start
```

---

### Platform-Specific Setup

<details>
<summary><strong>iOS Setup (Mac only)</strong></summary>

1. Install Xcode from the App Store
2. Open Xcode and accept the license agreement
3. Install Xcode Command Line Tools:

   ```bash
   xcode-select --install
   ```

4. Install iOS Simulator components (automatic on first launch)

</details>

<details>
<summary><strong>Android Setup</strong></summary>

1. Install Android Studio
2. Open Android Studio → Settings → Languages & Frameworks → Android SDK
3. Install the following:
   - Android SDK Platform (API 34 or latest)
   - Android SDK Build-Tools
   - Android Emulator
4. Create a virtual device:
   - More Actions → Device Manager → Create Device
   - Select a device (e.g., Pixel 5)
   - Select a system image (e.g., API 34)
5. Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

  ```bash
  nano ~/.zshrc
  ```

   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

</details>

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd tama-personal-mobile
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

The app uses `EXPO_PUBLIC_APP_ENV` to select the active environment. Configuration lives in `constants/env.ts`.

On startup, the console logs which environment is active and its URLs:

```
[ENV] Running in "local" environment
  API:     http://localhost:8800
  Enrollments: http://localhost:8040
  Mock:    false  |  Logging: true
```

**Important:** For Android Emulator, use `http://10.0.2.2` instead of `localhost`.

### 4. Start Mock Server

```bash
cd __mocks__/server
npm install
npm start
```

Keep this terminal window open. The server runs on `http://0.0.0.0:4000`

### 5. Start the App

Open a new terminal window and run a start script for the desired environment:

```bash
npm start              # Local (default)
npm run start:local    # Local (explicit)
npm run start:device   # Physical device (uses device IP)
npm run start:custom   # Custom server URLs
npm run start:mock     # Mock mode enabled
npm run start:sandbox  # Sandbox servers
npm run start:dev      # Dev servers
npm run start:uat      # UAT servers
npm run start:prod     # Production servers
```

Then choose your platform:

- **iOS:** Press `i`
- **Android:** Press `a`

### Platform-Specific Scripts

Run directly on an **emulator/simulator**:

```bash
npm run android            # Android emulator (local)
npm run android:dev        # Android emulator (dev)
npm run ios                # iOS simulator (local)
npm run ios:dev            # iOS simulator (dev)
```

Run on a **physical device**:

```bash
npm run device-android     # Android device (device env)
npm run device-android:dev # Android device (dev)
npm run device-ios         # iOS device (device env)
npm run device-ios:dev     # iOS device (dev)
```

All environment suffixes (`:local`, `:device`, `:custom`, `:mock`, `:sandbox`, `:dev`, `:uat`, `:prod`) work with `android`, `ios`, `device-android`, and `device-ios`.

### Prebuild Scripts

Generate native projects before building:

```bash
npm run prebuild:dev                # Both platforms (dev)
npm run prebuild:prod               # Both platforms (prod)
npm run prebuild:android:dev        # Android only (dev)
npm run prebuild:ios:prod           # iOS only (prod)
```

Available for `:dev`, `:uat`, `:prod`, and `:mock`.

## ⚙️ Configuration Reference

### Environments

| Environment | API URL | Enrollments URL | Use Case |
|---|---|---|---|
| `local` | `http://localhost:8800` | `http://localhost:8040` | Local dev with local servers |
| `device` | `http://192.168.68.83:8800` | `http://localhost:8040/v1` | Physical device on LAN |
| `custom` | Configurable | Configurable | Custom/testing targets |
| `mock` | `http://localhost:8800` | `http://localhost:8040/v1` | Mock mode enabled |
| `sandbox` | `https://uat-app.aqwire.io/v1` | `https://portals-sandbox.aqwire.io/v1` | Sandbox testing |
| `dev` | `https://app.aqwire.dev/v1` | `https://portals.aqwire.dev/v1` | Dev servers |
| `uat` | `https://uat-app.aqwire.io/v1` | `https://portals-sandbox.aqwire.io/v1` | UAT testing |
| `prod` | `https://app.aqwire.io/v1` | `https://pay.aqwire.io/v1` | Production |

### Environment Fallback

The environment is resolved with this priority:

1. **Valid `EXPO_PUBLIC_APP_ENV`** — uses that environment directly
2. **Invalid `EXPO_PUBLIC_APP_ENV`** — falls back to `custom` (with a console warning)
3. **Unset** — falls back to `local`

### Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `EXPO_PUBLIC_APP_ENV` | Selects the active environment | `local`, `dev`, `prod` |
| `EXPO_PUBLIC_CUSTOM_API_URL` | Override API URL for `custom` env | `http://192.168.1.50:8800` |

You can set these inline, in a `.env` file (loaded automatically by Expo), or via `cross-env` in a custom script.

### Helper Functions

Available from `constants/env.ts`:

```ts
import { getEnv, getEnvConfig, isLocal, isProduction, isMock, isDevice } from '@/constants';

getEnv()          // 'local' | 'dev' | 'prod' | ...
getEnvConfig()    // { base, enrollments, enableLogging, enableMockMode, ... }
getEnvConfig('dev') // Get config for a specific environment
isLocal()         // true if running in 'local'
isDevice()        // true if running in 'device'
isMock()          // true if running in 'mock'
isProduction()    // true if running in 'prod'
```

---

## 🔧 Platform-Specific Configuration

### iOS Simulator

**Enable FaceID:**

1. Run the app in simulator
2. Simulator menu → Features → Face ID → Enrolled
3. Simulate successful authentication: Features → Face ID → Matching Face

### Android Emulator

**Enable Fingerprint:**

1. Settings → Security → Fingerprint
2. Add a fingerprint (use mouse to simulate touch)

**Network Configuration:**

- `localhost` in Android Emulator refers to the emulator itself
- Use `10.0.2.2` to access your host machine's `localhost`
- Update `EXPO_PUBLIC_API_URL` to `http://10.0.2.2:4000/v1`

---

## <a name="common-issues"></a> 🐛 Common Issues

<details>
<summary><strong>Metro bundler fails to start</strong></summary>

```bash
# Clear cache and restart
npm start -- --reset-cache
```

</details>

<details>
<summary><strong>Mock server connection refused</strong></summary>

**Symptoms:** API calls fail with network errors

**Solutions:**

1. Verify mock server is running: `curl http://localhost:4000/health`
2. Check `EXPO_PUBLIC_API_URL` matches the server port
3. For Android: Use `10.0.2.2` instead of `localhost`
4. For physical device: Use your machine's IP address (e.g., `http://192.168.1.5:4000/v1`)

</details>

<details>
<summary><strong>iOS build fails</strong></summary>

```bash
# Clean build folder and rebuild
cd ios
pod install
cd ..
npm run ios
```

</details>

<details>
<summary><strong>Android build fails</strong></summary>

```bash
# Clean Gradle cache
cd android
./gradlew clean
cd ..
npm run android
```

</details>

<details>
<summary><strong>Port already in use</strong></summary>

```bash
# Kill process using port 4000
lsof -ti:4000 | xargs kill -9
```

</details>

---

## 📱 Running on Physical Devices

### iOS Device

1. Connect iPhone via USB
2. Open Xcode → Window → Devices and Simulators
3. Trust the device on both Mac and iPhone
4. Run:

   ```bash
   npm run device-ios          # Uses device env (LAN IP)
   npm run device-ios:dev      # Uses dev servers
   npm run device-ios:prod     # Uses production servers
   ```

### Android Device

1. Enable Developer Options on your Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging in Developer Options
3. Connect device via USB
4. Accept USB debugging prompt on device
5. Verify connection: `adb devices`
6. Run:

   ```bash
   npm run device-android      # Uses device env (LAN IP)
   npm run device-android:dev  # Uses dev servers
   npm run device-android:prod # Uses production servers
   ```

**Network Configuration for Physical Devices:**

- The `device` environment is pre-configured with the LAN IP (`192.168.68.83`)
- To use a different IP, update `BASE.DEVICE.IP` in `constants/env.ts`
- Find your IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)

---

## 🎨 Development Tools

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **ESLint**
- **React Native Tools**
- **GitLens**

### Browser DevTools

Access React DevTools:

```bash
# After starting the app
press j
```

### Redux DevTools

The app includes Redux DevTools integration. Use the Redux DevTools browser extension to inspect state.

---

## 📚 Next Steps

Once installed, check out these guides:

- **[Architecture Overview](./ARCHITECTURE.md)** - Understand the project structure
- **[Setup Guide](./SETUP.md)** - Configure mock server and biometrics
- **[State Management](./STATE_MANAGEMENT.md)** - Learn about Redux and RTK Query
- **[Styling Guide](./STYLE_GUIDE.md)** - UI system and theming
- **[Deployment](./DEPLOYMENT.md)** - Building and publishing the app

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. Check the [troubleshooting section](#-common-issues) above
2. Search [Expo Documentation](https://docs.expo.dev)
3. Ask in project Slack channel
4. Review [React Native troubleshooting](https://reactnative.dev/docs/troubleshooting)

---

## 📝 Verification Checklist

Before reporting issues, verify:

- [ ] Node.js version is 18+ (`node --version`)
- [ ] All dependencies installed (`npm install` completed successfully)
- [ ] Mock server is running on port 4000
- [ ] Environment variables are configured correctly
- [ ] Simulator/Emulator is running
- [ ] Metro bundler is active
- [ ] No firewall blocking ports 4000, 8081, or 19000

---

## ⚡ Quick Reference

```bash
# Install and start
npm install                    # Install app dependencies
cd __mocks__/server && npm install  # Install server dependencies
npm start                      # Start Metro bundler (local)
cd __mocks__/server && npm start    # Start mock server

# Start by environment
npm run start:local            # Local servers
npm run start:device           # Physical device (LAN IP)
npm run start:mock             # Mock mode
npm run start:dev              # Dev servers
npm run start:uat              # UAT servers
npm run start:prod             # Production servers

# Emulator / Simulator
npm run android                # Android emulator (local)
npm run android:dev            # Android emulator (dev)
npm run ios                    # iOS simulator (local)
npm run ios:dev                # iOS simulator (dev)

# Physical devices
npm run device-android         # Android device
npm run device-android:dev     # Android device (dev)
npm run device-ios             # iOS device
npm run device-ios:dev         # iOS device (dev)

# Prebuild
npm run prebuild:dev           # Both platforms (dev)
npm run prebuild:prod          # Both platforms (prod)

# Utilities
npm start -- --reset-cache     # Clear Metro cache
npm run lint                   # Check code style
npm test                       # Run tests
npm run test:coverage          # Run tests with coverage
```
