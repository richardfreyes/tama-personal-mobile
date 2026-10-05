import { showModal } from "@/redux/features/modal/modalSlice";
import { store } from "@/redux/store";
import { Colors } from "@/styles/common/colors";
import { SettingRoute } from "@/types";
import { router } from "expo-router";
import type { Href } from 'expo-router';

export const handleSettingsRoute = (route: SettingRoute) => {
  if (!route) return;

  if(route === '#deactivationDeletion') {
    store.dispatch(showModal({
      iconType: 'warning',
      headerMessage: 'Account Deactivation or Deletion Request',
      bodyMessage: 'To permanently delete your account and associated data, please send an email to support@aqwire.co with the following details:\n\n• Full Name\n• Registered Email Address\n• Reason for Deletion (Optional)\n\nOur team will process your request within 7 business days.',
      buttonConfig: {
          primaryLabel: 'Send Email',
          primaryStyle: { backgroundColor: Colors.info10 },
          secondaryLabel: 'Cancel',
          direction: 'row',
        },
    }));
    return;
  }
  if (route.startsWith('/')) {
    router.push(route as Href);
    return;
  }
  router.push(`./${route}`);
};
