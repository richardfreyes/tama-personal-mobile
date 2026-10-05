import { ENROLLMENT_SOURCE } from '@/constants/enrollment';

export const MOCK_DATA = {
  CAROUSEL_SLIDER: [
    { id: '1', heading: '₱1,120.00', desc: 'Bills this month' },
    { id: '2', heading: '₱2,500.00', desc: 'Total pending' },
    { id: '3', heading: '₱450.00', desc: 'Last month' },
  ],
  NOTIFICATIONS: [
    { id: '1', title: 'Payment Success', body: 'Reminder: Your Alveo Land Corp is due in 3 days.', date: '3 hours ago', isRead: false, category: 'Today' },
    { id: '2', title: 'Payment Success', body: 'Reminder: Your Alveo Land Corp is due in 3 days.', date: '3 hours ago', isRead: false, category: 'Today' },
    { id: '3', title: 'New Bill Available', body: 'You’ve successfully paid for your Alveo Land Corp.', date: 'October 12, 2025', isRead: false, category: 'Yesterday' },
    { id: '4', title: 'Autopay Scheduled', body: 'You’ve successfully paid for your Alveo Land Corp.', date: 'September 12, 2025', isRead: true, category: 'Older' },
    { id: '5', title: 'Welcome!', body: 'You’ve successfully paid for your Alveo Land Corp.', date: 'September 11, 2025', isRead: true, category: 'Older' },
    { id: '6', title: 'Welcome!', body: 'You’ve successfully paid for your Alveo Land Corp.', date: 'September 11, 2025', isRead: true, category: 'Older' },
    { id: '7', title: 'Welcome!', body: 'You’ve successfully paid for your Alveo Land Corp.', date: 'September 11, 2025', isRead: true, category: 'Older' },
    { id: '8', title: 'Welcome!', body: 'You’ve successfully paid for your Alveo Land Corp.', date: 'September 11, 2025', isRead: true, category: 'Older' },
    { id: '9', title: 'Welcome!', body: 'You’ve successfully paid for your Alveo Land Corp.', date: 'September 11, 2025', isRead: true, category: 'Older' },
    { id: '10', title: 'Welcome!', body: 'You’ve successfully paid for your Alveo Land Corp.', date: 'September 11, 2025', isRead: true, category: 'Older' },
  ],
  ENROLLMENTS: {
    FORM_PAYLOAD: {
      "merchantId": "aboitizland",
      "paymentType": "MA",
      "project": {
        "name": "Ajoya Cabanatuan",
        "projectId": "ajoyacabanatuan",
        "category": ""
      },
      "clientNotes": "Notes",
      "customer": {
        "name": "RICHARD",
        "email": "user@example.com",
        "mobile": "+639770884111",
        "countryPrefix": "63",
        "countryIso2": "ph"
      },
      "bill": {
        "base": {
          "amount": "10000.00",
          "currency": "PHP"
        }
      },
      "transactionType": "payment",
      "source": ENROLLMENT_SOURCE,
      "adminNotes": null,
      "fields": [
        {
          "name": "lotCode",
          "text": "Lot Code",
          "value": "AM12345"
        },
        {
          "name": "paymentMode",
          "text": "Payment Mode",
          "value": "Full Payment"
        }
      ]
    },
    FORM_DETAILS_PAYLOAD: {
      fullName: "Jane D. Persona",
      cardNumber: "4242 4242 4242 4242",
      expiryDate: "12/28",
      securityCode: "123",
      streetAddress: "123 Debugging Lane",
      country: "United States",
      stateRegion: "California",
      city: "San Francisco",
      postalCode: "94103",

      saveAsDefaultBilling: true,
      useAsPrimaryPayment: true,
      cardProvider: "visa"
    },
    CONFIRM_PAYMENT: {
      "accessCancelUrl": null,
      "accessSuccessUrl": null,
      "billBase": [
        "PHP",
        10000
      ],
      "billConverted": [
        "PHP",
        0
      ],
      "billFee": [
        "PHP",
        0
      ],
      "billTotal": [
        "PHP",
        0
      ],
      "clientNotes": "Notes",
      "createdAt": "2026-05-05T13:30:09.576707+08:00",
      "customerCountryCode": "ph",
      "customerCountryPrefix": "63",
      "customerEmail": "user@example.com",
      "customerMobileNo": "+639770884111",
      "customerName": "RICHARD",
      "dueAt": null,
      "expiresAt": "2026-05-05T14:00:09.572561+08:00",
      "invoiceCreatedAt": "2026-05-05T13:30:09.576707+08:00",
      "invoiceUpdatedAt": "2026-05-05T13:30:09.576707+08:00",
      "lineItems": [],
      "merchantId": "aboitizland",
      "merchantName": "AboitizLand, Inc.",
      "merchantNid": 3,
      "methodBillingAddressOne": null,
      "methodBillingAddressTwo": null,
      "methodBillingCountryCode": null,
      "methodBillingPostalCode": null,
      "methodBillingState": null,
      "methodBrand": null,
      "methodCardNumber": null,
      "methodCustomerCountryCode": null,
      "methodCustomerCountryName": null,
      "methodCustomerEmailAddress": "user@example.com",
      "methodCustomerFamilyName": null,
      "methodCustomerFullName": null,
      "methodCustomerGivenName": null,
      "methodCustomerPostalCode": null,
      "methodDescription": "N/A",
      "methodExpiry": null,
      "methodId": 34831,
      "methodIssuer": null,
      "methodName": "N/A",
      "methodProcessor": "N/A",
      "methodProcessorId": null,
      "methodProvider": null,
      "methodRedirectUrl": null,
      "methodStatus": null,
      "methodType": null,
      "paidAt": null,
      "paymentStatusCode": "PENDING",
      "paymentStatusName": "Pending",
      "paymentTypeCode": "ABOITIZLAND_MA",
      "paymentTypeId": 10,
      "paymentTypeName": "Monthly Amortization",
      "projectCategory": null,
      "projectCode": "ajoyacabanatuan",
      "projectFields": {
        "fields": [],
        "metadata": null
      },
      "projectId": 6,
      "projectName": "Ajoya Cabanatuan",
      "qwxRate": [
        "PHP",
        "PHP",
        0
      ],
      "referenceId": null,
      "source": ENROLLMENT_SOURCE,
      "status": "INC",
      "submittedAt": "2026-05-05T13:30:09.576707+08:00",
      "transactionFields": [
        {
          "name": "lotCode",
          "text": "Lot Code",
          "value": "AM12345"
        },
        {
          "name": "paymentMode",
          "text": "Payment Mode",
          "value": "Full Payment"
        }
      ],
      "transactionId": "S672SSQZRO6W5QIX",
      "transactionTypeCode": "PAYMENT",
      "transactionTypeId": 10,
      "updatedAt": "2026-05-05T13:30:09.576707+08:00",
      "usesNewFees": false
    }
  }
};
