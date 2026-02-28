import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

import api from './src/services/api';

export default function App() {
  React.useEffect(() => {
    // Diagnostic: Check if API is reachable
    api.get('/health')
      .then(res => console.log('API Health Check:', res.data))
      .catch(err => console.log('API Health Error:', err.message));
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EBDD" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
