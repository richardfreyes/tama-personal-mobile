import FloatingNavBar from '@/components/layout/FloatingNavBar';
import HeaderComponent from '@/components/layout/HeaderComponent';
import { TabBarAnimationProvider } from '@/context/TabBarAnimationContext';
import { retrieveToken } from '@/redux/features/login/loginApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Colors } from '@/styles/common/colors';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.login.token);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    if (token || checkedStorage) return;
    void dispatch(retrieveToken()).finally(() => setCheckedStorage(true));
  }, [checkedStorage, dispatch, token]);

  if (!token && !checkedStorage) return null;
  if (!token) return <Redirect href="/(auth)/login" />;

  return (
    <TabBarAnimationProvider>
      <Tabs
        backBehavior="fullHistory"
        tabBar={props => <FloatingNavBar {...props} />}
        screenOptions={{
          headerShown: false,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.neutral01 },
          tabBarStyle: { display: 'none' }, 
        }}
      >
        <Tabs.Screen 
          name="dashboard"
          options={{
            header: ({}) => <HeaderComponent />, 
            headerShown: true
          }}
        />
      </Tabs>
    </TabBarAnimationProvider>
  );
}
