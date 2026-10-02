import { AppButton } from '@/components/common/AppButton';
import { PageState } from '@/components/common/PageState';
import { normaliseEnrollmentCallbackMessage, normaliseEnrollmentCallbackOutcome } from '@/utils/enrollmentCallback';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

const EnrollmentResultScreen = () => {
  const params = useLocalSearchParams<{ outcome?: string | string[]; message?: string | string[]; }>();
  const outcome = normaliseEnrollmentCallbackOutcome(params.outcome);
  const message = normaliseEnrollmentCallbackMessage(params.message, outcome);
  const title = outcome === 'success'
    ? 'Enrollment verification complete'
    : outcome === 'cancelled'
      ? 'Enrollment verification cancelled'
      : 'Enrollment verification failed';

  return (
    <PageState title={title} description={message}>
      <AppButton
        title={outcome === 'success' ? 'Back to Home' : 'Return to Enrollments'}
        variant="primary"
        onPress={() => router.replace(
          outcome === 'success' ? '/dashboard' : '/bills/enrollments',
        )}
      />
    </PageState>
  );
};

export default EnrollmentResultScreen;
