import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  BillerListSkeleton,
  BillPaymentSkeleton,
  DetailsSkeleton,
  FormSkeleton,
  HorizontalCardSkeleton,
  InlineLoadingIndicator,
  NativeLoadingIndicator,
  NativeProgressBar,
  PaymentInfoSkeleton,
  PaymentMethodListSkeleton,
  ProfileSkeleton,
  ReceiptSkeleton,
  SkeletonBlock,
  SkeletonGroup,
  SkeletonList,
  TransactionDetailSkeleton,
  TransactionHistorySkeleton,
} from '@/components/common/Loading';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityInfo, Animated } from 'react-native';

describe('Loading components', () => {
  const remove = jest.fn<(...args: any[]) => any>();
  const start = jest.fn<(...args: any[]) => any>();
  const stop = jest.fn<(...args: any[]) => any>();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(jest.fn<(...args: any[]) => any>());
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove } as any);
    jest.spyOn(Animated, 'loop').mockReturnValue({ start, stop } as any);
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('renders an accessible native and inline loading indicator and announces labels', async () => {
    render(
      <>
        <NativeLoadingIndicator label="Loading account" testID="account-loader" />
        <InlineLoadingIndicator label="Loading options" />
      </>,
    );
    expect(screen.getByTestId('account-loader').props.accessibilityState).toEqual({ busy: true });
    expect(screen.getByTestId('inline-loading-indicator')).toBeTruthy();
    expect(screen.getByText('Loading options')).toBeTruthy();
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Loading account');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Loading options');
    });
  });

  it('animates skeleton blocks, responds to reduced motion, and cleans subscriptions', async () => {
    const { rerender, unmount } = render(
      <SkeletonBlock width={80} height={20} borderRadius={4} testID="block" />,
    );
    expect(screen.getByTestId('block')).toBeTruthy();
    await waitFor(() => expect(start).toHaveBeenCalled());

    let reduceMotionListener: ((enabled: boolean) => void) | undefined;
    (AccessibilityInfo.addEventListener as jest.Mock<(...args: any[]) => any>).mockImplementationOnce((_, listener) => {
      reduceMotionListener = listener;
      return { remove };
    });
    rerender(<SkeletonBlock testID="reduced-block" />);
    act(() => reduceMotionListener?.(true));
    expect(screen.getByTestId('reduced-block')).toBeTruthy();
    unmount();
    expect(remove).toHaveBeenCalled();
  });

  it('continues safely when reduced-motion detection rejects', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock<(...args: any[]) => any>).mockRejectedValueOnce(new Error('unsupported'));
    render(<SkeletonBlock />);
    await waitFor(() => expect(start).toHaveBeenCalled());
  });

  it('honors skeleton list row and optional-column controls', () => {
    render(<SkeletonList rows={2} showAvatar={false} showTrailing={false} label="Loading two rows" />);
    expect(screen.getByTestId('skeleton-list').props.accessibilityState).toEqual({ busy: true });
    expect(screen.getAllByTestId('skeleton-block')).toHaveLength(4);
  });

  it('renders requested horizontal cards and specialized list row counts', () => {
    const horizontal = render(<HorizontalCardSkeleton items={2} />);
    expect(screen.getAllByTestId('skeleton-block')).toHaveLength(8);
    horizontal.unmount();

    const billers = render(<BillerListSkeleton rows={3} />);
    expect(screen.getAllByTestId('skeleton-block')).toHaveLength(6);
    billers.unmount();

    const methods = render(<PaymentMethodListSkeleton rows={2} />);
    expect(screen.getAllByTestId('skeleton-block')).toHaveLength(7);
    methods.unmount();

    render(<TransactionHistorySkeleton rows={2} />);
    expect(screen.getAllByTestId('skeleton-block')).toHaveLength(13);
  });

  it('renders profile and configurable payment information placeholders', () => {
    const profile = render(<ProfileSkeleton />);
    expect(screen.getByTestId('profile-skeleton')).toBeTruthy();
    expect(screen.getAllByTestId('skeleton-block')).toHaveLength(20);
    profile.unmount();

    render(
      <PaymentInfoSkeleton
        sections={1}
        rowsPerSection={2}
        includeNotice
        includeCheckbox
      />,
    );
    expect(screen.getByTestId('payment-info-skeleton')).toBeTruthy();
    expect(screen.getAllByTestId('skeleton-block')).toHaveLength(12);
  });

  it('renders composed receipt, bill-payment, and transaction-detail skeletons', () => {
    const receipt = render(<ReceiptSkeleton label="Receipt pending" />);
    expect(screen.getByTestId('receipt-skeleton')).toBeTruthy();
    expect(screen.getAllByLabelText('Receipt pending')).toHaveLength(2);
    receipt.unmount();

    const bill = render(<BillPaymentSkeleton />);
    expect(screen.getByTestId('bill-payment-skeleton')).toBeTruthy();
    expect(screen.getByTestId('payment-method-list-skeleton')).toBeTruthy();
    bill.unmount();

    render(<TransactionDetailSkeleton />);
    expect(screen.getByTestId('payment-info-skeleton')).toBeTruthy();
  });

  it('renders configurable form and detail placeholders', () => {
    const form = render(<FormSkeleton fields={2} />);
    expect(screen.getByTestId('form-skeleton')).toBeTruthy();
    expect(screen.getAllByTestId('skeleton-block')).toHaveLength(7);
    form.unmount();

    render(<DetailsSkeleton sections={2} rowsPerSection={2} />);
    expect(screen.getByTestId('details-skeleton')).toBeTruthy();
    expect(screen.getAllByTestId('skeleton-block')).toHaveLength(10);
  });

  it('groups placeholder blocks as one busy region for screen readers', () => {
    render(
      <SkeletonGroup label="Loading payment methods" testID="group">
        <SkeletonBlock testID="inside-block" />
      </SkeletonGroup>,
    );

    const group = screen.getByTestId('group');
    expect(group.props.accessibilityLabel).toBe('Loading payment methods');
    expect(group.props.accessibilityRole).toBe('progressbar');
    expect(group.props.accessibilityLiveRegion).toBe('polite');
    expect(group.props.accessibilityState).toEqual({ busy: true });
    expect(screen.getByTestId('inside-block')).toBeTruthy();
  });

  it.each([
    [-0.5, 0, '0%'],
    [0.456, 46, '45.6%'],
    [2, 100, '100%'],
  ])('clamps progress %s to %s percent', (progress, expectedNow, expectedWidth) => {
    const { getByLabelText, UNSAFE_getAllByType, unmount } = render(
      <NativeProgressBar progress={progress} label="Upload" />,
    );
    const progressBar = getByLabelText(`Upload: ${expectedNow}%`);
    expect(progressBar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: expectedNow });
    const views = UNSAFE_getAllByType(require('react-native').View);
    expect(views.some((view) => {
      const styles = Array.isArray(view.props.style) ? view.props.style : [view.props.style];
      return styles.some((style: any) => style?.width === expectedWidth);
    })).toBe(true);
    unmount();
  });
});
