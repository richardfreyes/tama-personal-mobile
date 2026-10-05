import useResendCountdown from '@/hooks/useResendCountdown';
import { resendCodeTimerStyles as styles } from '@/styles/components/common/ResendCodeTimer';
import { ResendCodeTimerProps } from '@/types/common';
import React from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';

const ResendCodeTimer: React.FC<ResendCodeTimerProps> = ({initialTime = 30, onResend, containerStyle}) => {
  const { countdown, isActive, startCountdown } = useResendCountdown(initialTime);

  const formatCountdown = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
  };

  const handleResend = () => {
    onResend();
    startCountdown();
  };

  return (
    <View style={containerStyle}>
      {isActive ? (
        <AppText style={styles.waitingMessage}>
          Please wait {formatCountdown(countdown)} before requesting for a new code.
        </AppText>
      ) : (
        <AppText style={styles.resendLink}>
          <AppText>{"Didn't receive the code? "}</AppText>
          <AppText onPress={handleResend} style={styles.resendText}>Resend Code</AppText>
        </AppText>
      )}
    </View>
  );
};

export default ResendCodeTimer;
