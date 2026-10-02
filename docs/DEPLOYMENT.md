# Tama Personal — Deployment Guide

This document outlines the step-by-step process for deploying the **Tama Personal** mobile application. As this project utilizes a **Manual Native Workflow**, these steps ensure that signing certificates, native modules and environment configurations are correctly applied.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | v20+ |
| CocoaPods | v1.15+ |
| Java Development Kit (JDK) | v17+ |
| Xcode | v16+ |
| Android Studio | Narwhal 3 or later |

---

## iOS Deployment (App Store Connect)

### 1. Pre-Deployment Sync

Before building, ensure your versioning is updated in `app.json` and native dependencies are synced.

```bash
# 1. Update 'version' and 'ios.buildNumber' in app.json
# 2. Sync native directories
npm run prebuild:ios:prod
```

### 2. Xcode Archiving & Upload

1. Open `ios/TamaPersonal.xcworkspace` in Xcode.
2. Click **Tama Personal** in the sidebar, select the **Signing & Capabilities** tab, and choose **Omnisent Corp** as the Team.
3. Set the build target to **Any iOS Device (arm64)**.
4. Select **Product > Archive** from the top menu.
5. In the **Organizer** window, click **Distribute App**.
6. Choose **App Store Connect** → **Upload**.

> **Note:** If the team is not yet available in Xcode, you need to join the Apple Developer account first.
> If you encounter a "PLA Update" error, the Account Holder must accept the latest agreement at [developer.apple.com](https://developer.apple.com).

### 3. Submission for Review

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/).
2. Create a **New Version** matching your `app.json` (e.g., `1.0.2`).
3. Scroll to the **Build** section, click **(+)**, and select your uploaded build.
4. Click **Add for Review**.

---

## Android Deployment (Google Play Console)

### 1. Pre-Deployment

Before building, ensure your versioning is updated in `app.json` and native dependencies are synced.

```bash
# 1. Update 'version' and 'ios.buildNumber' in app.json
# 2. Sync native directories
npm run prebuild:android:prod
```

### 2. Keystore Configuration

Ensure your production keystore is located at `android/app/my-release-key.keystore`. Your `android/gradle.properties` must be configured as follows:

```properties
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=********
MYAPP_UPLOAD_KEY_PASSWORD=********
```

In `android/app/build.gradle`, replace the `signingConfigs` and `buildTypes` blocks with the following:

```groovy
signingConfigs {
  debug {
    storeFile file('debug.keystore')
    storePassword 'android'
    keyAlias 'androiddebugkey'
    keyPassword 'android'
  }
  release {
    storeFile file("my-release-key.keystore")
    storePassword MYAPP_UPLOAD_STORE_PASSWORD
    keyAlias MYAPP_UPLOAD_KEY_ALIAS
    keyPassword MYAPP_UPLOAD_KEY_PASSWORD
  }
}

buildTypes {
  release {
    // Caution! In production, you need to generate your own keystore file.
    // See https://reactnative.dev/docs/signed-apk-android
    signingConfig signingConfigs.release
    def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'
    shrinkResources enableShrinkResources.toBoolean()
    minifyEnabled enableMinifyInReleaseBuilds
    proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    def enablePngCrunchInRelease = findProperty('android.enablePngCrunchInReleaseBuilds') ?: 'true'
    crunchPngs enablePngCrunchInRelease.toBoolean()
  }
}
```

### 3. Generate the App Bundle (.aab)

Run the production build command from the `android` folder:

```bash
cd android
./gradlew bundleRelease
```

Output file location:

```
android/app/build/outputs/bundle/release/app-release.aab
```

### 4. Google Play Console Upload

1. Log in to [Google Play Console](https://play.google.com/console/).
2. Navigate to **Production** → **Create new release**.
3. Upload the `.aab` file generated in Step 2.
4. Review and **Start Rollout to Production**.

---

## Troubleshooting

### Native Module Missing (e.g., ExpoClipboard)

**Symptom:** `Cannot find native module 'ExpoClipboard'`

**Cause:** Native code was not linked.

**Fix:** Run `npm run prebuild:android:prod`, then perform `bundleRelease`.

---

### API Errors in Production (Status 405)

**Symptom:** `404 Not Found` in production.

**Cause:** Wrong Environment build

**Fix:**

- Ensure you build the production API Environment.

---

### App Crashing on Launch (ProGuard)

**Symptom:** App works in the simulator but crashes in the release build.

**Fix:** Check `android/app/proguard-rules.pro` to ensure your Redux models and API request bodies are not being obfuscated or stripped.

---

### Gradle Memory Issues

**Symptom:** Build fails with `JVM Metaspace` errors.

**Fix:** Increase memory in `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```
