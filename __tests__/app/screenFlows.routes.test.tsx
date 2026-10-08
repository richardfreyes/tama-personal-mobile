import { describe, expect, it, jest } from '@jest/globals';
import PaymentSuccessScreen from '@/app/(app)/bills/one-time-payments/pay/payment-success';
import { ACCOUNT_SECURITY, FLOATING_NAV_TABS, SETTINGS } from '@/constants/navigationItems';
import { LEGAL_ROWS } from '@/constants/about';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import fs from 'fs';
import path from 'path';

jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
}));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title, onBackPress }: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>{`Nav:${title}`}</Text>
        {onBackPress ? <Pressable accessibilityRole="button" onPress={onBackPress}><Text>Go back</Text></Pressable> : null}
      </View>
    );
  }
));
jest.mock('@/redux/features/billDetail/billDetailApi', () => ({
  useGetBillDetailQuery: () => ({ data: undefined }),
}));
jest.mock('@/redux/features/biller/billerApi', () => ({
  useGetBillersQuery: () => ({ data: [] }),
}));
jest.mock('@/redux/features/paymentMethods/paymentMethodApi', () => ({
  useGetPaymentMethodsQuery: () => ({ data: [] }),
}));
jest.mock('@/redux/features/transactionDetail/transactionDetailApi', () => ({
  useGetTransactionDetailQuery: () => ({
    currentData: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
  }),
}));
jest.mock('@/redux/features/oneTimePayment/oneTimePaymentSlice', () => ({
  oneTimePaymentCompleted: () => ({ type: 'oneTimePayment/completed' }),
}));
jest.mock('@/redux/features/transactions/transactionApi', () => ({
  cacheCompletedTransaction: () => ({ type: 'transactions/cacheCompleted' }),
}));

const APP_DIR = path.join(__dirname, '../../app');

const screenFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return screenFiles(fullPath);
    if (!/\.(tsx|ts)$/.test(entry.name)) return [];
    if (entry.name.startsWith('_layout') || entry.name.startsWith('+')) return [];
    return [path.relative(APP_DIR, fullPath)];
  });

const toRoute = (relativeFile: string): string => {
  const withoutExtension = relativeFile.replace(/\.(tsx|ts)$/, '');
  const segments = withoutExtension
    .split(path.sep)
    .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')));
  if (segments[segments.length - 1] === 'index') segments.pop();
  return `/${segments.join('/')}`;
};

const SCREEN_ROUTES = screenFiles(APP_DIR).map(toRoute);

const routeExists = (href: string): boolean => {
  const pathname = href.split('?')[0];
  return SCREEN_ROUTES.some((route) => {
    if (route === pathname) return true;
    const pattern = `^${route.replace(/\[[^\]]+\]/g, '[^/]+')}$`;
    return new RegExp(pattern).test(pathname);
  });
};

describe('screen flow route map', () => {
  it('registers a screen for every primary tab, settings destination, and legal row', () => {
    const absoluteHrefs = [
      ...FLOATING_NAV_TABS.map((tab) => tab.href),
      ...SETTINGS.map((item) => item.route).filter((route) => route.startsWith('/')),
      '/settings/security/change-email',
      '/settings/security/change-password',
      '/notifications/settings',
      '/login',
      '/login/intro',
      '/signup',
      '/verify',
      '/reset-password',
      '/reset-password/check-email',
      '/reset-password/otp-delivery-selection',
      '/reset-password/verify-otp',
      '/reset-password/create-new-password',
      '/reset-password/success',
      '/change-email-confirm',
      '/dashboard',
      '/bills',
      '/bills/one-time-payments',
      '/bills/one-time-payments/saved',
      '/bills/one-time-payments/add/form',
      '/bills/one-time-payments/pay/confirm-payment',
      '/bills/one-time-payments/pay/payment-success',
      '/bills/one-time-payments/pay/bill-1',
      '/bills/enrollments',
      '/bills/enrollments/form',
      '/bills/enrollments/details',
      '/bills/enrollments/enrolled',
      '/bills/enrollments/payment-method',
      '/bills/enrollments/confirm-payment',
      '/bills/enrollments/payment-success',
      '/bills/enrollments/result',
      '/payment-methods',
      '/payment-methods/add-card',
      '/payment-methods/form-details',
      '/payment-methods/update-card',
      '/payment-methods/direct-debit',
      '/payment-methods/direct-debit-otp',
      '/payment-methods/direct-debit-result',
      '/payment-methods/paypal',
      '/payment-methods/qrph',
      '/payment-methods/payment-result',
      '/transactions',
      '/transactions/invoice-1',
      '/notifications',
    ];

    const missing = absoluteHrefs.filter((href) => !routeExists(href));
    expect(missing).toEqual([]);
  });

  it('names floating tabs after the flattened tab screens', () => {
    const tabFiles = FLOATING_NAV_TABS.map((tab) => tab.name);
    expect(tabFiles).toEqual([
      'dashboard',
      'bills/index',
      'transactions/index',
      'payment-methods/index',
    ]);
    for (const tab of FLOATING_NAV_TABS) {
      expect(routeExists(tab.href)).toBe(true);
    }
  });

  it('resolves Account & Security actions onto the change-email and change-password screens', () => {
    const changeEmail = ACCOUNT_SECURITY.find((item) => item.id === 'changeEmail');
    const changePassword = ACCOUNT_SECURITY.find((item) => item.id === 'changePassword');

    expect(changeEmail?.route).toBe('/settings/security/change-email');
    expect(changePassword?.route).toBe('/settings/security/change-password');
    expect(routeExists('/settings/security/change-email')).toBe(true);
    expect(routeExists('/settings/security/change-password')).toBe(true);
  });

  it('keeps legal rows on screens that exist', () => {
    const titles = LEGAL_ROWS.map((row) => row.title);
    expect(titles).toEqual([
      'Terms & Conditions',
      'Privacy Policy',
      'Refund and Chargeback Policy',
      'Licenses',
    ]);
    expect(routeExists('/settings/terms')).toBe(true);
    expect(routeExists('/settings/privacy')).toBe(true);
    expect(routeExists('/settings/refund-policy')).toBe(true);
    expect(routeExists('/settings/licenses')).toBe(true);
  });

  it('sends a one-time receipt header back to the dashboard', () => {
    render(<PaymentSuccessScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Go back' }));
    expect(router.replace).toHaveBeenCalledWith('/dashboard');
  });
});
