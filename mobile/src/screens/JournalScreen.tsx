import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X } from 'lucide-react-native';
// Mock data or API call would go here

interface JournalEntry {
    id: string;
    content: string;
    date: string;
    mood?: string;
}

export const JournalScreen = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newEntryContent, setNewEntryContent] = useState('');

    useEffect(() => {
        // fetchEntries();
        // Mock data
        setEntries([
            { id: '1', content: 'Had a great day today!', date: new Date().toISOString() },
            { id: '2', content: 'Felt a bit anxious in the morning but better now.', date: new Date(Date.now() - 86400000).toISOString() },
        ]);
    }, []);

    const handleAddEntry = async () => {
        if (!newEntryContent.trim()) return;

        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            content: newEntryContent,
            date: new Date().toISOString(),
        };

        setEntries([newEntry, ...entries]);
        setNewEntryContent('');
        setIsModalVisible(false);
        // await api.post('/journal', { content: newEntryContent });
    };

    const renderItem = ({ item }: { item: JournalEntry }) => (
        <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm shadow-gray-100 border border-gray-100">
            <Text className="text-gray-500 text-xs mb-2">{new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text className="text-gray-800 text-base leading-relaxed">{item.content}</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F7]">
            <View className="flex-1 px-6 pt-6">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Journal</Text>

                <FlatList
                    data={entries}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerClassName="pb-24"
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className="text-gray-400">No entries yet. Start writing!</Text>
                        </View>
                    }
                />

                <TouchableOpacity
                    onPress={() => setIsModalVisible(true)}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-orange-500 rounded-full items-center justify-center shadow-lg shadow-orange-500/40"
                >
                    <Plus size={28} color="white" />
                </TouchableOpacity>
            </View>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView className="flex-1 bg-white">
                    <View className="flex-1 px-6 pt-4">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">New Entry</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} className="p-2 bg-gray-100 rounded-full">
                                <X size={20} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            className="flex-1 text-lg text-gray-800 text-top"
                            multiline
                            placeholder="Write your thoughts..."
                            value={newEntryContent}
                            onChangeText={setNewEntryContent}
                            textAlignVertical="top"
                            autoFocus
                        />

                        <TouchableOpacity
                            onPress={handleAddEntry}
                            className="bg-orange-500 py-4 rounded-xl items-center mt-4 mb-2 shadow-lg shadow-orange-500/30"
                        >
                            <Text className="text-white font-bold text-lg">Save Entry</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};
