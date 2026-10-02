import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { router } from 'expo-router';

jest.mock('@/redux/store', () => ({
  store: { dispatch: jest.fn<(...args: any[]) => any>() },
}));

import { handleSettingsRoute } from '@/services/navigation';
import { store } from '@/redux/store';

const mockDispatch = store.dispatch as jest.Mock<(...args: any[]) => any>;

describe('handleSettingsRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ignores empty routes', () => {
    handleSettingsRoute(undefined as any);
    expect(router.push).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('opens an account deletion guidance modal', () => {
    handleSettingsRoute('#deactivationDeletion');
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'modal/showModal',
      payload: expect.objectContaining({
        iconType: 'warning',
        headerMessage: 'Account Deactivation or Deletion Request',
        bodyMessage: expect.stringContaining('support@aqwire.co'),
        buttonConfig: expect.objectContaining({
          primaryLabel: 'Send Email',
          secondaryLabel: 'Cancel',
        }),
      }),
    }));
    expect(router.push).not.toHaveBeenCalled();
  });

  it('pushes absolute routes unchanged and makes relative routes local', () => {
    handleSettingsRoute('/settings/profile' as any);
    expect(router.push).toHaveBeenCalledWith('/settings/profile');
    handleSettingsRoute('privacy' as any);
    expect(router.push).toHaveBeenCalledWith('./privacy');
  });
});
