import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { SlideUpScreenModal } from '../../../components/layout/SlideUpScreenModal';
import { renderWithProviders } from '../../../utils/test-utils';

// @gorhom/bottom-sheet is not handled by the global setup; mock it with a
// forwardRef view that exposes the imperative methods the component relays.
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const RN = require('react-native');
  const BottomSheet = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      expand: jest.fn(),
      collapse: jest.fn(),
      close: jest.fn(),
      snapToIndex: jest.fn(),
    }));
    return <RN.View testID="bottom-sheet">{props.children}</RN.View>;
  });
  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetBackdrop: (props: any) => <RN.View testID="backdrop" {...props} />,
    BottomSheetView: (props: any) => <RN.View>{props.children}</RN.View>,
  };
});

describe('SlideUpScreenModal', () => {
  // ---- Rendering ----

  it('renders its children', () => {
    renderWithProviders(
      <SlideUpScreenModal onClose={jest.fn()}>
        <Text>Sheet body</Text>
      </SlideUpScreenModal>,
    );
    expect(screen.getByText('Sheet body')).toBeTruthy();
  });

  it('renders the bottom sheet container', () => {
    renderWithProviders(
      <SlideUpScreenModal onClose={jest.fn()}>
        <Text>Sheet body</Text>
      </SlideUpScreenModal>,
    );
    expect(screen.getByTestId('bottom-sheet')).toBeTruthy();
  });

  // ---- Imperative ref ----

  it('forwards the bottom sheet instance through the ref', () => {
    const ref = React.createRef<any>();
    renderWithProviders(
      <SlideUpScreenModal ref={ref} onClose={jest.fn()}>
        <Text>Sheet body</Text>
      </SlideUpScreenModal>,
    );
    expect(ref.current).toBeTruthy();
    expect(typeof ref.current.close).toBe('function');
    expect(typeof ref.current.expand).toBe('function');
  });
});
