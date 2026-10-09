import { COMMON } from '@/constants/common';
import { TRANSACTION_TYPE_OPTIONS } from '@/constants/transaction';
import { filterAutoPayStyles as styles } from '@/styles/components/payments/FilterAutopay';
import { AppliedFilters, DateRange, FilterAutopayProps, TransactionSource } from '@/types';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Checkbox, TextInput } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { Colors } from '../../styles/common/colors';
import { inputFocusColor } from '../../styles/common/globals';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';
import { SpacerComponent } from '../common/SpacerComponent';

const FilterAutopay: React.FC<FilterAutopayProps> = ({ onApply, onReset, initialFilters }) => {
  const [statusFilters, setStatusFilters] = useState<string[]>(initialFilters?.statusFilters ?? []);
  const [transactionTypeFilters, setTransactionTypeFilters] = useState<TransactionSource[]>(initialFilters?.transactionTypeFilters ?? []);
  const [range, setRange] = useState<DateRange>({
    startDate: initialFilters?.startDate ? new Date(initialFilters.startDate) : undefined,
    endDate: initialFilters?.endDate ? new Date(initialFilters.endDate) : undefined,
  });
  const [open, setOpen] = useState(false);

  const onDismiss = () => {
    setOpen(false);
  };

  const onConfirm = ({ startDate, endDate }: DateRange) => {
    setOpen(false);
    setRange({ startDate, endDate });
  };

  const handleStatusChange = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleTransactionTypeChange = (transactionType: TransactionSource) => {
    setTransactionTypeFilters((previousFilters) => (
      previousFilters.includes(transactionType)
        ? previousFilters.filter((filter) => filter !== transactionType)
        : [...previousFilters, transactionType]
    ));
  };

  const handleResetFilters = () => {
    setStatusFilters([]);
    setTransactionTypeFilters([]);
    setRange({ startDate: undefined, endDate: undefined });
    onReset();
  };

  const handleApplyFilters = () => {
    const filters: AppliedFilters = {
      statusFilters,
      transactionTypeFilters,
      createdAtRange: formatDateRangeDisplay(),
      project: '',
      paymentType: '',
      startDate: range.startDate?.toISOString(),
      endDate: range.endDate?.toISOString(),
    };
    onApply(filters);
  };

  const formatDateRangeDisplay = () => {
    if (range.startDate && range.endDate) {
      const start = range.startDate.toISOString().split('T')[0];
      const end = range.endDate.toISOString().split('T')[0];
      return `${start} ~ ${end}`;
    }
    return '';
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <AppText style={styles.headerTitle} weight='700'>Filter</AppText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewContent}>
          <View style={styles.filterSection}>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Status</AppText>
              <TouchableOpacity onPress={handleResetFilters}>
                <AppText style={styles.resetButtonText}>Reset</AppText>
              </TouchableOpacity>
            </View>
            {COMMON.AUTOPAY_STATUS.map((status) => (
              <View key={status} style={styles.checkboxContainer}>
                <Checkbox.Android
                  status={statusFilters.includes(status) ? 'checked' : 'unchecked'}
                  onPress={() => handleStatusChange(status)}
                  color={Colors.red10}
                  testID={`filter-status-${status}`}
                  uncheckedColor={Colors.neutral05}
                />
                <AppText style={styles.checkboxLabel}>{COMMON.STATUS_LABELS[status]}</AppText>
              </View>
            ))}
          </View>

          <View style={styles.filterSection}>
            <AppText style={[styles.sectionTitle, styles.transactionTypeTitle]}>
              Transaction Type
            </AppText>
            {TRANSACTION_TYPE_OPTIONS.map(({ label, value }) => (
              <View key={value} style={styles.checkboxContainer}>
                <Checkbox.Android
                  status={transactionTypeFilters.includes(value) ? 'checked' : 'unchecked'}
                  onPress={() => handleTransactionTypeChange(value)}
                  color={Colors.red10}
                  testID={`filter-transaction-type-${value}`}
                  uncheckedColor={Colors.neutral05}
                />
                <AppText style={styles.checkboxLabel}>{label}</AppText>
              </View>
            ))}
          </View>

          <TextInput
            style={{ marginBottom: 24, backgroundColor: Colors.neutral01 }}
            label="Created At"
            value={formatDateRangeDisplay()}
            placeholder="Select date range"
            mode="outlined"
            activeOutlineColor={inputFocusColor}
            editable={false}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => setOpen(true)}
                forceTextInputFocus={false}
              />
            }
          />

          <DatePickerModal
            locale="en"
            mode="range"
            visible={open}
            onDismiss={onDismiss}
            startDate={range.startDate}
            endDate={range.endDate}
            onConfirm={onConfirm}
          />

          <View style={styles.buttonContainer}>
            <View style={{ marginRight: 6, flex: 1 }}>
              <AppButton
                title="Reset"
                variant="tertiary"
                onPress={handleResetFilters}
              />
            </View>
            <View style={{ marginLeft: 6, flex: 1 }}>
              <AppButton
                title="Apply"
                variant="primary"
                onPress={handleApplyFilters}
              />
            </View>
          </View>
        </ScrollView>
        <SpacerComponent height={100} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default FilterAutopay;
