import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, View, Text } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialIcons';

// Auth Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Dashboard Context
import { DashboardProvider } from './src/contexts/DashboardContext';

// Screens
import LandingScreen from './src/screens/Landing';
import LoginScreen from './src/screens/Login';
import RegisterScreen from './src/screens/Register';
import DashboardScreen from './src/screens/Dashboard';
import TransactionsScreen from './src/screens/Transactions';
import InvestmentsScreen from './src/screens/Investments';
import GoalsScreen from './src/screens/Goals';
import BudgetScreen from './src/screens/Budget';
import SubscriptionsScreen from './src/screens/Subscriptions';
import ProfileScreen from './src/screens/Profile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Investments') {
            iconName = 'trending-up';
          } else if (route.name === 'Budget') {
            iconName = 'account-balance';
          } else if (route.name === 'Goals') {
            iconName = 'flag';
          } else if (route.name === 'Transactions') {
            iconName = 'receipt';
          } else if (route.name === 'Subscriptions') {
            iconName = 'subscriptions';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Investments" component={InvestmentsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Main" : "Landing"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <DashboardProvider>
          <PaperProvider>
            <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
            <AppNavigator />
          </PaperProvider>
        </DashboardProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
