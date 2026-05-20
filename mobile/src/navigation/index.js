import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SearchScreen from '../screens/SearchScreen';
import ArticleScreen from '../screens/ArticleScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Tab bar icon SVGs ────────────────────────────────────
const TabIcon = ({ name, color, size }) => {
  const s = size || 22;
  const p = { width: s, height: s, fill: 'none', stroke: color, strokeWidth: 1.8 };

  if (name === 'home') return (
    <View>
      <svg width={s} height={s} viewBox="0 0 24 24" {...p}>
        <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
  if (name === 'grid') return (
    <View>
      <svg width={s} height={s} viewBox="0 0 24 24" {...p}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
  if (name === 'bookmark') return (
    <View>
      <svg width={s} height={s} viewBox="0 0 24 24" {...p}>
        <path d="M6 4h12v17l-6-4-6 4z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
  if (name === 'user') return (
    <View>
      <svg width={s} height={s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 21c1.5-4 4-6 8-6s6.5 2 8 6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
  return null;
};

// ── Home stack (Home + Article + Search) ────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Article" component={ArticleScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

// ── Explore stack ────────────────────────────────────────
function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="Article" component={ArticleScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

// ── Root navigation ──────────────────────────────────────
export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.green,
          tabBarInactiveTintColor: colors.inkMuted,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderTopColor: 'rgba(14,17,22,0.06)',
            borderTopWidth: 1,
            height: 84,
            paddingBottom: 28,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.3,
          },
          tabBarIcon: ({ color, focused }) => {
            const iconMap = {
              HomeTab: 'home',
              ExploreTab: 'grid',
              SavedTab: 'bookmark',
              ProfileTab: 'user',
            };
            return <TabIcon name={iconMap[route.name] || 'home'} color={color} size={22} />;
          },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Inicio' }} />
        <Tab.Screen name="ExploreTab" component={ExploreStack} options={{ title: 'Explorar' }} />
        <Tab.Screen name="SavedTab" component={ProfileScreen} options={{ title: 'Guardados' }} />
        <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
