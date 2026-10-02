import { AppButton } from '@/components/common/AppButton';
import { PageState } from '@/components/common/PageState';
import { router } from 'expo-router';
import React from 'react';

const SuccessScreen = () => {
  const [isLoading, setIsLoading] = React.useState(Boolean(false));

  const handleSubmit = () => {
    setIsLoading(true);
    router.replace('/login');
  }
  
  return (
    <PageState title="Password successfully changed" description="Your password has been successfully updated. You can now log in to your account securely using your new password.">
      <AppButton title="Back to Login" variant="primary" onPress={handleSubmit} isLoading={isLoading} disabled={isLoading}/>
    </PageState>
  );
};

export default SuccessScreen;