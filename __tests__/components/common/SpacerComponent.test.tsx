import { describe, expect, it } from '@jest/globals';
import React from 'react';
import { SpacerComponent } from '../../../components/common/SpacerComponent';
import { renderWithProviders } from '../../../utils/test-utils';

describe('SpacerComponent', () => {
  it('renders a view with the provided height and width', () => {
    const { toJSON } = renderWithProviders(
      <SpacerComponent height={24} width={16} />,
    );
    const tree = toJSON() as any;
    expect(tree.props.style).toEqual({ height: 24, width: 16 });
  });

  it('defaults height and width to 0 when no props are given', () => {
    const { toJSON } = renderWithProviders(<SpacerComponent />);
    const tree = toJSON() as any;
    expect(tree.props.style).toEqual({ height: 0, width: 0 });
  });

  it('applies only height when width is omitted', () => {
    const { toJSON } = renderWithProviders(<SpacerComponent height={12} />);
    const tree = toJSON() as any;
    expect(tree.props.style).toEqual({ height: 12, width: 0 });
  });

  it('renders a single host element', () => {
    const { toJSON } = renderWithProviders(<SpacerComponent height={8} />);
    const tree = toJSON() as any;
    expect(Array.isArray(tree)).toBe(false);
    expect(tree.children).toBeNull();
  });
});
