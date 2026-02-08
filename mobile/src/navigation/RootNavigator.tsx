import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MoodTrackerScreen } from '../screens/MoodTrackerScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { ActivitiesScreen } from '../screens/ActivitiesScreen';
// Placeholder imports for other screens

const AuthStack = createNativeStackNavigator();
const AppStack = createBottomTabNavigator();

const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
);

const AppNavigator = () => (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name="Dashboard" component={DashboardScreen} />
        <AppStack.Screen name="Mood" component={MoodTrackerScreen} />
        <AppStack.Screen name="Journal" component={JournalScreen} />
        <AppStack.Screen name="Activities" component={ActivitiesScreen} />
        <AppStack.Screen name="Profile" component={ProfileScreen} />
    </AppStack.Navigator>
);

export const RootNavigator = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};
