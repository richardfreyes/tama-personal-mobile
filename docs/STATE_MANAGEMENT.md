# State Management

This document provides a comprehensive guide to the application's state management architecture using **Redux Toolkit (RTK)** and **RTK Query** for efficient data fetching and caching.

---

## 🏪 Redux Store

The Redux store is configured in `redux/store.ts` and serves as the single source of truth for application state.

### Store Configuration

```typescript
// redux/store.ts (abbreviated)
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { appApi } from './appApi';
import csrfReducer from './features/csrf/csrfSlice';
import loginReducer from './features/login/loginApi';
import modalReducer from './features/modal/modalSlice';
import snackbarReducer from './features/snackbar/snackbarSlice';
import enrollmentReviewReducer from './features/enrollments/review/reviewSlice';

const appReducer = combineReducers({
  login: loginReducer,
  csrf: csrfReducer,
  [appApi.reducerPath]: appApi.reducer,
  snackbar: snackbarReducer,
  modal: modalReducer,
  enrollmentReview: enrollmentReviewReducer,
});

export const store = configureStore({
  reducer: rootReducer, // wraps appReducer to support RESET_APP_STATE
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(appApi.middleware),
});
```

> **Note:** `store.ts` also contains side-effect imports of each feature API file (e.g. `import './features/bills/billsApi'`). These are what register the injected endpoints — removing one silently drops its endpoints.

### Store Architecture

The store combines reducers from multiple domains:

| Domain | Reducer | Purpose |
|--------|---------|---------|
| **Authentication** | `login` (in `features/login/loginApi.ts`) | User authentication state, tokens, user info |
| **Security** | `csrfSlice` | CSRF token state |
| **UI State** | `snackbarSlice` | Global toast notifications |
| **UI State** | `modalSlice` | Global modal dialogs |
| **Enrollments** | `reviewSlice` (in `features/enrollments/review/`) | Enrollments card payload, transaction/enrollment response, and form reset state |
| **API Layer** | `appApi` | RTK Query endpoints for the Wiremo backend, including merchant-powered payment and enrollment endpoints |

### TypeScript Support

```typescript
// redux/store.ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// redux/hooks.ts — typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 📡 RTK Query API Layer

RTK Query provides powerful data fetching and caching capabilities built on top of Redux Toolkit.

### Base API Configuration (`redux/appApi.ts`)

The `appApi` serves as the foundation for all API endpoints in the application.

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Bills', 'PaymentMethods', 'User', 'Transactions'],
  endpoints: (builder) => ({}), // Injected from feature files
});
```

### Base Query with Authentication

Custom base query that handles authentication and error responses automatically.

```typescript
const baseQuery = fetchBaseQuery({
  baseUrl: ENV_CONFIG.API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).login.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized - Auto logout
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
    // Redirect to login handled by auth guard
  }
  
  return result;
};
```

**Features:**
- **Automatic Token Injection**: Adds `Bearer` token to all requests
- **401 Error Handling**: Automatically logs out user on unauthorized responses
- **Centralized Configuration**: Single point for API base URL and headers
- **Error Normalization**: Consistent error format across all endpoints

### Endpoint Injection Pattern

Features inject their endpoints into the base API for better code organization.

```typescript
// Example: redux/features/bills/billsApi.ts
import { appApi } from '../../appApi';

export const billsApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query({
      query: () => '/bills',
      providesTags: ['Bills'],
    }),
    addBill: builder.mutation({
      query: (bill) => ({
        url: '/bills',
        method: 'POST',
        body: bill,
      }),
      invalidatesTags: ['Bills'],
    }),
  }),
});

export const { useGetBillsQuery, useAddBillMutation } = billsApi;
```

### Merchant API and Review State

The v1.1.0 enrollments flow uses merchant endpoints injected into `appApi` from `redux/shared/merchants/merchantApi.ts` for merchant-powered auto-debit enrollments.

| Area | Endpoints / State | Purpose |
|------|-------------------|---------|
| Merchant discovery | `getMerchants`, `getMerchantById`, `getMerchantProjects` | Loads auto-debit-enabled billers and lookup data |
| Dynamic forms | `getMerchantEnrollmentFormConfig` | Drives merchant-specific enrollment fields |
| Enrollment creation | `createMerchantEnrollment` | Creates auto-debit enrollment records |
| Payment setup | `getMerchantEnrollmentPaymentBin`, `createMerchantEnrollmentPaymentVault` | Looks up card BIN details and vaults card data for the current enrollment |
| Completion | `createMerchantEnrollmentEnroll` | Completes enrollment verification |
| Receipts | `getMerchantEnrollmentReceipt` | Loads enrollment receipts with access authorization |
| Review slice | `cardPayload`, `transactionResponse`, `formResetKey` | Carries card and transaction context between enrollments screens and prevents stale form/review data |

Enrollment form submissions now set `transactionResponse.isEnrollment` to `true`; confirm payment uses the enrollment detail, vault, verification, terms, and receipt APIs.

### Tag-Based Cache Invalidation

RTK Query uses tags to manage cache invalidation automatically.

#### How It Works

```
1. Query provides tags     →  ['Bills']
2. Mutation invalidates    →  ['Bills']
3. Related queries refetch →  Automatically
```

#### Tag Configuration

| Tag | Purpose | Provided By | Invalidated By |
|-----|---------|-------------|----------------|
| `Bills` | Bill list data | `getBills` | `addBill`, `updateBill`, `deleteBill` |
| `PaymentMethods` | Payment card list | `getPaymentMethods` | `addCard`, `deleteCard` |
| `User` | User profile data | `getProfile` | `updateProfile` |
| `Transactions` | Transaction history | `getTransactions` | `payBill` |

#### Example: Automatic Refetch Flow

```typescript
// 1. Component fetches bills
const { data: bills } = useGetBillsQuery();

// 2. User adds a new bill
const [addBill] = useAddBillMutation();
await addBill(newBillData);

// 3. Bills query automatically refetches
// No manual refetch needed!
```

### Advanced Cache Control

```typescript
// Optimistic Updates
addBill: builder.mutation({
  query: (bill) => ({ url: '/bills', method: 'POST', body: bill }),
  async onQueryStarted(bill, { dispatch, queryFulfilled }) {
    // Optimistically update cache
    const patchResult = dispatch(
      billsApi.util.updateQueryData('getBills', undefined, (draft) => {
        draft.push({ ...bill, id: 'temp-id' });
      })
    );
    
    try {
      await queryFulfilled;
    } catch {
      patchResult.undo(); // Rollback on error
    }
  },
  invalidatesTags: ['Bills'],
}),

// Conditional Fetching
const { data } = useGetBillsQuery(undefined, {
  skip: !isAuthenticated, // Don't fetch if not authenticated
  pollingInterval: 60000,  // Refetch every 60 seconds
  refetchOnMountOrArgChange: true,
});
```

---

## 🧩 Feature Slices

Feature slices manage domain-specific state using Redux Toolkit's `createSlice`.

### Login Slice (`redux/features/login/loginApi.ts`)

Manages authentication state and user information. Note that the slice currently lives in the same file as the login feature's API logic; the state shape is defined in `loginTypes.ts`.

#### State Structure

```typescript
// redux/features/login/loginTypes.ts
interface LoginState {
  token: string | null;
  user: JwtPayload | null; // decoded from the JWT
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}
```

#### Actions

```typescript
// Synchronous actions
setToken(token) // Set token, decode user from JWT, persist to AsyncStorage
logout()        // Clear auth state and remove token from AsyncStorage

// Async thunks
retrieveToken() // Load token from AsyncStorage on app launch
```

Biometric credentials are handled separately by `services/authStorage.ts` (Expo Secure Store), not by this slice.

#### Usage Example

```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setToken, logout } from '@/redux/features/login/loginApi';

function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.login);

  const handleLogin = async (credentials) => {
    const response = await loginApi(credentials);
    dispatch(setToken(response.token));
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.name}!</Text>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </View>
  );
}
```

### Snackbar Slice (`redux/features/snackbarSlice.ts`)

Controls global toast notifications for user feedback.

#### State Structure

```typescript
// redux/features/snackbar/snackbarTypes.ts
interface SnackbarState {
  visible: boolean;
  message: string;
  variant: 'success' | 'error';
}
```

#### Actions & Usage

```typescript
// Show notification
dispatch(showSnackbar({ 
  message: 'Bill added successfully!', 
  variant: 'success' 
}));

// Hide notification
dispatch(hideSnackbar());

// Auto-hide is handled by the SnackBar component
```

#### Implementation Pattern

```typescript
// In a component or API endpoint
try {
  await addBillMutation(billData);
  dispatch(showSnackbar({ 
    message: 'Bill added successfully!', 
    variant: 'success' 
  }));
} catch (error) {
  dispatch(showSnackbar({ 
    message: 'Failed to add bill', 
    variant: 'error' 
  }));
}
```

### Modal Slice (`redux/features/modalSlice.ts`)

Manages global modal dialogs for confirmations and alerts.

#### State Structure

```typescript
// redux/features/modal/modalTypes.ts
interface ModalState {
  isVisible: boolean;
  iconType?: 'success' | 'warning' | 'info' | 'error' | 'logout' | null;
  headerMessage?: string;
  bodyMessage?: string;
  bodyType?: 'accountDeletion' | 'default';
  buttonConfig?: ModalButtonConfig; // labels/styles for primary & secondary buttons
  id?: string;
}
```

#### Usage Example

```typescript
// Show confirmation modal
dispatch(showModal({
  iconType: 'warning',
  headerMessage: 'Delete Bill',
  bodyMessage: 'Are you sure you want to delete this bill?',
  buttonConfig: {
    primaryLabel: 'Delete',
    secondaryLabel: 'Cancel',
    direction: 'row',
  },
}));

// Hide modal
dispatch(hideModal());
```

---

## 🔄 Data Flow Patterns

### Standard Query Pattern

```
Component Mount
    ↓
useGetBillsQuery() executes
    ↓
Check Redux cache
    ↓
Cache hit? → Return cached data
Cache miss? → Fetch from API
    ↓
Store in cache with tags
    ↓
Component receives data
```

### Mutation Pattern with Invalidation

```
User Action (Add Bill)
    ↓
useAddBillMutation() executes
    ↓
Send POST request
    ↓
Mutation successful
    ↓
Invalidate 'Bills' tag
    ↓
All queries with 'Bills' tag refetch
    ↓
UI updates automatically
```

### Optimistic Update Pattern

```
User Action
    ↓
Update cache immediately (optimistic)
    ↓
UI updates instantly
    ↓
Send API request
    ↓
Success? → Keep changes
Failure? → Rollback changes
```

---

## 🎯 Best Practices

### 1. Use Typed Hooks

```typescript
// ✅ Good
const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.login.user);

// ❌ Avoid
const dispatch = useDispatch(); // No type safety
```

### 2. Co-locate Endpoint Definitions

```typescript
// Keep API endpoints in feature folders
redux/
  features/
    bills/
      billsApi.ts     // ← API endpoints here
      billsTypes.ts   // ← request/response types here
```

### 3. Leverage Automatic Refetching

```typescript
// Let RTK Query handle refetching
const { data, isLoading, error } = useGetBillsQuery();

// Don't manually refetch unless necessary
// Tags handle it automatically!
```

### 4. Handle Loading and Error States

```typescript
const { data, isLoading, error } = useGetBillsQuery();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <BillsList bills={data} />;
```

### 5. Use Selectors for Derived State

```typescript
// Create memoized selectors
const selectUnpaidBills = createSelector(
  [(state) => state.bills.items],
  (bills) => bills.filter(bill => !bill.paid)
);

// Use in components
const unpaidBills = useAppSelector(selectUnpaidBills);
```

---

## 🔍 Debugging

### Redux DevTools

The store is configured to work with Redux DevTools for debugging:

- **Time Travel**: Navigate through state changes
- **Action Inspection**: See dispatched actions and payloads
- **State Diff**: Compare state before/after actions
- **Query Tracking**: Monitor RTK Query cache and requests

### RTK Query DevTools

Enable query logging:

```typescript
export const appApi = createApi({
  // ... config
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 60, // seconds
});
```

---

## 📊 Performance Optimization

### Cache Configuration

```typescript
// Global cache settings
export const appApi = createApi({
  keepUnusedDataFor: 60,        // Cache unused data for 60 seconds
  refetchOnFocus: true,          // Refetch when window regains focus
  refetchOnReconnect: true,      // Refetch when network reconnects
});
```

### Selective Subscriptions

```typescript
// Only subscribe to needed fields
const { currentData } = useGetBillsQuery(undefined, {
  selectFromResult: ({ data }) => ({
    currentData: data?.filter(bill => bill.status === 'active'),
  }),
});
```

---

## 🚀 Migration Guide

### From React Query to RTK Query

| React Query | RTK Query Equivalent |
|-------------|---------------------|
| `useQuery()` | `useGetXQuery()` |
| `useMutation()` | `useAddXMutation()` |
| `queryClient.invalidateQueries()` | `invalidatesTags` |
| `queryClient.setQueryData()` | `updateQueryData()` |

### From Redux Thunks to RTK Query

Replace manual thunks with RTK Query mutations for data fetching logic.

---

## 🔐 Security Considerations

- **Token Storage**: Never store sensitive tokens in Redux state permanently
- **Automatic Cleanup**: `logout` action clears all sensitive state
- **Secure Headers**: Tokens only sent over HTTPS in production
- **401 Handling**: Automatic logout prevents unauthorized access

---

## 📚 Additional Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
