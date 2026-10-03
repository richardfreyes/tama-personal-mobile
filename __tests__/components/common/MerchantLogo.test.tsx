import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';
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
});
