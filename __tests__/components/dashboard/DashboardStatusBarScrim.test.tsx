import DashboardStatusBarScrim from '@/components/dashboard/DashboardStatusBarScrim';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockInsets = (top: number) => (useSafeAreaInsets as jest.Mock).mockReturnValue({ top, right: 0, bottom: 0, left: 0 });

describe('DashboardStatusBarScrim', () => {
  afterEach(() => {
    mockInsets(0);
  });

  it('covers exactly the status bar area', () => {
    mockInsets(62);
    render(<DashboardStatusBarScrim />);
    const scrim = screen.getByTestId('dashboard-status-bar-scrim');
    expect(StyleSheet.flatten(scrim.props.style).height).toBe(62);
    expect(scrim.props.pointerEvents).toBe('none');
  });

  it('renders nothing when there is no top inset', () => {
    mockInsets(0);
    render(<DashboardStatusBarScrim />);
    expect(screen.queryByTestId('dashboard-status-bar-scrim')).toBeNull();
  });
});
