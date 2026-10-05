import { useCallback, useEffect, useRef, useState } from 'react';

const useResendCountdown = (initialCountdownSeconds: number = 30) => {
  const [countdown, setCountdown] = useState(initialCountdownSeconds);
  const [isActive, setIsActive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setCountdown(initialCountdownSeconds);
    setIsActive(true);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialCountdownSeconds]);

  useEffect(() => {
    startCountdown();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCountdown]);

  return { countdown, isActive, startCountdown };
};

export default useResendCountdown;