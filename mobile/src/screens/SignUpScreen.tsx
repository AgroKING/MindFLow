import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, Check } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SignUpScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signup, isLoading } = useAuth();
    const navigation = useNavigation<any>();

    const handleSubmit = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError(null);
        try {
            await signup({ name, email, password });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create account');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F7]">
            <ScrollView contentContainerClassName="flex-grow justify-center" className="px-8 py-10">

                {/* Header */}
                <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-indigo-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                        <Text className="text-white text-2xl font-bold">M</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 mb-1">Create Account</Text>
                    <Text className="text-gray-500 text-base">Join MindFlow today</Text>
                </View>

                {/* Form */}
                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-700 mb-1 ml-1 font-medium">Full Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="John Doe"
                            className="w-full bg-white px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 text-gray-900"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1 font-medium">Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email Address"
                            className="w-full bg-white px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 text-gray-900"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1 font-medium">Password</Text>
                        <View className="relative">
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholder="Password"
                                className="w-full bg-white px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 text-gray-900 pr-12"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5"
                            >
                                {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1 font-medium">Confirm Password</Text>
                        <View className="relative">
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                placeholder="Confirm Password"
                                className={`w-full bg-white px-4 py-3.5 rounded-xl border text-gray-900 pr-12 ${confirmPassword && password !== confirmPassword ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'}`}
                            />
                            {confirmPassword && password === confirmPassword && (
                                <View className="absolute right-4 top-3.5">
                                    <Check size={20} color="#10B981" />
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Error Message */}
                {error && (
                    <View className="mt-4 bg-red-50 p-3 rounded-xl border border-red-100">
                        <Text className="text-red-500 text-center">{error}</Text>
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading}
                    className="mt-8 bg-gray-900 py-4 rounded-xl shadow-lg items-center"
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Create Account</Text>
                    )}
                </TouchableOpacity>

                {/* Footer */}
                <View className="flex-row justify-center mt-8 mb-4">
                    <Text className="text-gray-500">Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text className="text-blue-600 font-bold">Sign In</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};
