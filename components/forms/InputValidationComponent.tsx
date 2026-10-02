import { Colors } from "@/styles/common/colors";
import { globalStyle, inputFocusColor } from "@/styles/common/globals";
import { InputValidationProps } from "@/types";
import { formatCurrencyInput, getCurrencyInputSelection, normalizeCurrencyInput } from "@/utils/format";
import React, { memo, useLayoutEffect, useRef, useState } from "react";
import { KeyboardTypeOptions, NativeSyntheticEvent, TextInputSelectionChangeEventData, View } from "react-native";
import { HelperText, TextInput as PaperTextInput, useTheme } from "react-native-paper";

const InputValidationComponent = ({
  field,
  value,
  setValue,
  label,
  placeholder,
  errors,
  setErrors,
  touched,
  setTouched,
  validateField,
  autoCapitalize = "none",
  keyboardType = "default",
  secureTextEntry = false,
  maxLength,
  mode = "outlined",
  multiline = false,
  editable = true,
  style,
  extra,
  maskOnBlur = false,
  formatAsCurrency = false,
  rightIcon,
  left,
}: InputValidationProps) => {
  const theme = useTheme();
  const hasError = touched[field] && errors[field];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectionOverride, setSelectionOverride] = useState<{ start: number; end: number } | undefined>();
  const previousCurrencyDisplayRef = useRef('');
  const selectionRef = useRef<{ start: number; end: number } | undefined>(undefined);
  const pendingSelectionRef = useRef<{ start: number; end: number } | undefined>(undefined);
  const lastKeyRef = useRef<string | undefined>(undefined);

  const finalSecureTextEntry = secureTextEntry && !isPasswordVisible;

  const handleValidation = (text: string) => {
    const nextValue = formatAsCurrency ? normalizeCurrencyInput(text) : text;

    if (formatAsCurrency) {
      const formattedValue = formatCurrencyInput(nextValue);
      const nextSelection = getCurrencyInputSelection({
        formattedValue,
        nextText: text,
        previousFormattedValue: previousCurrencyDisplayRef.current,
        previousSelection: selectionRef.current,
        key: lastKeyRef.current,
      });

      pendingSelectionRef.current = nextSelection;
      selectionRef.current = nextSelection;
      setSelectionOverride(nextSelection);
      lastKeyRef.current = undefined;
    }

    setValue(nextValue);

    const message = validateField(field, nextValue, extra);
    setErrors((prev) => ({
      ...prev,
      [field]: message || undefined,
    }));

    if (
      (field === "signupPassword" || field === "confirmPassword") &&
      extra?.passwordToMatch !== undefined
    ) {
      const otherField =
        field === "signupPassword"
          ? "confirmPassword"
          : "signupPassword";

      if (touched[otherField]) {
        const otherValue = extra.passwordToMatch as string;
        const otherExtra = {
          ...extra,
          passwordToMatch: nextValue,
          selected: otherValue,
        };

        const otherMessage = validateField(
          otherField,
          otherValue,
          otherExtra
        );

        setErrors((prev) => ({
          ...prev,
          [otherField]: otherMessage || undefined,
        }));
      }
    }
  };

  const getDisplayValue = () => {
    if (formatAsCurrency) {
      return formatCurrencyInput(value);
    }

    if (!maskOnBlur || isFocused || !value) {
      return value;
    }
    return value.replace(/\d(?=.{4})/g, "•");
  };

  const displayValue = getDisplayValue();

  useLayoutEffect(() => {
    if (formatAsCurrency) {
      previousCurrencyDisplayRef.current = displayValue;

      if (pendingSelectionRef.current) {
        const pendingSelection = pendingSelectionRef.current;
        setSelectionOverride(pendingSelection);

        const timeout = setTimeout(() => {
          if (
            pendingSelectionRef.current?.start === pendingSelection.start &&
            pendingSelectionRef.current?.end === pendingSelection.end
          ) {
            pendingSelectionRef.current = undefined;
          }

          setSelectionOverride(undefined);
        }, 0);

        return () => clearTimeout(timeout);
      }
    }
  }, [displayValue, formatAsCurrency]);

  const handleSelectionChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    const nextSelection = event.nativeEvent.selection;

    if (!formatAsCurrency) {
      return;
    }

    const pendingSelection = pendingSelectionRef.current;

    if (pendingSelection) {
      if (
        pendingSelection.start === nextSelection.start &&
        pendingSelection.end === nextSelection.end
      ) {
        pendingSelectionRef.current = undefined;
        selectionRef.current = nextSelection;
      }

      return;
    }

    selectionRef.current = nextSelection;
  };

  const handleKeyPress = (event: NativeSyntheticEvent<{ key: string }>) => {
    if (formatAsCurrency) {
      lastKeyRef.current = event.nativeEvent.key;
    }
  };

  const getRightAccessory = () => {
    if (hasError) {
      return (
        <PaperTextInput.Icon
          icon="alert-circle-outline"
          color={theme.colors.error}
          forceTextInputFocus={false}
        />
      );
    }

    if (secureTextEntry) {
      return (
        <PaperTextInput.Icon
          icon={isPasswordVisible ? "eye-off" : "eye"}
          onPress={() => setIsPasswordVisible((v) => !v)}
          color={Colors.red10}
          forceTextInputFocus={false}
        />
      );
    }

    if (rightIcon) {
      return (
        <PaperTextInput.Icon
          icon={() => rightIcon}
          forceTextInputFocus={false}
        />
      );
    }

    return null;
  };

  return (
    <View>
      <PaperTextInput
        mode={mode}
        label={!label ? placeholder : label}
        placeholder={placeholder}
        value={displayValue}
        onChangeText={handleValidation}
        style={[
          globalStyle.paperTextInput,
          editable ? undefined : { backgroundColor: Colors.neutral03 },
          style,
        ]}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        error={!!hasError}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType as KeyboardTypeOptions}
        secureTextEntry={finalSecureTextEntry}
        maxLength={maxLength}
        theme={{ colors: { primary: theme.colors.primary } }}
        activeOutlineColor={inputFocusColor}
        right={getRightAccessory()}
        left={left}
        multiline={multiline}
        editable={editable}
        selection={formatAsCurrency ? selectionOverride : undefined}
        onSelectionChange={handleSelectionChange}
        onKeyPress={handleKeyPress}
      />

      <HelperText
        style={globalStyle.inputLabelError}
        type="error"
        visible={!!hasError}
      >
        {hasError}
      </HelperText>
    </View>
  );
};

export default memo(InputValidationComponent, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.errors?.[prev.field] === next.errors?.[next.field] &&
    prev.touched?.[prev.field] === next.touched?.[next.field] &&
    prev.editable === next.editable &&
    prev.secureTextEntry === next.secureTextEntry &&
    prev.multiline === next.multiline &&
    prev.formatAsCurrency === next.formatAsCurrency
  );
});
