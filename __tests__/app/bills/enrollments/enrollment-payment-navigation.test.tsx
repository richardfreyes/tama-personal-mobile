import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { StyleSheet } from 'react-native';
import ConfirmPaymentScreen from '../../../../app/(app)/bills/enrollments/confirm-payment';
import FormDetails from '../../../../app/(app)/payment-methods/form-details';
import { legalStyles } from '../../../../styles/app/settings/legal';
import { modalActions } from '../../../../utils/modalActions';

const mockDispatch = jest.fn();
const mockRefetchProfile = jest.fn();
const mockProfileData = {
  firstName: 'Jane',
  lastName: 'Customer',
  customerAddress: '123 Street',
  customerCountryIso2Code: 'PH',
};
const mockEnrollmentCardPayload = {
  creditCardNumber: '4111111111111111',
  expiryDate: '12/30',
  cardSecurityCode: '123',
  cardholderName: 'Jane Customer',
  cardOrigin: 'PH',
  billingStreet: '123 Street',
  billingCity: 'Manila',
  billingState: 'Metro Manila',
  billingCountry: 'Philippines',
  billingCountryCode: 'PH',
  billingPostalCode: '1000',
};
let mockEnrollmentReviewState = {
  cardPayload: mockEnrollmentCardPayload,
  transactionResponse: {
    merchantId: 'merchant-1',
    merchantName: 'Enrollment Merchant',
    message: '',
    status: '',
    transactionId: 'txn-1',
    xsrfKey: 'xsrf-1',
    isEnrollment: true,
  },
  formResetKey: 0,
};
const mockReadyPaymentMethodState = {
  cardDetails: { cardProvider: 'Visa', lastFourDigits: '1111' },
  merchantTransactionData: {
    bill: { amount: ['PHP', 1000], currency: 'PHP' },
    customerName: 'Jane Customer',
    enrollmentMonths: 12,
    enrollmentStartDate: '2026-08-01',
  },
  isPaymentMethodReady: true,
  isInitializingPaymentMethod: false,
  resetPaymentMethodState: jest.fn(),
  getLatestMerchantTransaction: jest.fn(),
};
let mockInitializeEnrollmentPaymentMethodState: any = mockReadyPaymentMethodState;
let mockInitializeEnrollmentPaymentMethodParams: any = null;
let mockCompleteEnrollmentParams: any = null;
const mockSubmitEnrollment = jest.fn();
const mockHandleVerificationComplete = jest.fn();
let mockPendingVerification: any = null;

jest.mock('@/components/common/AppButton', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    AppButton: ({ title, onPress, disabled }: any) => (
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/components/common/AppText', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    AppText: ({ children, onPress, selectable, style }: any) => (
      <Text onPress={onPress} selectable={selectable} style={style}>{children}</Text>
    ),
  };
});

jest.mock('@/components/common/DisplayNotice', () => {
  const React = require('react');

  function MockDisplayNotice() {
    return React.createElement(React.Fragment);
  }

  return MockDisplayNotice;
});

jest.mock('@/components/common/GlobalScrollView', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');

  return {
    GlobalScrollView: ({ children }: any) => <ScrollView>{children}</ScrollView>,
  };
});

jest.mock('@/components/common/SpacerComponent', () => {
  const React = require('react');
  return {
    SpacerComponent: () => React.createElement(React.Fragment),
  };
});

jest.mock('@/components/forms/InputValidationComponent', () => {
  const React = require('react');

  function MockInputValidationComponent() {
    return React.createElement(React.Fragment);
  }

  return MockInputValidationComponent;
});

jest.mock('@/components/forms/NativePicker', () => {
  const React = require('react');

  function MockNativePicker() {
    return React.createElement(React.Fragment);
  }

  return MockNativePicker;
});

jest.mock('@/components/layout/EnrollmentVerificationWebView', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    EnrollmentVerificationWebView: ({ onComplete }: any) => (
      <Pressable
        accessibilityRole="button"
        onPress={() => onComplete({
          outcome: 'failure',
          message: 'Card verification failed. Please try again.',
        })}
      >
        <Text>Fail enrollment verification</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/components/layout/NavHeaderComponent', () => {
  const React = require('react');
  const { Text } = require('react-native');

  function MockNavHeaderComponent({ title }: any) {
    return <Text>{title}</Text>;
  }

  return MockNavHeaderComponent;
});

jest.mock('@/components/layout/OtpWebView', () => {
  const React = require('react');
  return {
    OtpWebView: () => React.createElement(React.Fragment),
  };
});

jest.mock('@/components/payments/PaymentInfoSection', () => {
  const React = require('react');

  function MockPaymentInfoSection() {
    return React.createElement(React.Fragment);
  }

  return MockPaymentInfoSection;
});

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ firstName: 'Jane', lastName: 'Customer' }),
}));

jest.mock('@/hooks/useCompleteEnrollment', () => ({
  useCompleteEnrollment: (params: any) => {
    mockCompleteEnrollmentParams = params;

    return {
      isSubmittingEnrollment: false,
      submitEnrollment: mockSubmitEnrollment,
      pendingVerification: mockPendingVerification,
      handleVerificationComplete: mockHandleVerificationComplete,
    };
  },
}));

jest.mock('@/hooks/useCompleteEnrollmentPayment', () => ({
  useCompleteEnrollmentPayment: () => ({
    isSubmittingPayment: false,
    submitPayment: jest.fn(),
    pendingPaymentRedirect: null,
    handlePaymentRedirectComplete: jest.fn(),
  }),
}));

jest.mock('@/hooks/useInitializeEnrollmentPaymentMethod', () => ({
  useInitializeEnrollmentPaymentMethod: (params: any) => {
    mockInitializeEnrollmentPaymentMethodParams = params;
    return mockInitializeEnrollmentPaymentMethodState;
  },
}));

jest.mock('@/redux/features/paymentMethods/paymentMethodApi', () => ({
  useAddCardPaymentMutation: () => [jest.fn(), { isLoading: false }],
  useGetPaymentMethodsQuery: () => ({ data: [], isSuccess: true }),
  paymentMethodApi: { util: { invalidateTags: () => ({ type: 'invalidate' }) } },
}));

jest.mock('@/redux/features/transactions/transactionApi', () => ({
  usePayTransactionMutation: () => [jest.fn(), { isLoading: false }],
  usePayWithCardMutation: () => [jest.fn(), { isLoading: false }],
}));

jest.mock('@/redux/appApi', () => ({
  appApi: {
    util: {
      invalidateTags: (tags: string[]) => ({
        type: 'appApi/invalidateTags',
        payload: tags,
      }),
    },
  },
}));

jest.mock('@/redux/features/profile/profileApi', () => ({
  useGetProfileDataQuery: () => ({
    data: mockProfileData,
    refetch: mockRefetchProfile,
  }),
  useUpdateAddressMutation: () => [jest.fn(), { isLoading: false }],
}));

jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({ enrollmentReview: mockEnrollmentReviewState }),
}));

jest.mock('@/utils/card', () => ({
  detectCardProvider: () => 'Visa',
}));

jest.mock('@/utils/format', () => ({
  formatLineItemFee: () => 'PHP 0.00',
  isValidLineItemFee: () => false,
  normalizeName: (value?: string) => value?.trim().toLowerCase() || '',
}));

jest.mock('@/utils/paymentMappers', () => ({
  buildEnrollmentPaymentDetails: () => [{ label: 'Total Amount', value: 'PHP 1,000.00' }],
  buildPaymentDetails: () => [{ label: 'Total Amount', value: 'PHP 1,000.00' }],
  buildPaymentMethodDetails: () => [{ label: 'Payment Method', value: 'Visa **** 1111' }],
  buildScheduledPaymentInfo: () => null,
}));

jest.mock('@/utils/paymentMethodForm', () => ({
  PAYMENT_METHOD_PRIORITY_COUNTRIES: [],
  buildAddCardRequestPayload: () => ({}),
  buildAddressPayload: () => ({}),
  buildEnrollmentCardPayload: () => mockEnrollmentCardPayload,
  formatPaymentMethodFieldValue: (_field: string, value: string) => ({ cardProvider: 'Visa', value }),
  getNormalizedCardNumber: () => '4111111111111111',
  getPaymentOptionByTitle: () => ({ logos: [], mainLogoUri: null }),
  getSavedBillingAddressFormValues: () => ({}),
  validatePaymentMethodForm: () => ({ errors: {}, isValid: true, touched: {} }),
  validatePaymentMethodInput: () => undefined,
}));

jest.mock('country-state-city', () => ({
  City: { getCitiesOfState: () => [] },
  Country: { getAllCountries: () => [] },
  State: { getStatesOfCountry: () => [] },
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockedUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockedRouter = router as jest.Mocked<typeof router>;

describe('Enrollment payment navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompleteEnrollmentParams = null;
    mockInitializeEnrollmentPaymentMethodParams = null;
    mockPendingVerification = null;
    delete modalActions['enrollment-verification-declined'];
    mockInitializeEnrollmentPaymentMethodState = mockReadyPaymentMethodState;
    mockEnrollmentReviewState = {
      cardPayload: mockEnrollmentCardPayload,
      transactionResponse: {
        merchantId: 'merchant-1',
        merchantName: 'Enrollment Merchant',
        message: '',
        status: '',
        transactionId: 'txn-1',
        xsrfKey: 'xsrf-1',
        isEnrollment: true,
      },
      formResetKey: 0,
    };
  });

  it('replaces the enrollment card details step with the confirm-payment page', () => {
    mockedUseLocalSearchParams.mockReturnValue({ methodTitle: 'Credit / Debit Card', apiEnv: 'enrollments' });

    render(<FormDetails />);

    fireEvent.press(screen.getByText('Next'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'enrollmentReview/setEnrollmentCardPayload',
      payload: mockEnrollmentCardPayload,
    });
    expect(mockedRouter.replace).toHaveBeenCalledWith('/bills/enrollments/confirm-payment');
    expect(mockedRouter.push).not.toHaveBeenCalledWith('/bills/enrollments/confirm-payment');
  });

  it('shows Pay Bills on the enrollment confirm-payment page after direct render', () => {
    mockedUseLocalSearchParams.mockReturnValue({});

    render(<ConfirmPaymentScreen />);

    expect(screen.getByText('Pay Bills')).toBeTruthy();
    expect(screen.queryByText('Fill Out Details')).toBeNull();
  });

  it('shows an Auto-Debit confirm-payment skeleton loading state', () => {
    mockedUseLocalSearchParams.mockReturnValue({});
    mockInitializeEnrollmentPaymentMethodState = {
      ...mockReadyPaymentMethodState,
      merchantTransactionData: undefined,
      isPaymentMethodReady: false,
      isInitializingPaymentMethod: true,
    };

    render(<ConfirmPaymentScreen />);

    expect(screen.getByText('Pay Bills')).toBeTruthy();
    expect(screen.getByTestId('enrollment-confirm-payment-loading')).toBeTruthy();
    expect(screen.getByTestId('payment-info-skeleton')).toBeTruthy();
  });

  it('escapes the skeleton with a decline modal when the payment method is unsupported', () => {
    mockedUseLocalSearchParams.mockReturnValue({});
    mockInitializeEnrollmentPaymentMethodState = {
      ...mockReadyPaymentMethodState,
      merchantTransactionData: undefined,
      isPaymentMethodReady: false,
      isInitializingPaymentMethod: false,
    };

    render(<ConfirmPaymentScreen />);
    expect(screen.getByTestId('enrollment-confirm-payment-loading')).toBeTruthy();

    act(() => {
      mockInitializeEnrollmentPaymentMethodParams.onError('Payment method not supported');
    });

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'modal/showModal',
      payload: expect.objectContaining({
        id: 'enrollment-verification-declined',
        dismissible: false,
        headerMessage: 'Enrollment Declined',
        bodyMessage: 'Your enrollment was declined. Please try again or use a different card.',
        buttonConfig: { primaryLabel: 'OK' },
      }),
    }));

    act(() => {
      modalActions['enrollment-verification-declined']();
    });

    expect(mockedRouter.replace).toHaveBeenCalledWith('/bills/enrollments/payment-method');
  });

  it('resets Payment Submitted state when a new Auto-Debit enrollment transaction starts', () => {
    mockedUseLocalSearchParams.mockReturnValue({});
    const { rerender } = render(<ConfirmPaymentScreen />);

    expect(screen.getByText('Complete My Payment')).toBeTruthy();

    act(() => {
      mockCompleteEnrollmentParams.onSuccess({
        message: 'Payment completed',
        referenceId: 'ref-1',
        receiptAccessSignature: 'sig-1',
        receiptAccessType: 'view',
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'appApi/invalidateTags',
      payload: ['Enrollments'],
    });
    expect(screen.getByText('Payment Submitted')).toBeTruthy();
    expect(mockedRouter.replace).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/bills/enrollments/payment-success',
      }),
    );

    mockEnrollmentReviewState = {
      ...mockEnrollmentReviewState,
      formResetKey: 1,
      transactionResponse: {
        ...mockEnrollmentReviewState.transactionResponse!,
        transactionId: 'txn-2',
        xsrfKey: 'xsrf-2',
      },
    };

    rerender(<ConfirmPaymentScreen />);

    expect(screen.getByText('Complete My Payment')).toBeTruthy();
    expect(screen.queryByText('Payment Submitted')).toBeNull();
  });

  it('does not invalidate enrollments when Auto-Debit enrollment completion fails', () => {
    mockedUseLocalSearchParams.mockReturnValue({});

    render(<ConfirmPaymentScreen />);

    act(() => {
      mockCompleteEnrollmentParams.onError('Enrollment failed');
    });

    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: 'appApi/invalidateTags',
      payload: ['Enrollments'],
    });
  });

  it('shows an enrollment-declined modal and returns to Payment Methods on OK', () => {
    mockedUseLocalSearchParams.mockReturnValue({});
    mockPendingVerification = {
      url: 'https://verify.example.test/enrollment',
      accessSignature: 'signature',
      accessType: 'view',
    };

    render(<ConfirmPaymentScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Fail enrollment verification' }));

    expect(mockHandleVerificationComplete).toHaveBeenCalledWith({
      outcome: 'failure',
      message: 'Card verification failed. Please try again.',
    });
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'modal/showModal',
      payload: expect.objectContaining({
        id: 'enrollment-verification-declined',
        dismissible: false,
        iconType: 'error',
        headerMessage: 'Enrollment Declined',
        bodyMessage: 'Your enrollment was declined. Please try again or use a different card.',
        buttonConfig: { primaryLabel: 'OK' },
      }),
    }));
    expect(mockedRouter.replace).not.toHaveBeenCalledWith('/bills/enrollments/payment-method');

    act(() => {
      modalActions['enrollment-verification-declined']();
    });

    expect(mockedRouter.replace).toHaveBeenCalledWith('/bills/enrollments/payment-method');
  });

  it('opens styled Auto-Debit terms in ModalContent instead of the browser', () => {
    mockedUseLocalSearchParams.mockReturnValue({});

    render(<ConfirmPaymentScreen />);

    fireEvent.press(screen.getByText('Auto-Debit Enrollment Terms & Conditions'));

    const termsDocumentTitleStyle = StyleSheet.flatten(screen.getByText('Payer Terms of Service').props.style);

    expect(screen.getAllByText('Auto-Debit Enrollment Terms & Conditions')).toHaveLength(2);
    expect(screen.getByText('Payer Terms of Service')).toBeTruthy();
    expect(termsDocumentTitleStyle).toMatchObject(StyleSheet.flatten(legalStyles.documentTitle));
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('opens styled Privacy Policy in ModalContent instead of the browser', () => {
    mockedUseLocalSearchParams.mockReturnValue({});

    render(<ConfirmPaymentScreen />);

    fireEvent.press(screen.getAllByText('Privacy Policy')[0]);

    const privacyIntroStyle = StyleSheet.flatten(
      screen.getByText('Your privacy is important to us at Tama. We respect your privacy regarding any information we may collect from you across our website.').props.style,
    );

    expect(screen.getAllByText('Privacy Policy').length).toBeGreaterThan(1);
    expect(screen.getByText('Your privacy is important to us at Tama. We respect your privacy regarding any information we may collect from you across our website.')).toBeTruthy();
    expect(privacyIntroStyle).toMatchObject(StyleSheet.flatten(legalStyles.paragraph));
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

});
