const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 4000;
const fs = require('fs');
const path = require('path');

const FIXTURES = path.join(__dirname, 'fixtures');

const billersData = require('./fixtures/billers/list/success-response.json');
const billsData = require('./fixtures/bills/list/success-response.json');
const billsEmpty = require('./fixtures/bills/list/empty-response.json');
const paymentMethodsData = require('./fixtures/payment-methods/list/success-response.json');
const paymentMethodsEmpty = require('./fixtures/payment-methods/list/empty-response.json');
const transactionsData = require('./fixtures/transactions/list/success-response.json');
const transactionsEmpty = require('./fixtures/transactions/list/empty-response.json');
const transactionsDetailData = require('./fixtures/transactions/detail/success-response.json');
const individualData = require('./fixtures/profile/get/success-response.json');
const billDetailData = require('./fixtures/bills/detail/success-response.json');
const transactionLast = require('./fixtures/transactions/last/success-response.json');

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`[mock] ${new Date().toISOString()} ${req.method} ${req.url} body=`, req.body);
  next();
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Qw-Merchant-Id, X-Xsrf-Token, Idempotency-Key, x-aqwire-client');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const users = [
  {
    username: 'testuser@user.com',
    password: 'qweQWE123!@#',
    name: 'Test User',
  },
];

const loadFixture = (...segments) => {
  const filePath = path.join(FIXTURES, ...segments);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// POST /v1/auth/ — login
app.post('/v1/auth/', (req, res) => {
  const { username, password, turnstileToken } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Email/username and password are required' });
  }
  if (!turnstileToken) {
    return res.status(400).json({ error: 'turnstileToken is required' });
  }

  const found = users.find((u) => u.username === username && u.password === password);
  if (!found) {
    return res.status(401).json(loadFixture('auth', 'login', 'error-response.json'));
  }

  return res.json(loadFixture('auth', 'login', 'success-response.json'));
});

// PUT /v1/auth/ — update password
app.put('/v1/auth/', (req, res) => {
  return res.json(loadFixture('account-security', 'update-password', 'success-response.json'));
});

// POST /v1/person/ — signup
app.post('/v1/person/', (req, res) => {
  const { firstName, lastName, emailAddress, rawPassword } = req.body || {};
  if (!emailAddress || !rawPassword || !firstName || !lastName) {
    return res.status(400).json({ error: 'First Name, Last Name, Email, and Password are required.' });
  }

  const exists = users.find((u) => u.emailAddress === emailAddress);
  if (exists) {
    return res.status(409).json(loadFixture('auth', 'signup', 'error-response.json'));
  }

  users.push({ firstName, lastName, emailAddress, rawPassword });
  return res.status(201).json(loadFixture('auth', 'signup', 'success-response.json'));
});

// POST /v1/person/verify/email-verification — verify OTP
app.post('/v1/person/verify/email-verification', (req, res) => {
  return res.json(loadFixture('auth', 'verify-otp', 'success-response.json'));
});

// POST /v1/person/resend-code/email-verification — resend OTP
app.post('/v1/person/resend-code/email-verification', (req, res) => {
  return res.json(loadFixture('auth', 'resend-otp', 'success-response.json'));
});

// POST /v1/person/email — update email
app.post('/v1/person/email', (req, res) => {
  return res.json(loadFixture('account-security', 'update-email', 'success-response.json'));
});

// PATCH /v1/person/change-email — confirm email change
app.patch('/v1/person/change-email', (req, res) => {
  return res.json(loadFixture('account-security', 'change-email-confirm', 'success-response.json'));
});

// PATCH /v1/person/profile — update profile
app.patch('/v1/person/profile', (req, res) => {
  return res.json(loadFixture('profile', 'update', 'success-response.json'));
});

// POST /v1/auth/reset-password/ — forgot password
app.post('/v1/auth/reset-password/', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });
  return res.json(loadFixture('auth', 'reset-password', 'success-response.json'));
});

// POST /v1/auth/reset-password-confirm — confirm password reset
app.post('/v1/auth/reset-password-confirm', (req, res) => {
  return res.json(loadFixture('auth', 'reset-password-confirm', 'success-response.json'));
});

// GET /v1/customer/individual/ — get profile
app.get('/v1/customer/individual/', (req, res) => {
  res.json(individualData);
});

// PATCH /v1/customer/add-address/individual — update address
app.patch('/v1/customer/add-address/individual', (req, res) => {
  return res.json(loadFixture('profile', 'update-address', 'success-response.json'));
});

// GET /v1/biller — get billers list
app.get('/v1/biller', (req, res) => {
  const { search, category } = req.query;
  if (search) {
    const fileName = search.replace(/[^a-zA-Z0-9-]/g, '');
    try {
      const data = loadFixture('billers', 'search', `${fileName}.json`);
      return res.json(data);
    } catch {
      console.warn(`[MOCK] Biller search file not found for: ${fileName}`);
    }
  }

  if (category) {
    try {
      const data = loadFixture('billers', 'categories', `${category}.json`);
      return res.json({ billersData: { billers: data } });
    } catch {
      console.warn(`[MOCK] Category file not found for: ${category}`);
    }
  }

  res.json({ billersData: { billers: billersData.billers } });
});

// GET /v1/biller/:id — get biller detail
app.get('/v1/biller/:id', (req, res) => {
  try {
    const data = loadFixture('billers', 'detail', `${req.params.id}.json`);
    res.json(data);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Biller not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /v1/biller/:id/project — get biller projects
app.get('/v1/biller/:id/project', (req, res) => {
  try {
    const data = loadFixture('billers', 'config', 'projects', `${req.params.id}.json`);
    res.json({ project: data });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'project not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Biller config endpoints (paymentTypes, propertyTypes, salesChannels, paymentModes, paymentOptions, months, paymentYears, chargeTypes)
const billerConfigRoutes = [
  { path: 'paymentTypes', fixture: 'payment-types' },
  { path: 'propertyTypes', fixture: 'property-types' },
  { path: 'salesChannels', fixture: 'sales-channels' },
  { path: 'paymentModes', fixture: 'payment-modes' },
  { path: 'paymentOptions', fixture: 'payment-options' },
  { path: 'months', fixture: 'months' },
  { path: 'paymentYears', fixture: 'payment-years' },
  { path: 'chargeTypes', fixture: 'charge-types' },
];

billerConfigRoutes.forEach(({ path: routePath, fixture }) => {
  app.get(`/v1/biller/:id/config/${routePath}`, (req, res) => {
    try {
      const data = loadFixture('billers', 'config', fixture, `${req.params.id}.json`);
      res.json(data);
    } catch (err) {
      if (err.code === 'ENOENT') return res.status(404).json({ error: `${routePath} not found` });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// GET /v1/bills — get bills
app.get('/v1/bills', (req, res) => {
  res.json(billsEmpty);
});

// POST /v1/bills/ — create bill
app.post('/v1/bills/', (req, res) => {
  const { billName, merchantCode } = req.body || {};
  if (!billName || !merchantCode) {
    return res.status(400).json(loadFixture('bills', 'create', 'error-response.json'));
  }
  return res.status(201).json(loadFixture('bills', 'create', 'success-response.json'));
});

// DELETE /v1/bills/:id — delete bill
app.delete('/v1/bills/:id', (req, res) => {
  res.json(loadFixture('bills', 'delete', 'success-response.json'));
});

// GET /v1/bills/:id — get bill detail
app.get('/v1/bills/:id', (req, res) => {
  res.json(billDetailData);
});

// GET /v1/payment-methods/get-payment-methods/ — get payment methods
app.get('/v1/payment-methods/get-payment-methods/', (req, res) => {
  res.json(paymentMethodsEmpty);
});

// POST /v1/payment-methods/add-card-payment — add card
app.post('/v1/payment-methods/add-card-payment', (req, res) => {
  return res.status(201).json(loadFixture('payment-methods', 'add', 'success-response.json'));
});

// PATCH /v1/payment-methods/:id — update payment method
app.patch('/v1/payment-methods/:id', (req, res) => {
  return res.json(loadFixture('payment-methods', 'update', 'success-response.json'));
});

// GET /v1/transactions/ — get transactions
app.get('/v1/transactions/', (req, res) => {
  res.json(transactionsEmpty);
});

// POST /v1/transactions/ — create transaction computation
app.post('/v1/transactions/', (req, res) => {
  const { baseAmount, billingReferenceId, paymentMethodReferenceId } = req.body;
  if (!baseAmount || !billingReferenceId || !paymentMethodReferenceId) {
    return res.status(400).json(loadFixture('transactions', 'create', 'error-response.json'));
  }
  return res.json(loadFixture('transactions', 'create', 'success-response.json'));
});

// POST /v1/transactions/:id/pay — pay transaction
app.post('/v1/transactions/:id/pay', (req, res) => {
  return res.json(loadFixture('transactions', 'pay', 'success-response.json'));
});

// GET /v1/transactions/:id — get transaction detail
app.get('/v1/transactions/:id', (req, res) => {
  res.json(transactionsDetailData);
});

// GET /v1/transactions/last/:id — get last transaction
app.get('/v1/transactions/last/:id', (req, res) => {
  res.json(transactionLast);
});

// GET /v1/enrollments — get enrollments
app.get('/v1/enrollments', (req, res) => {
  res.json(loadFixture('enrollments', 'list', 'success-response.json'));
});

// --- Enrollment / Merchant endpoints ---

// GET /v1/merchants — list merchants
app.get('/v1/merchants', (req, res) => {
  res.json(loadFixture('merchants', 'list', 'success-response.json'));
});

// GET /v1/merchants/:id — merchant detail
app.get('/v1/merchants/:id', (req, res) => {
  res.json(loadFixture('merchants', 'detail', 'success-response.json'));
});

// GET /v1/merchants/:id/payment — merchant payment config
app.get('/v1/merchants/:id/payment', (req, res) => {
  res.json(loadFixture('merchants', 'payment', 'success-response.json'));
});

// GET /v1/merchants/:id/config/landing — merchant landing config
app.get('/v1/merchants/:id/config/landing', (req, res) => {
  res.json(loadFixture('merchants', 'landing-config', 'success-response.json'));
});

// GET /v1/merchants/:id/payment-types — merchant payment types
app.get('/v1/merchants/:id/payment-types', (req, res) => {
  res.json(loadFixture('merchants', 'payment-types', 'success-response.json'));
});

// GET /v1/merchants/:id/config/forms/payment — payment form config
app.get('/v1/merchants/:id/config/forms/payment', (req, res) => {
  res.json(loadFixture('merchants', 'payment-form-config', 'success-response.json'));
});

// GET /v1/merchants/:id/config/forms/enrollment — enrollment form config
app.get('/v1/merchants/:id/config/forms/enrollment', (req, res) => {
  res.json(loadFixture('merchants', 'enrollment-form-config', 'success-response.json'));
});

// GET /v1/merchants/:id/projects — merchant projects
app.get('/v1/merchants/:id/projects', (req, res) => {
  res.json(loadFixture('merchants', 'projects', 'success-response.json'));
});

// POST /v1/merchants/:id/transactions — create merchant transaction
app.post('/v1/merchants/:id/transactions', (req, res) => {
  return res.status(201).json(loadFixture('merchants', 'transactions', 'create', 'success-response.json'));
});

// GET /v1/merchants/:id/transactions/:txnId — merchant transaction detail
app.get('/v1/merchants/:id/transactions/:txnId', (req, res) => {
  res.json(loadFixture('merchants', 'transactions', 'detail', 'success-response.json'));
});

// GET /v1/merchants/:id/transactions/:txnId/payment/bin/:bin — BIN lookup
app.get('/v1/merchants/:id/transactions/:txnId/payment/bin/:bin', (req, res) => {
  res.json(loadFixture('merchants', 'transactions', 'payment-bin', 'success-response.json'));
});

// POST /v1/merchants/:id/transactions/:txnId/payment/cko — CKO payment
app.post('/v1/merchants/:id/transactions/:txnId/payment/cko', (req, res) => {
  return res.status(201).json(loadFixture('merchants', 'transactions', 'payment-cko', 'success-response.json'));
});

// POST /v1/merchants/:id/transactions/:txnId/payment/vault — vault payment
app.post('/v1/merchants/:id/transactions/:txnId/payment/vault', (req, res) => {
  return res.status(201).json(loadFixture('merchants', 'transactions', 'payment-vault', 'success-response.json'));
});

// POST /v1/merchants/:id/enrollments — create enrollment
app.post('/v1/merchants/:id/enrollments', (req, res) => {
  return res.status(201).json(loadFixture('merchants', 'enrollments', 'create', 'success-response.json'));
});

// GET /v1/merchants/:id/enrollments/:enrId — enrollment detail
app.get('/v1/merchants/:id/enrollments/:enrId', (req, res) => {
  res.json(loadFixture('merchants', 'enrollments', 'detail', 'success-response.json'));
});

// GET /v1/merchants/:id/enrollments/:enrId/payment/bin/:bin — enrollment BIN lookup
app.get('/v1/merchants/:id/enrollments/:enrId/payment/bin/:bin', (req, res) => {
  res.json(loadFixture('merchants', 'enrollments', 'payment-bin', 'success-response.json'));
});

// POST /v1/merchants/:id/enrollments/:enrId/payment/vault — enrollment vault payment
app.post('/v1/merchants/:id/enrollments/:enrId/payment/vault', (req, res) => {
  return res.status(201).json(loadFixture('merchants', 'enrollments', 'payment-vault', 'success-response.json'));
});

// POST /v1/merchants/:id/enrollments/:enrId/enroll — complete enrollment
app.post('/v1/merchants/:id/enrollments/:enrId/enroll', (req, res) => {
  return res.status(201).json(loadFixture('merchants', 'enrollments', 'enroll', 'success-response.json'));
});

// GET /v1/merchants/:id/receipts/:refId — transaction receipt
app.get('/v1/merchants/:id/receipts/:refId', (req, res) => {
  res.json(loadFixture('merchants', 'receipts', 'transaction', 'success-response.json'));
});

// GET /v1/merchants/:id/receipts/:txnId/keys — receipt access keys
app.get('/v1/merchants/:id/receipts/:txnId/keys', (req, res) => {
  res.json(loadFixture('merchants', 'receipts', 'keys', 'success-response.json'));
});

// GET /v1/merchants/:id/enrollments/receipts/:refId — enrollment receipt
app.get('/v1/merchants/:id/enrollments/receipts/:refId', (req, res) => {
  res.json(loadFixture('merchants', 'receipts', 'enrollment', 'success-response.json'));
});

const HOST = '0.0.0.0';

app.listen(port, HOST, () => {
  console.log(`Mock server listening on http://${HOST}:${port}`);
  console.log(`Access on device at http://${HOST}:${port}`);
});
