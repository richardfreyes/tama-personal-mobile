import modalReducer from '@/redux/features/modal/modalSlice';
import { ModalButtonConfig } from '@/redux/features/modal/modalTypes';
import { modalActions } from '@/utils/modalActions';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Linking, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import ModalComponent from '../../../components/layout/ModalComponent';
import { Colors } from '../../../styles/common/colors';

jest.spyOn(Linking, 'openURL').mockImplementation(jest.fn<typeof Linking.openURL>());

const mockEmail = 'test@example.com';
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ email: mockEmail }),
}));

const buildStore = (modalState: Record<string, any>) =>
  configureStore({
    reducer: { modal: modalReducer },
    preloadedState: { modal: modalState as any },
  });

const renderModal = (modalState: Record<string, any>) => {
  const store = buildStore(modalState);
  return { store, ...render(<Provider store={store}><ModalComponent /></Provider>) };
};

const visibleState = (overrides: Record<string, any> = {}) => ({
  isVisible: true,
  iconType: 'info',
  headerMessage: 'Test Header',
  bodyMessage: 'Test body message',
  bodyType: undefined,
  buttonConfig: undefined,
  id: undefined,
  ...overrides,
});

describe('ModalComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
    Object.keys(modalActions).forEach((k) => delete modalActions[k]);
  });

  it('returns null when isVisible is false', () => {
    const { toJSON } = renderModal({ ...visibleState(), isVisible: false });
    expect(toJSON()).toBeNull();
  });

  it('renders when isVisible is true', () => {
    renderModal(visibleState());
    expect(screen.getByText('Test Header')).toBeTruthy();
    expect(screen.getByText('Test body message')).toBeTruthy();
  });

  it('keeps a non-dismissible modal open when the backdrop is pressed', () => {
    const { store } = renderModal(visibleState({
      dismissible: false,
      buttonConfig: { primaryLabel: 'OK' },
    }));

    fireEvent(screen.getByTestId('modal-backdrop'), 'pressOut');

    expect(store.getState().modal.isVisible).toBe(true);
  });

  it('renders header message', () => {
    renderModal(visibleState({ headerMessage: 'Important' }));
    expect(screen.getByText('Important')).toBeTruthy();
  });

  it('renders body message for default bodyType', () => {
    renderModal(visibleState({ bodyMessage: 'Something happened' }));
    expect(screen.getByText('Something happened')).toBeTruthy();
  });

  it('renders account deletion body when bodyType is accountDeletion', () => {
    renderModal(visibleState({ bodyType: 'accountDeletion' }));
    expect(screen.getByText(/permanently delete your account/)).toBeTruthy();
    expect(screen.getByText('support@aqwire.co')).toBeTruthy();
  });

  it('renders primary button in column layout', () => {
    const buttonConfig: ModalButtonConfig = { primaryLabel: 'OK' };
    renderModal(visibleState({ buttonConfig }));
    expect(screen.getByText('OK')).toBeTruthy();
  });

  it('renders primary and secondary buttons in column layout', () => {
    const buttonConfig: ModalButtonConfig = {
      direction: 'column',
      primaryLabel: 'Confirm',
      secondaryLabel: 'Cancel',
    };
    renderModal(visibleState({ buttonConfig }));
    expect(screen.getByText('Confirm')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('renders primary and secondary buttons in row layout', () => {
    const buttonConfig: ModalButtonConfig = {
      direction: 'row',
      primaryLabel: 'Yes',
      secondaryLabel: 'No',
    };
    renderModal(visibleState({ buttonConfig }));
    expect(screen.getByText('Yes')).toBeTruthy();
    expect(screen.getByText('No')).toBeTruthy();
  });

  it('renders only primary button in row layout when no secondary', () => {
    const buttonConfig: ModalButtonConfig = {
      direction: 'row',
      primaryLabel: 'OK',
    };
    renderModal(visibleState({ buttonConfig }));
    expect(screen.getByText('OK')).toBeTruthy();
  });

  it('does not render buttons when buttonConfig is undefined', () => {
    renderModal(visibleState());
    expect(screen.queryByText('OK')).toBeNull();
    expect(screen.queryByText('Cancel')).toBeNull();
  });

  it('dispatches hideModal when primary button is pressed', () => {
    const buttonConfig: ModalButtonConfig = { primaryLabel: 'Got it' };
    const { store } = renderModal(visibleState({ buttonConfig }));
    fireEvent.press(screen.getByText('Got it'));
    expect(store.getState().modal.isVisible).toBe(false);
  });

  it('dispatches hideModal when secondary button is pressed', () => {
    const buttonConfig: ModalButtonConfig = {
      direction: 'column',
      primaryLabel: 'Confirm',
      secondaryLabel: 'Cancel',
    };
    const { store } = renderModal(visibleState({ buttonConfig }));
    fireEvent.press(screen.getByText('Cancel'));
    expect(store.getState().modal.isVisible).toBe(false);
  });

  it('calls and removes modal action on primary press when id matches', () => {
    const actionFn = jest.fn();
    modalActions['test-action'] = actionFn;
    const buttonConfig: ModalButtonConfig = { primaryLabel: 'Proceed' };
    renderModal(visibleState({ buttonConfig, id: 'test-action' }));
    fireEvent.press(screen.getByText('Proceed'));
    expect(actionFn).toHaveBeenCalledTimes(1);
    expect(modalActions['test-action']).toBeUndefined();
  });

  it('does not call modal action when id does not match', () => {
    const actionFn = jest.fn();
    modalActions['other-action'] = actionFn;
    const buttonConfig: ModalButtonConfig = { primaryLabel: 'Proceed' };
    renderModal(visibleState({ buttonConfig, id: 'nonexistent' }));
    fireEvent.press(screen.getByText('Proceed'));
    expect(actionFn).not.toHaveBeenCalled();
  });

  it('opens mailto link on primary press for accountDeletion bodyType', () => {
    const buttonConfig: ModalButtonConfig = { primaryLabel: 'Send Email' };
    renderModal(visibleState({ bodyType: 'accountDeletion', buttonConfig }));
    fireEvent.press(screen.getByText('Send Email'));
    expect(Linking.openURL).toHaveBeenCalledWith(
      `mailto:support@aqwire.co?subject=[ACCOUNT DEACTIVATION OR DELETION REQUEST] - ${mockEmail}`,
    );
  });

  it('does not open mailto for non-accountDeletion bodyType', () => {
    const buttonConfig: ModalButtonConfig = { primaryLabel: 'OK' };
    renderModal(visibleState({ bodyType: undefined, buttonConfig }));
    fireEvent.press(screen.getByText('OK'));
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  describe('confirm variant', () => {
    const confirmState = (overrides: Record<string, any> = {}) => visibleState({
      variant: 'confirm',
      iconType: 'delete',
      headerMessage: 'Remove Filinvest Land?',
      bodyMessage: 'It will no longer appear in Saved billers. Your payment history stays.',
      buttonConfig: { primaryLabel: 'Remove Biller', secondaryLabel: 'Cancel', direction: 'column' },
      id: 'deleteBiller',
      ...overrides,
    });

    it('shows the title and message with both actions stacked under them', () => {
      renderModal(confirmState());

      expect(screen.getByText('Remove Filinvest Land?')).toBeTruthy();
      expect(screen.getByText('It will no longer appear in Saved billers. Your payment history stays.')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Remove Biller' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
    });

    it('draws a 24pt-radius card over the dark scrim', () => {
      renderModal(confirmState());

      expect(StyleSheet.flatten(screen.getByTestId('modal-backdrop').props.style)).toEqual(
        expect.objectContaining({ backgroundColor: Colors.modalScrim, padding: 24 }),
      );
    });

    it('runs the registered action and closes when the primary action is pressed', () => {
      const remove = jest.fn();
      modalActions.deleteBiller = remove;
      const { store } = renderModal(confirmState());

      fireEvent.press(screen.getByRole('button', { name: 'Remove Biller' }));

      expect(remove).toHaveBeenCalledTimes(1);
      expect(store.getState().modal.isVisible).toBe(false);
    });

    it('closes without running the action on Cancel', () => {
      const remove = jest.fn();
      modalActions.deleteBiller = remove;
      const { store } = renderModal(confirmState());

      fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

      expect(remove).not.toHaveBeenCalled();
      expect(store.getState().modal.isVisible).toBe(false);
    });

    it('cancels when the scrim is tapped', () => {
      const remove = jest.fn();
      modalActions.deleteBiller = remove;
      const { store } = renderModal(confirmState());

      fireEvent(screen.getByTestId('modal-backdrop'), 'pressOut');

      expect(remove).not.toHaveBeenCalled();
      expect(store.getState().modal.isVisible).toBe(false);
    });

    it('stays open when the scrim is tapped on a dialog that is not dismissible', () => {
      const { store } = renderModal(confirmState({ dismissible: false }));

      fireEvent(screen.getByTestId('modal-backdrop'), 'pressOut');

      expect(store.getState().modal.isVisible).toBe(true);
    });

    it('works without a secondary action or an icon', () => {
      renderModal(confirmState({ iconType: null, buttonConfig: { primaryLabel: 'Got it' } }));

      expect(screen.getByRole('button', { name: 'Got it' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    });

    it('keeps the default layout when no variant is set', () => {
      renderModal(visibleState({ buttonConfig: { primaryLabel: 'OK' } }));
      expect(StyleSheet.flatten(screen.getByTestId('modal-backdrop').props.style).backgroundColor).toBe('rgba(0, 0, 0, 0.4)');
    });
  });
});
