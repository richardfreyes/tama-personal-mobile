import { describe, expect, it, jest } from '@jest/globals';
import { act, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { SlideUpScreenModal } from '../../../components/layout/SlideUpScreenModal';
import { renderWithProviders } from '../../../utils/test-utils';

const renderSheet = (ref?: React.Ref<any>, onClose = jest.fn()) => renderWithProviders(
  <SlideUpScreenModal ref={ref} onClose={onClose}>
    <Text>Sheet body</Text>
  </SlideUpScreenModal>,
);

describe('SlideUpScreenModal', () => {
  it('stays hidden until it is opened', () => {
    renderSheet();
    expect(screen.queryByText('Sheet body')).toBeNull();
  });

  it('shows its children after snapToIndex', () => {
    const ref = React.createRef<any>();
    renderSheet(ref);
    act(() => ref.current.snapToIndex(2));
    expect(screen.getByText('Sheet body')).toBeTruthy();
  });

  it('exposes the sheet methods through the ref', () => {
    const ref = React.createRef<any>();
    renderSheet(ref);
    ['snapToIndex', 'expand', 'collapse', 'close'].forEach((method) => {
      expect(typeof ref.current[method]).toBe('function');
    });
  });

  it('ignores close while hidden', () => {
    const ref = React.createRef<any>();
    const onClose = jest.fn();
    renderSheet(ref, onClose);
    act(() => ref.current.close());
    expect(onClose).not.toHaveBeenCalled();
  });
});
