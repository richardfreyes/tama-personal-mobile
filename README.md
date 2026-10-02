# Aqwire Personal Dashboard (Mobile)

**Version:** 1.1.0  
**Tech Stack:** React Native (Expo), TypeScript, Redux Toolkit, React Native Paper

## Overview

Aqwire Personal is a mobile application designed for personal finance management, allowing users to manage bills, view transactions, and handle payments. It is built using the **Expo** framework for cross-platform compatibility (iOS & Android) and utilizes **Expo Router** for file-based navigation.

## Key Features

- **Secure Authentication:** Login, Signup, and Biometric support (FaceID/TouchID).
- **Dashboard:** Overview of finances.
- **Bill Management:** Add, view, search, and pay bills.
- **Auto-Debit Enrollment:** Enroll eligible merchant bills for automatic monthly payments with scheduled payment summaries and enrollment receipts.
- **Transaction History:** Detailed logs of past activities.
- **Profile Management:** Edit user details and security settings.

## Quick Start

1. **Install Dependencies:** `npm install`
2. **Setup Environment:** Configure `constants/env.ts`
3. **Start Mock Server:** `cd __mocks__/server && npm install && npm run start`
4. **Run App:** `npm run start` (then press `i` for iOS or `a` for Android)
5. **Run App Using Mock Data:** `npm run start:mock` (then press `i` for iOS or `a` for Android)
6. **Run App Using Dev Data:** `npm run start:dev` (then press `i` for iOS or `a` for Android)
7. **Run App Using Prod Data:** `npm run start:prod` (then press `i` for iOS or `a` for Android)
---

## Release Notes

### v1.1.0 — Enrollments Integration & Auto-Debit Enrollment

#### New Features

- **Enrollments Auto-Debit:** Full enrollment flow for automatic monthly payments through eligible merchants, including dynamic enrollment forms, enrollment verification through a 3DS WebView, scheduled payment summary, enrollment-specific terms and conditions, and an enrollment receipt page.
- The enrollments biller list now starts the auto-debit enrollment flow directly.

#### Improvements

- Added a cardholder name mismatch disclaimer when the card name differs from the customer name.
- Enhanced biller search and floating navigation behavior.
- Added dynamic merchant form fields based on each merchant's API configuration.
- Added email notification and support contact details on enrollment receipts.
- Added snackbar notifications for success and error feedback.
- Added a **Scheduled Payment** section on confirm payment and receipt screens for auto-debit enrollments, showing monthly payment amount, number of months, duration, total enrollment amount, and a convenience fee disclaimer note.
- Improved navigation and loading transitions.
- Improved biller lookup speed.

#### Bug Fixes

- Fixed UI flickering on the enrollments confirm payment screen when payment details briefly rendered empty before updating.
- Fixed previous transaction data briefly appearing when creating a new transaction without completing the first.
- Fixed `N/A` and empty rows showing in enrollment payment details.
- Fixed date picker past-date selection in enrollments forms.
- Fixed payment method form state not resetting between transactions.
- Fixed back button navigation in the enrollments payment flow.
- Fixed biller category API calls not loading correctly.
- Fixed enrollments merchant display issues.
- Fixed search field behavior on billers.
- Fixed the last biller list items being overlapped by navigation.
- Fixed enrollment details showing a zero amount (`0.00`).
- Fixed validation for number of months to pay.
- Fixed navigation bar overlap issues.

---

## 📚 Documentation

Detailed documentation for this project is organized in the `docs/` directory. Please refer to these guides for in-depth information:

- **[⚡️ Setup & Installation](./docs/SETUP.md)** *Environment setup, mock server instructions, and getting the app running.*

- **[🏗 Architecture](./docs/ARCHITECTURE.md)** *Project structure, Expo Router navigation flows, and authentication logic.*

- **[🧠 State Management](./docs/STATE_MANAGEMENT.md)** *Redux Toolkit configuration, RTK Query endpoints, and store setup.*

- **[🎨 Styling & UI](./docs/STYLE_GUIDE.md)** *React Native Paper theme customization, fonts, and global styling systems.*

- **[🚀 Deployment](./docs/DEPLOYMENT.md)** *Building for iOS/Android using EAS and publishing updates.*

* **[🛠️ Testing](./docs/TESTING.md)** *Guide to unit testing with Jest.*

---
