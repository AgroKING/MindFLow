import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login, isLoading } = useAuth();
    const navigation = useNavigation<any>();

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError(null);
        try {
            await login({ email, password });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F7]">
            <View className="flex-1 justify-center px-8">

                {/* Header */}
                <View className="items-center mb-10">
                    <View className="w-20 h-20 bg-blue-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                        {/* Placeholder for Logo */}
                        <Text className="text-white text-3xl font-bold">M</Text>
                    </View>
                    <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
                    <Text className="text-gray-500 text-base">Sign in to continue your journey</Text>
                </View>

                {/* Form */}
                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-700 mb-1 ml-1 font-medium">Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            className="w-full bg-white px-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 text-gray-900"
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
                                className="w-full bg-white px-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 text-gray-900 pr-12"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5"
                            >
                                {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity className="items-end mt-2">
                            <Text className="text-blue-600 font-medium">Forgot Password?</Text>
                        </TouchableOpacity>
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
                    className="mt-8 bg-blue-600 py-4 rounded-xl shadow-lg shadow-blue-500/30 items-center"
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Sign In</Text>
                    )}
                </TouchableOpacity>

                {/* Footer */}
                <View className="flex-row justify-center mt-8">
                    <Text className="text-gray-500">Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text className="text-blue-600 font-bold">Sign Up</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
};
