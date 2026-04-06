import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons, { IoniconsIconName } from 'react-native-vector-icons/Ionicons';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import TransactionScreen from '../screens/TransactionScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CategoryScreen from '../screens/CategoryScreen';

export type MainTabsParamList = {
  Home: undefined;
  Transaksi: undefined;
  Laporan: undefined;
  Profil: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  Kategori: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName: IoniconsIconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transaksi') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Laporan') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }
          return (
            <View style={focused ? styles.activeIconWrapper : styles.iconWrapper}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Beranda' }} />
      <Tab.Screen name="Transaksi" component={TransactionScreen} />
      <Tab.Screen name="Laporan" component={ReportScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Kategori"
        component={CategoryScreen}
        options={{
          headerShown: true,
          title: 'Kelola Kategori',
          headerBackTitle: 'Profil',
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconWrapper: {
    padding: 4,
  },
  activeIconWrapper: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 4,
  },
});

export default MainTabs;
