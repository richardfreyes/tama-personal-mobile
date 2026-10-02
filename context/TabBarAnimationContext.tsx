import React, { createContext, useContext } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

interface TabBarAnimationContextType {
  tabBarTranslateY: SharedValue<number>;
  tabBarHeight: SharedValue<number>;
}

const TabBarAnimationContext = createContext<TabBarAnimationContextType | undefined>(undefined);

export const TabBarAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tabBarTranslateY = useSharedValue(0);
  const tabBarHeight = useSharedValue(0);

  const value = {
    tabBarTranslateY,
    tabBarHeight,
  };

  return (
    <TabBarAnimationContext.Provider value={value}>
      {children}
    </TabBarAnimationContext.Provider>
  );
};

export const useTabBarAnimation = () => {
  const context = useContext(TabBarAnimationContext);
  if (!context) {
    throw new Error('useTabBarAnimation must be used within a TabBarAnimationProvider');
  }
  return context;
};