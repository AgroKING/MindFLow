import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Placeholder for charts or lists
import { Smile } from 'lucide-react-native';

export const MoodTrackerScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F7]">
            <View className="px-6 pt-6 flex-1">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Mood History</Text>

                <View className="bg-white p-6 rounded-3xl shadow-sm shadow-gray-200 mb-6 items-center justify-center">
                    <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                        <Smile size={32} color="#3B82F6" />
                    </View>
                    <Text className="text-gray-500 text-center">
                        Chart visualization would go here using `react-native-chart-kit` or `react-native-svg`
                    </Text>
                </View>

                <Text className="text-xl font-bold text-gray-900 mb-4">Recent Moods</Text>
                <ScrollView className="flex-1">
                    {[1, 2, 3].map((_, i) => (
                        <View key={i} className="bg-white p-4 rounded-2xl mb-3 flex-row items-center border border-gray-100">
                            <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center mr-4">
                                <Text className="text-xl">😊</Text>
                            </View>
                            <View>
                                <Text className="font-bold text-gray-800">Feeling Good</Text>
                                <Text className="text-gray-400 text-xs">Today, 10:00 AM</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};
