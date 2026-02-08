import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, Settings as SettingsIcon, Bell, Shield } from 'lucide-react-native';

export const ProfileScreen = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: logout }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F7]">
            <ScrollView className="px-6 py-6">

                <Text className="text-3xl font-bold text-gray-900 mb-8">Profile</Text>

                {/* User Card */}
                <View className="flex-row items-center bg-white p-5 rounded-3xl shadow-sm shadow-gray-200 mb-8">
                    <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center border border-blue-200 mr-4">
                        <Text className="text-blue-600 font-bold text-2xl">{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">{user?.name || 'User'}</Text>
                        <Text className="text-gray-500">{user?.email || 'user@example.com'}</Text>
                    </View>
                </View>

                {/* Settings Options */}
                <View className="bg-white rounded-3xl overflow-hidden shadow-sm shadow-gray-200 mb-8">
                    <TouchableOpacity className="flex-row items-center p-5 border-b border-gray-100 active:bg-gray-50">
                        <User size={22} color="#4B5563" />
                        <Text className="flex-1 ml-4 text-gray-700 font-medium text-base">Account Information</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-5 border-b border-gray-100 active:bg-gray-50">
                        <Bell size={22} color="#4B5563" />
                        <Text className="flex-1 ml-4 text-gray-700 font-medium text-base">Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-5 border-b border-gray-100 active:bg-gray-50">
                        <Shield size={22} color="#4B5563" />
                        <Text className="flex-1 ml-4 text-gray-700 font-medium text-base">Privacy & Security</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-5 active:bg-gray-50">
                        <SettingsIcon size={22} color="#4B5563" />
                        <Text className="flex-1 ml-4 text-gray-700 font-medium text-base">Preferences</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-center bg-red-50 p-4 rounded-2xl border border-red-100"
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="ml-2 text-red-600 font-bold text-base">Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};
