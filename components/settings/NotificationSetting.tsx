import { AppText } from '@/components/common/AppText';
import { notificationSettingsStyles as styles } from '@/styles/app/notifications/settings';
import { Colors } from '@/styles/common/colors';
import { SettingToggleItemProps } from '@/types';
import React from 'react';
import { Switch, TouchableOpacity, View } from 'react-native';

const SettingToggleItem: React.FC<SettingToggleItemProps> = ({
  label,
  description,
  isEnabled,
  onToggle,
  isLast = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.toggleItemContainer]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={styles.toggleLabel}>
        <AppText weight='700' style={{ color: Colors.aqua10 }}>{label}</AppText>
        {description && (
          <AppText style={{ marginTop: 4 }} size='small'>
            {description}
          </AppText>
        )}
      </View>
      
      <Switch
        trackColor={{ false: Colors.neutral05, true: Colors.aqua10 }}
        thumbColor={Colors.neutral01}
        onValueChange={onToggle}
        value={isEnabled}
        onResponderRelease={(e) => e.stopPropagation()} 
      />
    </TouchableOpacity>
  );
};

export default SettingToggleItem;