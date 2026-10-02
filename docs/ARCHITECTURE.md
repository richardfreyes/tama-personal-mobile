# Architecture Overview

This document provides a comprehensive overview of the application's architecture, including project structure, navigation flow, and authentication mechanisms.

---

## Tech Stack

- **Framework:** Expo (SDK 54) / React Native 0.81
- **Language:** TypeScript
- **Navigation:** Expo Router (File-based routing)
- **UI Component Library:** React Native Paper
- **State Management:** Redux Toolkit & RTK Query
- **Styling:** StyleSheet & Theme provider
- **Icons:** Expo Vector Icons

## 📂 Project Structure

The project follows the standard Expo Router layout: routes live in `app/`, and supporting code is grouped by type, with domain subfolders inside each group.

```text
wiremo-personal-mob/
├── app/                          # Application routes (Expo Router)
│   ├── (app)/                    # Protected routes (requires authentication)
│   │   ├── bills/                # One-time payments and auto-debit enrollments
│   │   ├── dashboard/            # Main landing page
│   │   ├── notifications/        # Notifications list & settings
│   │   ├── payment-methods/      # Payment card management
│   │   ├── settings/             # Profile & security settings
│   │   ├── transactions/         # Transaction history & detail
│   │   └── _layout.tsx           # Tab navigation layout
│   ├── (auth)/                   # Public routes (authentication flows)
│   │   ├── login/                # Login, intro & onboarding
│   │   ├── signup/               # New user registration
│   │   ├── reset-password/       # Password recovery + OTP
│   │   ├── verify/               # Account verification
│   │   └── change-email-confirm/ # Email change confirmation
│   ├── _layout.tsx               # Root layout (providers, global listeners)
│   └── index.tsx                 # Auth guard & redirect logic
├── components/                   # Reusable UI components, grouped by domain
│   └── enrollments/ one-time-payments/ common/ forms/ layout/ payments/ settings/ transactions/
├── constants/                    # App constants & environment config (env.ts, common.ts)
├── context/                      # React contexts (TabBarAnimationContext)
├── hooks/                        # Reusable React hooks
├── redux/                        # State management (Redux Toolkit + RTK Query)
│   ├── features/                 # Feature APIs & slices (login, bills, enrollments, …)
│   ├── shared/                   # Shared endpoint helpers (lookupOptions)
│   ├── apiPaths.ts               # Endpoint path constants
│   ├── appApi.ts                 # RTK Query base API (Wiremo backend)
│   └── store.ts                  # Redux store configuration
├── services/                     # Side-effectful integrations
│   ├── authStorage.ts            # Secure credential storage (biometrics)
│   └── navigation.ts             # Settings route handling
├── styles/                       # Centralized styling system
│   ├── common/                   # Design tokens: colors.ts, typography.ts, globals.ts
│   ├── components/               # Per-component StyleSheets
│   ├── app/ auth/                # Per-screen StyleSheets (mirrors app/ routes)
│   ├── theme.ts                  # React Native Paper theme (Poppins font mapping)
│   └── root.ts                   # Root screen (auth guard) styles
├── types/                        # Shared TypeScript types (common.ts, form.ts)
├── utils/                        # Pure helper functions (format.ts, validators.ts, jwt.ts, …)
├── __mocks__/
│   ├── server/                   # Local Express mock server (see its README)
│   └── svgMock.js                # Jest SVG mock
├── __tests__/                    # Jest tests (mirrors components/ and utils/)
└── docs/                         # Project documentation
```

**Conventions:**

- Pure helper functions belong in `utils/`; only side-effectful integrations (storage, navigation dispatch) belong in `services/`. React hooks belong in `hooks/`.
- New components should not use a `Component` suffix in their name (prefer `InvoiceItem.tsx` over `InvoiceItemComponent.tsx`). Existing suffixed components are renamed opportunistically.
- New component prop types are declared in (and exported from) the component file itself; `types/common.ts` holds shared domain types and re-exports already co-located prop types for backward compatibility.

---

## 🗺 Navigation Flow

The application uses **Expo Router** for file-system based routing with two main navigation groups.

### 1. Root Entry Point (`app/index.tsx`)

Acts as the **Auth Guard** for the entire application.

**Responsibilities:**

- Checks `AsyncStorage` for a valid authentication token
- Verifies token validity (expiration, format)
- Performs automatic redirects:
  - **Authenticated User** → `/(app)/dashboard`
  - **Guest User** → `/(auth)/login`

### 2. Auth Group (`app/(auth)/*`)

Handles all authentication-related screens for unauthenticated users.

**Features:**

- Stack navigation without headers or tab bars
- Screens include: `login`, `signup`, `reset-password`
- Public access (no authentication required)

### 3. App Group (`app/(app)/*`)

Contains all protected application screens accessible only to authenticated users.

**Layout Configuration (`app/(app)/_layout.tsx`):**

- Implements custom tab navigation using `FloatingNavBar` component
- Provides consistent navigation UI across all app screens

**Available Screens:**

- **`dashboard`** - Main landing page with overview widgets
- **`bills/one-time-payments`** - List, add, search, and pay saved bills
- **`bills/enrollments`** - Enrollments merchant biller search and auto-debit enrollment flow
- **`payment-methods`** - Manage payment cards and methods
- **`transactions`** - Transaction history and transaction detail screens
- **`settings`** - User profile, security settings, and preferences

### 4. Enrollments Auto-Debit Enrollment Flow (`app/(app)/bills/enrollments/*`)

The enrollments flow supports auto-debit enrollment from the merchant entry point. Merchant lists are filtered to merchants with an explicit auto-debit capability.

**Route Flow:**

1. **Merchant Search (`bills/enrollments/index.tsx`)**
   - Loads merchants from `appApi` via `merchantApi`
   - Shows only auto-debit-enabled merchants
   - Supports merchant search and category filtering through `SearchMerchants`
   - Clears stale card and transaction review state before starting a new enrollment

2. **Dynamic Merchant Form (`bills/enrollments/form.tsx`)**
   - Loads merchant projects and enrollment form config
   - Renders API-driven fields with lookup options, visibility rules, and field validation
   - Creates a merchant enrollment, then stores the resulting transaction ID and XSRF key in `enrollmentReview`

3. **Payment Method (`bills/enrollments/payment-method.tsx` and `payment-methods/form-details`)**
   - Routes enrollments payments through the shared card entry flow with `apiEnv=enrollments`
   - Keeps enrollments-specific card payloads separate from saved payment method management

4. **Confirm Payment (`bills/enrollments/confirm-payment.tsx`)**
   - Initializes the card payment method for enrollments
   - Shows payment details, payment method details, fee rows, and cardholder name mismatch disclaimers
   - Shows a **Scheduled Payment** summary for auto-debit enrollments
   - Completes enrollments through the enrollment endpoint and enrollment verification WebView

5. **Receipt (`bills/enrollments/payment-success.tsx`)**
   - Loads the enrollment receipt with access authorization
   - Shows dynamic merchant fields, fee totals, email copy messaging, support contact, and scheduled payment details for enrollments

---

## 🔐 Authentication Flow

The application implements a secure, multi-layered authentication system.

### Login Process

1. **User Submits Credentials**
   - Form validation via `utils/validators.ts`
   - API call to `loginApi` endpoint

2. **Token Management**
   - **Redux Store**: Stores token in memory for active session
   - **AsyncStorage**: Persists token across app restarts
   - **Secure Store**: Optionally stores credentials for biometric login

3. **Biometric Authentication** (Optional)
   - Email/password encrypted and stored in `Expo Secure Store`
   - Enables FaceID/TouchID login on subsequent sessions
   - Fallback to standard login if biometrics fail

### Token Persistence Strategy

```
User Login
    ↓
Token Generated
    ↓
├─→ Redux Store (Active Session)
├─→ AsyncStorage (Persistence)
└─→ Secure Store (Biometric Auth)
```

### Auto-Logout Mechanism

**Trigger Conditions:**

- `401 Unauthorized` response from API
- Token expiration detected
- Manual logout action

**Process:**

1. RTK Query middleware intercepts unauthorized responses
2. Redux state cleared (login slice reset; defined in `redux/features/login/loginApi.ts`)
3. AsyncStorage and Secure Store cleared
4. Automatic redirect to `/(auth)/login`

### Security Features

- **JWT Token Validation**: Checks token expiration before API calls
- **Automatic Token Refresh**: (If implemented) Refreshes tokens before expiration
- **Secure Storage**: Sensitive data encrypted using Expo Secure Store
- **Biometric Protection**: Optional biometric authentication layer

---

## 🔄 State Management

The application uses **Redux Toolkit** with **RTK Query** for efficient state management.

### Redux Architecture

**Store Configuration:**

- Centralized in `redux/store.ts`
- Combines feature slices and API reducers
- Includes middleware for API caching and invalidation

**Feature Slices:**

- **login** (in `redux/features/login/loginApi.ts`): Authentication state, user data, session management
- **`csrfSlice`**: CSRF token state
- **`modalSlice`**: Global modal system
- **`snackbarSlice`**: Global toast notification system
- **`reviewSlice`** (in `redux/features/enrollments/review/`): Enrollments payment review state

**RTK Query API:**

- **`appApi.ts`**: Base API for the Wiremo backend (auth header, 401 handling, and merchant endpoint auth helpers)
- Feature endpoints are injected via `injectEndpoints` from `redux/features/*` (note: the side-effect imports in `redux/store.ts` are what register them)
- Automatic caching and invalidation, built-in loading and error states

---

## 🎨 Styling System

Centralized styling approach for consistent UI/UX.

**Theme Configuration (`styles/theme.ts`):**

- React Native Paper theme (`customTheme`) mapping Poppins font weights to Paper variants

**Design Tokens (`styles/common/`):**

- `colors.ts` — color palette
- `typography.ts` — font sizes
- `globals.ts` — shared `globalStyle` objects reused across screens

**Per-component and per-screen styles:**

- `styles/components/*` holds one StyleSheet file per component
- `styles/app/*` and `styles/auth/*` mirror the route tree for screen-specific styles

---

## 🛠 Development Workflow

1. **Local Development**: Use mock server for API simulation
2. **State Management**: Redux DevTools for debugging
3. **Navigation Testing**: Test routes using Expo Router dev tools
4. **Authentication Testing**: Use test credentials from mock server

---

## 📊 Data Flow Diagram

```
User Action
    ↓
Component Event Handler
    ↓
Redux Action Dispatch
    ↓
RTK Query API Call
    ↓
Mock Server / Real API
    ↓
Response Handling
    ↓
Redux State Update
    ↓
Component Re-render
```

---

## 🔍 Key Architectural Decisions

1. **Expo Router over React Navigation**: File-system routing for better code organization
2. **Redux Toolkit**: Simplified Redux with less boilerplate
3. **RTK Query**: Built-in caching reduces API calls and improves performance
4. **Custom Tab Navigation**: `FloatingNavBar` provides unique UX
5. **Mock Server**: Enables offline development and testing
6. **Secure Storage**: Multi-layer approach balances security and UX

---

## 🚀 Future Enhancements

- [ ] Implement token refresh mechanism
- [ ] Add offline support with data persistence
- [ ] Implement push notifications
- [ ] Add analytics and crash reporting
- [ ] Enhance error boundary handling
- [ ] Add unit and integration tests
