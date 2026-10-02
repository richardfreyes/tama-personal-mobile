
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { COMMON } from '@/constants/common';
import { onboardingFlowStyles as styles } from '@/styles/auth/login/onboarding-flow';
import { globalStyle } from '@/styles/common/globals';
import { monthlyBillsStyles } from '@/styles/components/enrollments/MonthlyBills';
import { useNavigation } from 'expo-router';
import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from 'react-native';

const OnboardingFlow = () => {
  const navigation = useNavigation();
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / containerWidth);
    setActiveIndex(index);
  };

  const handleNavigate = () => {
    navigation.navigate('login/index' as never);
  }

  const renderIndicators = () => {
    return (
      <View style={[monthlyBillsStyles.indicatorContainer, styles.indicatorContainer]}>
        {COMMON.ONBOARDING_IMGS.map((_, index) => (
          <View key={index} style={[
              monthlyBillsStyles.indicatorDot,
              index === activeIndex ? monthlyBillsStyles.indicatorActive : monthlyBillsStyles.indicatorInactive,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[globalStyle.outerContainer, styles.container]}>
      <View style={styles.imgContainer}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          onLayout={handleLayout}
        >
          {COMMON.ONBOARDING_IMGS.map((item) => {
            const OnboardingImage = item.image;
            return (
              <View key={item.id} style={[styles.itemContainer, { width: containerWidth }]}> 
                <OnboardingImage style={styles.image} width="100%" />
              </View>
            )}
          )}
        </ScrollView>
        {renderIndicators()}
      </View>
      <View>
        <AppText weight='700' style={styles.title}>Lorem ipsum dolor sit amet</AppText>
        <AppText style={styles.desc}>Integrate multiple payment methoods to help you up the process quickly</AppText>
      </View>
      <View style={styles.buttonContainer}>
        {activeIndex === COMMON.ONBOARDING_IMGS.length - 1 && (
          <AppButton title="Next" variant="primary" onPress={handleNavigate} />
        )}
      </View>
    </View>
  );
};

export default OnboardingFlow;
