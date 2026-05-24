import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TripCalculatorScreen from './src/screens/TripCalculatorScreen';
import VehiclesScreen from './src/screens/VehiclesScreen';
import FuelPricesScreen from './src/screens/FuelPricesScreen';
import { colors, navigationTheme } from './src/theme';

export type RootTabParamList = {
  Calculator: undefined;
  Vehicles: undefined;
  FuelPrices: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    ...navigationTheme.colors,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size, focused }) => {
              const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
                Calculator: focused ? 'calculator' : 'calculator-outline',
                Vehicles: focused ? 'car' : 'car-outline',
                FuelPrices: focused ? 'pricetag' : 'pricetag-outline',
              };
              return <Ionicons name={icons[route.name]} size={size - 2} color={color} />;
            },
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            headerStyle: styles.header,
            headerTintColor: colors.text,
            headerTitleStyle: styles.headerTitle,
            headerShadowVisible: false,
            sceneStyle: { backgroundColor: colors.bg },
          })}
        >
          <Tab.Screen
            name="Calculator"
            component={TripCalculatorScreen}
            options={{ title: 'Trip' }}
          />
          <Tab.Screen
            name="Vehicles"
            component={VehiclesScreen}
            options={{ title: 'Vehicles' }}
          />
          <Tab.Screen
            name="FuelPrices"
            component={FuelPricesScreen}
            options={{ title: 'Fuel Prices' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    height: Platform.OS === 'ios' ? 88 : 64,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
  },
  header: {
    backgroundColor: colors.header,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: -0.2,
  },
});
