import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ModalContent from '../../../components/layout/ModalContent';
import { modalContentStyles } from '../../../styles/components/layout/ModalContent';
import { renderWithProviders } from '../../../utils/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const baseProps = {
  visible: true,
  title: 'Terms & Conditions',
  onClose: jest.fn(),
};

describe('ModalContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title when visible', () => {
    renderWithProviders(<ModalContent {...baseProps} />);
    const title = screen.getByText('Terms & Conditions');
    const titleStyle = StyleSheet.flatten(title.props.style);

    expect(title).toBeTruthy();
    expect(titleStyle).toMatchObject(StyleSheet.flatten(modalContentStyles.title));
  });

  it('renders nothing when not visible', () => {
    renderWithProviders(<ModalContent {...baseProps} visible={false} />);
    expect(screen.queryByText('Terms & Conditions')).toBeNull();
  });

  it('renders the description when provided', () => {
    renderWithProviders(
      <ModalContent {...baseProps} description="Please read carefully." />,
    );
    expect(screen.getByText('Please read carefully.')).toBeTruthy();
  });

  it('omits the description when not provided', () => {
    renderWithProviders(<ModalContent {...baseProps} />);
    expect(screen.queryByText('Please read carefully.')).toBeNull();
  });

  it('renders bullet items', () => {
    renderWithProviders(
      <ModalContent {...baseProps} bulletItems={['First point', 'Second point']} />,
    );
    expect(screen.getByText('First point')).toBeTruthy();
    expect(screen.getByText('Second point')).toBeTruthy();
  });

  it('renders numbered items with their numbering', () => {
    renderWithProviders(
      <ModalContent {...baseProps} numberedItems={['Step one', 'Step two']} />,
    );
    expect(screen.getByText('Step one')).toBeTruthy();
    expect(screen.getByText('Step two')).toBeTruthy();
    expect(screen.getByText('1.')).toBeTruthy();
    expect(screen.getByText('2.')).toBeTruthy();
  });

  it('renders children', () => {
    renderWithProviders(
      <ModalContent {...baseProps}>
        <Text>Extra content</Text>
      </ModalContent>,
    );
    expect(screen.getByText('Extra content')).toBeTruthy();
  });

  it('calls onClose when the Close button is pressed', () => {
    const onClose = jest.fn();
    renderWithProviders(<ModalContent {...baseProps} onClose={onClose} />);
    fireEvent.press(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
