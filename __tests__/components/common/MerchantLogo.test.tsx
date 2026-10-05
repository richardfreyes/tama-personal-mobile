import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import MerchantLogo from '../../../components/common/MerchantLogo';

describe('MerchantLogo', () => {
  it('shows the merchant logo, hidden from screen readers, when there is one', () => {
    render(<MerchantLogo initials="EC" logoUrl="https://example.com/electric.png" />);

    const logo = screen.UNSAFE_getByType(Image);
    expect(logo.props.source).toEqual({ uri: 'https://example.com/electric.png' });
    expect(logo.props.accessible).toBe(false);
    expect(screen.queryByText('EC')).toBeNull();
  });

  it('falls back to the initials without a logo', () => {
    const { rerender } = render(<MerchantLogo initials="EC" />);
    expect(screen.getByText('EC')).toBeTruthy();
    expect(screen.UNSAFE_queryByType(Image)).toBeNull();

    rerender(<MerchantLogo initials="EC" logoUrl={null} />);
    expect(screen.getByText('EC')).toBeTruthy();
  });

  describe('circle', () => {
    it('is a round avatar of the given size with the initials inside', () => {
      render(<MerchantLogo initials="AB" variant="circle" size={40} />);

      expect(screen.getByText('AB')).toBeTruthy();
      expect(screen.queryByTestId('merchant-logo-ring')).toBeNull();
      const circle = StyleSheet.flatten(screen.getByTestId('merchant-logo-circle').props.style);
      expect(circle).toEqual(expect.objectContaining({ borderRadius: 20, height: 40, width: 40 }));
    });

    it('fits a logo inside the circle, hidden from screen readers', () => {
      render(<MerchantLogo initials="AB" logoUrl="https://example.com/avida.png" variant="circle" size={40} />);

      const logo = screen.UNSAFE_getByType(Image);
      expect(logo.props.source).toEqual({ uri: 'https://example.com/avida.png' });
      expect(logo.props.accessible).toBe(false);
      expect(StyleSheet.flatten(logo.props.style)).toEqual({ height: 28, width: 28 });
      expect(screen.queryByText('AB')).toBeNull();
    });
  });

  describe('ring', () => {
    it('wraps the avatar in the brand ring, with the avatar 8pt smaller than the ring', () => {
      render(<MerchantLogo initials="FL" variant="ring" size={40} />);

      const ring = screen.getByTestId('merchant-logo-ring');
      expect(StyleSheet.flatten(ring.props.style)).toEqual(expect.objectContaining({ borderRadius: 20, height: 40, width: 40 }));
      const avatar = StyleSheet.flatten(screen.getByTestId('merchant-logo-circle').props.style);
      expect(avatar).toEqual(expect.objectContaining({ height: 32, width: 32 }));
    });

    it('makes the initials larger on a large avatar', () => {
      const { rerender } = render(<MerchantLogo initials="FL" variant="ring" size={40} />);
      expect(StyleSheet.flatten(screen.getByText('FL').props.style).fontSize).toBe(12);

      rerender(<MerchantLogo initials="FL" variant="ring" size={56} />);
      expect(StyleSheet.flatten(screen.getByText('FL').props.style).fontSize).toBe(15);
    });

    it('shows a logo inside the ring', () => {
      render(<MerchantLogo initials="FL" logoUrl="https://example.com/fli.png" variant="ring" size={56} />);

      expect(screen.getByTestId('merchant-logo-ring')).toBeTruthy();
      expect(StyleSheet.flatten(screen.UNSAFE_getByType(Image).props.style)).toEqual({ height: 34, width: 34 });
    });
  });
});
