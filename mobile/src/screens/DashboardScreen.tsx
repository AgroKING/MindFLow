import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smile, BookOpen, Activity, Moon } from 'lucide-react-native';

export const DashboardScreen = ({ navigation }: any) => {
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F7]">
            <ScrollView contentContainerClassName="pb-5" className="px-6 py-6">

                {/* Header / Welcome Banner */}
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-gray-500 text-lg font-serif italic">{getGreeting()},</Text>
                        <Text className="text-3xl font-bold text-gray-900 mt-1">{user?.name || 'Friend'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center border border-indigo-200">
                            <Text className="text-indigo-600 font-bold text-lg">{user?.name?.charAt(0) || 'U'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Mood Check-In Card */}
                <View className="bg-white rounded-3xl p-6 shadow-sm shadow-gray-200 mb-6">
                    <Text className="text-lg font-bold text-gray-800 mb-2">How are you feeling?</Text>
                    <View className="flex-row justify-between mt-4">
                        {/* Simplified Mood Selectors */}
                        {['😔', '😐', '🙂', '😄', '🤩'].map((emoji, index) => (
                            <TouchableOpacity key={index} className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center border border-gray-100 hover:bg-gray-100">
                                <Text className="text-2xl">{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Quick Actions */}
                <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
                <View className="flex-row flex-wrap justify-between gap-y-4">
                    <TouchableOpacity className="w-[48%] bg-orange-50 p-5 rounded-2xl border border-orange-100 items-start">
                        <View className="bg-orange-100 w-10 h-10 rounded-full items-center justify-center mb-3">
                            <BookOpen size={20} color="#EA580C" />
                        </View>
                        <Text className="font-bold text-gray-800 text-base">Journal</Text>
                        <Text className="text-gray-500 text-xs mt-1">Write your thoughts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-[48%] bg-blue-50 p-5 rounded-2xl border border-blue-100 items-start">
                        <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mb-3">
                            <Smile size={20} color="#2563EB" />
                        </View>
                        <Text className="font-bold text-gray-800 text-base">Mood History</Text>
                        <Text className="text-gray-500 text-xs mt-1">Track your trends</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-[48%] bg-purple-50 p-5 rounded-2xl border border-purple-100 items-start">
                        <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mb-3">
                            <Activity size={20} color="#7C3AED" />
                        </View>
                        <Text className="font-bold text-gray-800 text-base">Activities</Text>
                        <Text className="text-gray-500 text-xs mt-1">Wellness suggestions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-[48%] bg-teal-50 p-5 rounded-2xl border border-teal-100 items-start">
                        <View className="bg-teal-100 w-10 h-10 rounded-full items-center justify-center mb-3">
                            <Moon size={20} color="#0D9488" />
                        </View>
                        <Text className="font-bold text-gray-800 text-base">Sleep</Text>
                        <Text className="text-gray-500 text-xs mt-1">Log sleep quality</Text>
                    </TouchableOpacity>
                </View>

                {/* Quote / Insight */}
                <View className="mt-8 bg-indigo-50 border border-indigo-100 rounded-3xl p-6 relative overflow-hidden">
                    <View className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-200 rounded-full opacity-20" />
                    <Text className="font-serif italic text-gray-600 text-lg leading-relaxed">
                        "Growth is not a race. You are allowed to rest."
                    </Text>
                    <Text className="text-gray-400 text-xs mt-3 font-bold uppercase tracking-widest">Daily Wisdom</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};
