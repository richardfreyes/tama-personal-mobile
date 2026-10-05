import { renderWithProviders } from '@/utils/test-utils';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import InfoFieldComponent from '../../../components/common/InfoFieldComponent';

const mockSetStringAsync = jest.fn<(content: string) => Promise<void>>();
jest.mock('expo-clipboard', () => ({
  setStringAsync: (content: string) => mockSetStringAsync(content),
}));

const mockDispatch = jest.fn();
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

describe('InfoFieldComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders label and value', () => {
    renderWithProviders(<InfoFieldComponent label="Name" value="John" />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('John')).toBeTruthy();
  });

  it('renders "---" when value is undefined', () => {
    renderWithProviders(<InfoFieldComponent label="Name" />);
    expect(screen.getByText('---')).toBeTruthy();
  });

  it('renders "---" when value is null', () => {
    renderWithProviders(<InfoFieldComponent label="Name" value={null} />);
    expect(screen.getByText('---')).toBeTruthy();
  });

  it('renders "---" when value is empty string', () => {
    renderWithProviders(<InfoFieldComponent label="Name" value="" />);
    expect(screen.getByText('---')).toBeTruthy();
  });

  it('applies custom containerStyle', () => {
    const customStyle = { backgroundColor: 'red', padding: 10 };
    const { toJSON } = renderWithProviders(
      <InfoFieldComponent label="Name" value="John" containerStyle={customStyle} />,
    );
    const tree = toJSON() as any;
    const flatStyle = StyleSheet.flatten(tree.props.style);
    expect(flatStyle).toEqual(expect.objectContaining({ backgroundColor: 'red', padding: 10 }));
  });

  it('applies custom labelStyle', () => {
    const customStyle = { color: 'blue', fontSize: 18 };
    renderWithProviders(
      <InfoFieldComponent label="Name" value="John" labelStyle={customStyle} />,
    );
    const labelElement = screen.getByText('Name');
    const flatStyle = StyleSheet.flatten(labelElement.props.style);
    expect(flatStyle).toEqual(expect.objectContaining({ color: 'blue', fontSize: 18 }));
  });

  it('applies custom valueStyle', () => {
    const customStyle = { color: 'green', fontSize: 20 };
    renderWithProviders(
      <InfoFieldComponent label="Name" value="John" valueStyle={customStyle} />,
    );
    const valueElement = screen.getByText('John');
    const flatStyle = StyleSheet.flatten(valueElement.props.style);
    expect(flatStyle).toEqual(expect.objectContaining({ color: 'green', fontSize: 20 }));
  });

  it('does not show copy icon when copy is false', () => {
    const { toJSON } = renderWithProviders(
      <InfoFieldComponent label="Name" value="John" copy={false} />,
    );
    const json = JSON.stringify(toJSON());
    expect(json).not.toContain('content-copy');
  });

  it('does not show copy icon when copy is true but value is falsy', () => {
    const { toJSON } = renderWithProviders(
      <InfoFieldComponent label="Name" value="" copy={true} />,
    );
    const json = JSON.stringify(toJSON());
    expect(json).not.toContain('content-copy');
  });

  it('shows copy icon when copy is true and value is present', () => {
    renderWithProviders(
      <InfoFieldComponent label="Name" value="John" copy={true} />,
    );
    const copyButton = screen.getByRole('button');
    expect(copyButton).toBeTruthy();
  });

  it('copies value to clipboard and dispatches snackbar on press', async () => {
    mockSetStringAsync.mockResolvedValue(undefined);
    renderWithProviders(
      <InfoFieldComponent label="Name" value="John" copy={true} />,
    );

    const copyButton = screen.getByRole('button');
    fireEvent.press(copyButton);

    await waitFor(() => {
      expect(mockSetStringAsync).toHaveBeenCalledWith('John');
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { message: 'Value copied to clipboard.', variant: 'success' },
        }),
      );
    });
  });

  it('does not copy when value is falsy', async () => {
    renderWithProviders(
      <InfoFieldComponent label="Name" value="" copy={true} />,
    );

    expect(mockSetStringAsync).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('passes default weight of "400" to value AppText', () => {
    renderWithProviders(<InfoFieldComponent label="Name" value="John" />);
    const valueElement = screen.getByText('John');
    expect(valueElement).toBeTruthy();
  });

  describe('summary variant', () => {
    it('shows a custom placeholder in a quieter style when there is no value', () => {
      renderWithProviders(<InfoFieldComponent label="Client Notes" value="" variant="summary" emptyText="Not provided" />);

      const placeholder = screen.getByText('Not provided');
      expect(StyleSheet.flatten(placeholder.props.style)).toEqual(expect.objectContaining({
        color: '#A49897',
        fontSize: 14,
      }));
      expect(screen.queryByText('---')).toBeNull();
    });

    it('shows the value at 14pt, medium weight, and the label at 13pt', () => {
      renderWithProviders(<InfoFieldComponent label="Payment Name" value="HDMF Refiling Fee" variant="summary" />);

      expect(StyleSheet.flatten(screen.getByText('HDMF Refiling Fee').props.style)).toEqual(expect.objectContaining({
        fontFamily: 'PoppinsMedium',
        fontSize: 14,
      }));
      expect(StyleSheet.flatten(screen.getByText('Payment Name').props.style)).toEqual(expect.objectContaining({
        flexShrink: 0,
        fontSize: 13,
      }));
    });

    it('keeps the dashes for the default variant', () => {
      renderWithProviders(<InfoFieldComponent label="Name" value="" emptyText="Not provided" />);
      expect(screen.getByText('Not provided')).toBeTruthy();
      renderWithProviders(<InfoFieldComponent label="Other" value="" />);
      expect(screen.getByText('---')).toBeTruthy();
    });
  });
});
