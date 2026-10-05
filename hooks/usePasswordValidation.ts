import { COMMON } from '@/constants/common';
import { PasswordRuleProps } from '@/types';
import { useMemo } from 'react';

const usePasswordValidation = (password: string): PasswordRuleProps[] => {
  const passwordValidationRules = useMemo(() => {
    const isLengthValid = password.length >= COMMON.VALIDATORS.PASSWORD_MIN_LENGTH;
    const hasMixedCase = COMMON.VALIDATORS.REGEX.MIXED_CASE.test(password);
    const hasSpecialChar = COMMON.VALIDATORS.REGEX.SPECIAL_CHAR.test(password);
    const hasNumber = COMMON.VALIDATORS.REGEX.HAS_NUMBER.test(password);
    const hasLetter = COMMON.VALIDATORS.REGEX.HAS_LETTER.test(password);
    const hasLettersAndNumbers = hasNumber && hasLetter;
    const rules = COMMON.PASSWORD_RULE_TEXTS || [];

    return [
      { 
        text: rules[0] || 'Must be 12 characters-the more characters, the better.', 
        valid: isLengthValid 
      },
      { 
        text: rules[1] || 'Must be a mixture of both uppercase and lowercase letters.', 
        valid: hasMixedCase 
      },
      {
        text: rules[2] || 'Must be a mixture of letters and numbers', 
        valid: hasLettersAndNumbers
      },
      { 
        text: rules[3] || 'Must include at least one special character, e.g., ! @ # ? ]', 
        valid: hasSpecialChar 
      },
    ].filter(rule => rule.text);

  }, [password]);

  return passwordValidationRules;
};

export default usePasswordValidation;