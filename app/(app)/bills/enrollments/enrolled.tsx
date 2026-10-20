import { useThemedStyles } from '@/hooks/useAppTheme';
import EnrollmentListComponent from '@/components/enrollments/EnrollmentListComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { createAutoDebitEnrollmentStyles as makeStyles } from '@/styles/app/bills/enrollments/index';
import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

export default function EnrolledScreen() {
  const styles = useThemedStyles(makeStyles);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <View style={styles.headerContainer}>
        <NavHeaderComponent title="All Enrollments" />
      </View>
      <EnrollmentListComponent variant="list" />
    </KeyboardAvoidingView>
  );
}
