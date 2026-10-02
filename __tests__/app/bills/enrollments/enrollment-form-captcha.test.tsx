import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import InformationScreen from '../../../../app/(app)/bills/enrollments/form';

const mockDispatch = jest.fn();
const mockCreateMerchantEnrollment = jest.fn();
const mockEnrollmentReviewState = {
  cardPayload: null,
  transactionResponse: null,
  formResetKey: 0,
};

jest.mock('@/components/common/InfoFieldComponent', () => {
  const React = require('react');
  const { Text } = require('react-native');

  function MockInfoFieldComponent({ label, value }: any) {
    return <Text>{`${label}: ${value}`}</Text>;
  }

  return MockInfoFieldComponent;
});

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
    AppText: ({ children, onPress, style }: any) => <Text onPress={onPress} style={style}>{children}</Text>,
  };
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

jest.mock('@/components/forms/DynamicFormComponent', () => {
  const React = require('react');
  const { Text } = require('react-native');

  function MockDynamicFormComponent({ isEnrollment, onTermsPress, onPrivacyPress, onRefundPress }: any) {
    return (
      <>
        <Text>{isEnrollment ? 'Enrollment form fields' : 'Payment form fields'}</Text>
        <Text onPress={onTermsPress}>Terms of Service</Text>
        <Text onPress={onPrivacyPress}>Privacy Policy</Text>
        <Text onPress={onRefundPress}>Refund Policy</Text>
      </>
    );
  }

  return MockDynamicFormComponent;
});

jest.mock('@/components/layout/AutoDebitTermsModal', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    AutoDebitTermsModal: ({ visible }: any) => visible ? <Text>Auto Debit Terms Modal</Text> : React.createElement(React.Fragment),
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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    firstName: 'Jane',
    lastName: 'Customer',
    email: 'jane@example.com',
  }),
}));

jest.mock('@/redux/features/merchants/merchantApi', () => ({
  useCreateMerchantEnrollmentMutation: () => [mockCreateMerchantEnrollment, { isLoading: false }],
  useGetMerchantEnrollmentFormConfigQuery: () => ({
    data: {
      currencies: [{ currency: 'PHP', minAmount: 1, maxAmount: 100000 }],
      fields: [],
    },
    isLoading: false,
  }),
  useGetMerchantProjectsQuery: () => ({ data: [], isLoading: false }),
  useGetMerchantByIdQuery: () => ({
    data: {
      paymentTypes: [],
      paymentModes: [],
    },
    isLoading: false,
  }),
}));

jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({ enrollmentReview: mockEnrollmentReviewState }),
}));

const mockedUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockedRouter = router as jest.Mocked<typeof router>;

const renderEnrollmentReview = () => {
  render(<InformationScreen />);
  fireEvent.press(screen.getByText('Next'));
};

describe('Enrollment Auto Debit enrollment form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLocalSearchParams.mockReturnValue({
      merchantId: 'merchant-1',
      merchantName: 'Enrollment Merchant',
    });
    mockCreateMerchantEnrollment.mockReturnValue({
      unwrap: () => Promise.resolve({
        transactionId: 'enrollment-1',
        xsrfKey: 'xsrf-enrollment-1',
      }),
    });
  });

  it('creates an Auto Debit merchant enrollment from the enrollment form', async () => {
    renderEnrollmentReview();

    fireEvent.press(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(mockCreateMerchantEnrollment).toHaveBeenCalledWith(
        expect.objectContaining({
          merchantCode: 'merchant-1',
        }),
      );
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'enrollmentReview/setEnrollmentTransactionResponse',
      payload: expect.objectContaining({
        merchantId: 'merchant-1',
        merchantName: 'Enrollment Merchant',
        transactionId: 'enrollment-1',
        xsrfKey: 'xsrf-enrollment-1',
        isEnrollment: true,
      }),
    });
    expect(mockedRouter.replace).toHaveBeenCalledWith('/(app)/bills/enrollments/payment-method');
  });

  it('opens Auto Debit terms from the enrollment form', () => {
    render(<InformationScreen />);

    fireEvent.press(screen.getByText('Terms of Service'));

    expect(screen.getByText('Auto Debit Terms Modal')).toBeTruthy();
  });
});
