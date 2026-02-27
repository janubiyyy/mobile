import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import SplashScreen from '../screens/SplashScreen';

const AppNavigator = () => {
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, []);

  // Show splash while loading OR while splash animation not done
  if (!splashDone || isLoading) {
    return (
      <SplashScreen
        onFinish={() => setSplashDone(true)}
      />
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
