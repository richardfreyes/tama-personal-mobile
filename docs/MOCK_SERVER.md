# Mock Server & API Fixtures

Local Express mock server and JSON fixtures for developing and testing the Tama Personal app without a live backend.

---

## Quick Start

```bash
cd __mocks__/server
npm install
npm start
```

The server starts at **http://localhost:4000**. Point the app at it by setting the environment to `local` (see `constants/env.ts`), which uses `http://localhost:8800` by default — update the port or use the `PORT` env variable:

```bash
PORT=8800 npm start
```

For auto-reload during development:

```bash
npm run dev
```

### Test User

| Field    | Value              |
|----------|--------------------|
| Email    | testuser@user.com  |
| Password | qweQWE123!@#       |

---

## Fixture Directory Structure

All API fixtures live in `__mocks__/server/fixtures/`, organized by resource and operation. Each endpoint directory follows a consistent naming convention:

| File                    | Purpose                                        |
|-------------------------|-------------------------------------------------|
| `request.json`          | Sample request body (mutations only)            |
| `success-response.json` | Successful API response                         |
| `error-response.json`   | Error response (where applicable)               |
| `empty-response.json`   | Empty-list variant (list endpoints)             |

```
__mocks__/server/fixtures/
├── auth/
│   ├── login/                  POST /v1/auth/
│   ├── signup/                 POST /v1/person/
│   ├── reset-password/         POST /v1/auth/reset-password
│   ├── reset-password-confirm/ POST /v1/auth/reset-password-confirm
│   ├── verify-otp/             POST /v1/person/verify/email-verification
│   └── resend-otp/             POST /v1/person/resend-code/email-verification
├── profile/
│   ├── get/                    GET   /v1/customer/individual
│   ├── update/                 PATCH /v1/person/profile
│   └── update-address/         PATCH /v1/customer/add-address/individual
├── account-security/
│   ├── update-email/           POST  /v1/person/email
│   ├── change-email-confirm/   PATCH /v1/person/change-email
│   └── update-password/        PUT   /v1/auth/
├── billers/
│   ├── list/                   GET /v1/biller
│   ├── detail/{id}.json        GET /v1/biller/:id         (92 per-biller files)
│   ├── search/                 GET /v1/biller?search=...
│   ├── categories/             GET /v1/biller?category=...
│   └── config/                 GET /v1/biller/:id/config/{type}
│       ├── projects/
│       ├── payment-types/
│       ├── property-types/
│       ├── sales-channels/
│       ├── payment-modes/
│       ├── payment-options/
│       ├── months/
│       ├── payment-years/
│       └── charge-types/
├── bills/
│   ├── list/                   GET    /v1/bills
│   ├── detail/                 GET    /v1/bills/:id
│   ├── create/                 POST   /v1/bills/
│   └── delete/                 DELETE /v1/bills/:id
├── transactions/
│   ├── list/                   GET  /v1/transactions/
│   ├── detail/                 GET  /v1/transactions/:id
│   ├── create/                 POST /v1/transactions/
│   ├── pay/                    POST /v1/transactions/:id/pay
│   └── last/                   GET  /v1/transactions/last/:id
├── payment-methods/
│   ├── list/                   GET   /v1/payment-methods/get-payment-methods
│   ├── add/                    POST  /v1/payment-methods/add-card-payment
│   └── update/                 PATCH /v1/payment-methods/:id
├── enrollments/
│   └── list/                   GET /v1/enrollments
└── merchants/                  (Enrollment API)
    ├── list/                   GET  /v1/merchants
    ├── detail/                 GET  /v1/merchants/:id
    ├── landing-config/         GET  /v1/merchants/:id/config/landing
    ├── payment/                GET  /v1/merchants/:id/payment
    ├── payment-types/          GET  /v1/merchants/:id/payment-types
    ├── payment-form-config/    GET  /v1/merchants/:id/config/forms/payment
    ├── enrollment-form-config/ GET  /v1/merchants/:id/config/forms/enrollment
    ├── projects/               GET  /v1/merchants/:id/projects
    ├── transactions/
    │   ├── create/             POST /v1/merchants/:id/transactions
    │   ├── detail/             GET  /v1/merchants/:id/transactions/:txnId
    │   ├── payment-bin/        GET  /v1/merchants/:id/transactions/:txnId/payment/bin/:bin
    │   ├── payment-cko/        POST /v1/merchants/:id/transactions/:txnId/payment/cko
    │   └── payment-vault/      POST /v1/merchants/:id/transactions/:txnId/payment/vault
    ├── enrollments/
    │   ├── create/             POST /v1/merchants/:id/enrollments
    │   ├── detail/             GET  /v1/merchants/:id/enrollments/:enrId
    │   ├── payment-bin/        GET  /v1/merchants/:id/enrollments/:enrId/payment/bin/:bin
    │   ├── payment-vault/      POST /v1/merchants/:id/enrollments/:enrId/payment/vault
    │   └── enroll/             POST /v1/merchants/:id/enrollments/:enrId/enroll
    └── receipts/
        ├── transaction/        GET  /v1/merchants/:id/receipts/:refId
        ├── enrollment/         GET  /v1/merchants/:id/enrollments/receipts/:refId
        └── keys/               GET  /v1/merchants/:id/receipts/:txnId/keys
```

---

## Using Fixtures in Tests

The fixtures barrel export at `__mocks__/server/fixtures/index.ts` provides typed accessors for every fixture. Each accessor is a function that returns a fresh copy of the JSON data, so mutations in one test cannot leak into another.

### Import

```ts
import { auth, merchants, transactions } from '@/../__mocks__/server/fixtures';
```

Or use the generic `loadFixture` for ad-hoc paths:

```ts
import { loadFixture } from '@/../__mocks__/server/fixtures';

const biller = loadFixture('billers', 'detail', '48.json');
```

### Usage Examples

**Mock a successful login response:**

```ts
import { auth } from '@/../__mocks__/server/fixtures';

const loginBody = auth.login.request();
// { username: 'testuser@user.com', password: 'qweQWE123!@#', rememberMe: false }

const loginResponse = auth.login.success();
// { importedTransactions: 0, token: 'eyJ...' }

const loginError = auth.login.error();
// { error: 'Invalid credentials' }
```

**Mock merchant enrollment flow:**

```ts
import { merchants } from '@/../__mocks__/server/fixtures';

const enrollmentDetail = merchants.enrollments.detail.success();
// Full MerchantEnrollmentDetailResponse with bill, fields, enrollment metadata

const receiptData = merchants.receipts.enrollment.success();
// Full MerchantEnrollmentReceiptResponse with payment info, line items, etc.
```

**Override specific fields for a test case:**

```ts
import { transactions } from '@/../__mocks__/server/fixtures';

const detail = {
  ...transactions.detail.success(),
  status: 'failed',
  paymentReferenceId: null,
};
```

### Available Fixture Namespaces

| Import              | Covers                                    |
|---------------------|-------------------------------------------|
| `auth`              | login, signup, resetPassword, resetPasswordConfirm, verifyOtp, resendOtp |
| `profile`           | get, update, updateAddress                |
| `accountSecurity`   | updateEmail, changeEmailConfirm, updatePassword |
| `billers`           | list                                      |
| `bills`             | list, detail, create, delete              |
| `transactions`      | list, detail, create, pay, last           |
| `paymentMethods`    | list, add, update                         |
| `enrollments`       | list                                      |
| `merchants`         | list, detail, landingConfig, payment, paymentTypes, paymentFormConfig, enrollmentFormConfig, projects |
| `merchants.transactions` | create, detail, paymentBin, paymentCko, paymentVault |
| `merchants.enrollments`  | create, detail, paymentBin, paymentVault, enroll |
| `merchants.receipts`     | transaction, enrollment, keys             |

Each namespace exposes `.request()`, `.success()`, `.error()`, or `.empty()` depending on the endpoint type.

---

## Adding a New Fixture

1. Create a directory under the matching resource in `__mocks__/server/fixtures/`:
   ```
   fixtures/enrollments/cancel/
   ├── request.json
   ├── success-response.json
   └── error-response.json
   ```

2. Populate the JSON files with data matching the API's actual response shape. Check the corresponding type in `redux/features/*/` or `types/` for the expected fields.

3. Add a route in `__mocks__/server/server.js`:
   ```js
   app.post('/v1/enrollments/:id/cancel', (req, res) => {
     return res.json(loadFixture('enrollments', 'cancel', 'success-response.json'));
   });
   ```

4. Add an accessor in `__mocks__/server/fixtures/index.ts`:
   ```ts
   export const enrollments = {
     // ...existing...
     cancel: {
       request: () => loadFixture('enrollments', 'cancel', 'request.json'),
       success: () => loadFixture('enrollments', 'cancel', 'success-response.json'),
       error: () => loadFixture('enrollments', 'cancel', 'error-response.json'),
     },
   };
   ```

5. Validate your JSON:
   ```bash
   python3 -c "import json; json.load(open('__mocks__/server/fixtures/enrollments/cancel/success-response.json'))"
   ```

---

## Adding Per-Biller Data

Biller-specific fixtures (detail, config lookups) are served dynamically by biller ID. To add data for a new biller:

1. Add the biller detail file:
   ```
   fixtures/billers/detail/{biller_id}.json
   ```

2. Add config files for any lookup types the biller supports:
   ```
   fixtures/billers/config/payment-types/{biller_id}.json
   fixtures/billers/config/payment-modes/{biller_id}.json
   ```

The mock server resolves these automatically via `loadFixture('billers', 'detail', '${id}.json')` — no `server.js` changes needed.

---

## Troubleshooting

### Server won't start

- Check that dependencies are installed: `cd __mocks__/server && npm install`
- Check for port conflicts: `lsof -i :4000`

### Fixture not loading

- Verify the JSON file parses correctly (see validation step above)
- Check the path in `server.js` matches the directory name exactly
- The `loadFixture` helper logs `ENOENT` errors — check the server console output

### App not reaching mock server

- Ensure the app's environment is set to `local` in `constants/env.ts`
- For physical devices, use your machine's local IP instead of `localhost`
- The mock server binds to `0.0.0.0`, so it's accessible from emulators and devices on the same network

---

## Related Docs

- [DEBUGGING.md](./DEBUGGING.md) — General debugging tips
- [TESTING.md](./TESTING.md) — Test setup and conventions
- [SETUP.md](./SETUP.md) — Project setup and environment configuration
