import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play } from 'lucide-react-native';

export const ActivitiesScreen = () => {
    const activities = [
        { id: 1, title: 'Morning Meditation', duration: '10 min', category: 'Meditation', color: 'bg-indigo-50 border-indigo-100', iconColor: '#6366F1' },
        { id: 2, title: 'Deep Breathing', duration: '5 min', category: 'Breathing', color: 'bg-teal-50 border-teal-100', iconColor: '#14B8A6' },
        { id: 3, title: 'Gratitude Journaling', duration: '15 min', category: 'Journaling', color: 'bg-orange-50 border-orange-100', iconColor: '#F97316' },
        { id: 4, title: 'Sleep Hygiene', duration: 'Read', category: 'Education', color: 'bg-blue-50 border-blue-100', iconColor: '#3B82F6' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F7]">
            <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false}>
                <Text className="text-3xl font-bold text-gray-900 mb-2">Activities</Text>
                <Text className="text-gray-500 text-base mb-8">Generated for you based on your mood.</Text>

                <View className="space-y-4">
                    {activities.map((activity) => (
                        <TouchableOpacity key={activity.id} className={`p-5 rounded-2xl border ${activity.color} flex-row items-center mb-4`}>
                            <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 shadow-sm">
                                <Play size={20} color={activity.iconColor} fill={activity.iconColor} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-lg">{activity.title}</Text>
                                <View className="flex-row items-center mt-1">
                                    <View className="bg-white/60 px-2 py-0.5 rounded-md mr-2">
                                        <Text className="text-xs text-gray-500 font-medium">{activity.category}</Text>
                                    </View>
                                    <Text className="text-xs text-gray-400">• {activity.duration}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mt-8 bg-gray-900 p-6 rounded-3xl relative overflow-hidden">
                    <Text className="text-white font-bold text-xl mb-2">Create Routine</Text>
                    <Text className="text-gray-400 mb-4">Build a custom wellness plan that fits your schedule.</Text>
                    <TouchableOpacity className="bg-white py-3 px-6 rounded-xl self-start">
                        <Text className="text-gray-900 font-bold">Start Now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
