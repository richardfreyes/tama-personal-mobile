import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import PaymentMethodCardComponent from '../../../components/payments/PaymentMethodCardComponent';
import { renderWithProviders } from '../../../utils/test-utils';

const SmallLogo = (props: any) => <View testID="small-logo" {...props} />;
const MainLogo = (props: any) => <View testID="main-logo" {...props} />;

const optionWithLogos = {
  title: 'Cards',
  logos: [
    { id: 'visa', uri: SmallLogo },
    { id: 'mc', uri: SmallLogo },
  ],
};

describe('PaymentMethodCardComponent', () => {

  it('renders the option title', () => {
    renderWithProviders(
      <PaymentMethodCardComponent
        option={optionWithLogos as any}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText('Cards')).toBeTruthy();
  });

  it('renders the list of small logos when logos are provided', () => {
    renderWithProviders(
      <PaymentMethodCardComponent
        option={optionWithLogos as any}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getAllByTestId('small-logo').length).toBe(2);
  });

  it('uses custom spacing between logos without adding trailing space', () => {
    renderWithProviders(
      <PaymentMethodCardComponent
        option={{ ...optionWithLogos, logoSpacing: 16 } as any}
        onPress={jest.fn()}
      />,
    );

    const firstContainerStyle = StyleSheet.flatten(
      screen.getByTestId('payment-logo-visa').props.style,
    );
    const lastContainerStyle = StyleSheet.flatten(
      screen.getByTestId('payment-logo-mc').props.style,
    );

    expect(firstContainerStyle.marginRight).toBe(16);
    expect(lastContainerStyle.marginRight).toBeUndefined();
  });

  it('renders the single main logo when mainLogoUri is provided', () => {
    renderWithProviders(
      <PaymentMethodCardComponent
        option={{ title: 'GCash', logos: [], mainLogoUri: { uri: MainLogo } } as any}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('main-logo')).toBeTruthy();
  });

  it('renders neither logo set when there are no logos', () => {
    renderWithProviders(
      <PaymentMethodCardComponent
        option={{ title: 'Empty', logos: [] } as any}
        onPress={jest.fn()}
      />,
    );
    expect(screen.queryByTestId('small-logo')).toBeNull();
    expect(screen.queryByTestId('main-logo')).toBeNull();
    expect(screen.getByText('Empty')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    renderWithProviders(
      <PaymentMethodCardComponent option={optionWithLogos as any} onPress={onPress} />,
    );
    fireEvent.press(screen.getByText('Cards'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
