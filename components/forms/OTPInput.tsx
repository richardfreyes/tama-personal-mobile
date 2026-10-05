import { COMMON } from '@/constants/common';
import { Colors } from '@/styles/common/colors';
import { inputFocusColor } from '@/styles/common/globals';
import { OTPInputStyles as styles } from '@/styles/components/forms/OTPInput';
import { OTPInputProps } from '@/types';
import React, { useRef, useState } from 'react';
import { Keyboard, TextInput, TextInputKeyPressEvent, View } from 'react-native';
import { HelperText } from 'react-native-paper';

const OTPInput: React.FC<OTPInputProps> = ({ 
  length = COMMON.VALIDATORS.DEFAULT_OTP_LENGTH, 
  onCodeChange, 
  containerStyle, 
  inputStyle,
  error,
  onClearError
}) => {
  const [otpCode, setOtpCode] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleTextChange = (text: string, index: number) => {
    if (error && onClearError) {
      onClearError();
    }

    const numericText = text.replace(/[^0-9]/g, '');
    const newOtpCode = [...otpCode];
    if (numericText.length > 1) {
      numericText.slice(0, length - index).split('').forEach((digit, offset) => {
        newOtpCode[index + offset] = digit;
      });
    } else {
      newOtpCode[index] = numericText;
    }
    setOtpCode(newOtpCode);
    const fullCode = newOtpCode.join('');
    onCodeChange(fullCode);

    if (numericText !== '' && index + numericText.length < length) {
      inputRefs.current[index + numericText.length]?.focus();
    }

    if (fullCode.length === length) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = ( e: TextInputKeyPressEvent, index: number ) => {
    if ((e.nativeEvent as any).key === 'Backspace' && otpCode[index] === '' && index > 0) {
      const newOtpCode = [...otpCode];
      newOtpCode[index - 1] = '';
      setOtpCode(newOtpCode);
      onCodeChange(newOtpCode.join(''));
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View>
      <View style={[styles.inputVerifyContainer, containerStyle]}>
        { Array.from({ length }, (_, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[
              styles.inputVerify, 
              inputStyle,
              error ? { borderColor: Colors.error10 } : {}
            ]}
            cursorColor={inputFocusColor}
            selectionColor={inputFocusColor}
            keyboardType="number-pad"
            maxLength={index === 0 ? length : 1}
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            autoComplete={index === 0 ? 'sms-otp' : 'off'}
            value={otpCode[index]}
            onChangeText={(text) => handleTextChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => {
              if (otpCode[index] !== '') {
                const newOtpCode = [...otpCode];
                newOtpCode[index] = '';
                setOtpCode(newOtpCode);
                onCodeChange(newOtpCode.join(''));
              }
            }}
          />
        ))}
      </View>
      <HelperText type="error" visible={!!error}  style={ styles.helperText }>
        {error || 'Incorrect OTP. Please try again.'}
      </HelperText>
    </View>
  );
};

export default OTPInput;
