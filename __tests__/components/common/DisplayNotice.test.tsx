import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import React from 'react';
import DisplayNotice from '../../../components/common/DisplayNotice';
import { renderWithProviders } from '../../../utils/test-utils';

describe('DisplayNotice', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Title rendering ----

  it('renders title text when title prop is provided', () => {
    renderWithProviders(<DisplayNotice title="Important Notice" />);
    expect(screen.getByText('Important Notice')).toBeTruthy();
  });

  it('does not render title when title prop is undefined', () => {
    renderWithProviders(<DisplayNotice description="Some description" />);
    expect(screen.queryByText('Important Notice')).toBeNull();
  });

  // ---- Description rendering ----

  it('renders description alongside title when both are provided', () => {
    renderWithProviders(
      <DisplayNotice title="Warning" description="Please review your details" />,
    );
    expect(screen.getByText('Warning Please review your details')).toBeTruthy();
    expect(screen.getByText('Please review your details')).toBeTruthy();
  });

  it('renders title without description when only title is provided', () => {
    renderWithProviders(<DisplayNotice title="Title Only" />);
    expect(screen.getByText('Title Only')).toBeTruthy();
  });

  it('does not render description when title is absent', () => {
    renderWithProviders(<DisplayNotice description="Orphaned description" />);
    expect(screen.queryByText('Orphaned description')).toBeNull();
  });

  // ---- Icon rendering ----

  it('renders icon container when Icon prop is truthy', () => {
    const { toJSON } = renderWithProviders(
      <DisplayNotice title="Notice" Icon="info" />,
    );
    const tree = toJSON() as any;
    // With Icon: root container has 2 children (icon container + text container)
    expect(tree.children.length).toBe(2);
  });

  it('does not render icon container when Icon prop is omitted', () => {
    const { toJSON } = renderWithProviders(
      <DisplayNotice title="Notice" />,
    );
    const tree = toJSON() as any;
    // Without Icon: root container has 1 child (text container only)
    expect(tree.children.length).toBe(1);
  });

  it('renders icon container even when title and description are absent', () => {
    const { toJSON } = renderWithProviders(<DisplayNotice Icon="info" />);
    const tree = toJSON() as any;
    // icon container + empty text container
    expect(tree.children.length).toBe(2);
  });

  // ---- Edge cases ----

  it('renders container without crashing when no props are provided', () => {
    const { toJSON } = renderWithProviders(<DisplayNotice />);
    const tree = toJSON() as any;
    expect(tree).toBeTruthy();
    // Only the text container (empty) is present
    expect(tree.children.length).toBe(1);
  });

  it('renders correctly with all props provided', () => {
    const { toJSON } = renderWithProviders(
      <DisplayNotice
        title="Attention"
        description="Check your information"
        Icon="warning"
      />,
    );
    const tree = toJSON() as any;
    expect(tree.children.length).toBe(2);
    expect(screen.getByText('Attention Check your information')).toBeTruthy();
    expect(screen.getByText('Check your information')).toBeTruthy();
  });
});
