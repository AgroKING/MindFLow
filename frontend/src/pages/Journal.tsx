import React, { useState, useEffect } from 'react';
import { JournalEditor } from '../components/journal/JournalEditor';
import { JournalArchive } from '../components/journal/JournalArchive';
import { ReadingViewModal } from '../components/journal/ReadingViewModal';
import { Button } from '../components/common/Button';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useJournalStore } from '../store/useJournalStore';
import { toast } from 'sonner';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const Journal: React.FC = () => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

    const { entries, fetchEntries, addEntry, isLoading } = useJournalStore();

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleEntryClick = (entryId: string) => {
        setSelectedEntryId(entryId);
    };

    const handleSaveEntry = async (entryData: any) => {
        try {
            await addEntry({
                ...entryData,
                date: new Date().toISOString()
            });
            toast.success('Journal entry saved!');
            setIsEditorOpen(false);
        } catch (error) {
            console.error('Failed to save entry', error);
            toast.error('Failed to save entry');
        }
    };

    // Find selected entry from store
    const selectedEntry = entries.find(e => e.id === selectedEntryId);

    const mappedSelectedEntry = selectedEntry ? {
        ...selectedEntry,
        date: new Date(selectedEntry.date),
        mood: selectedEntry.mood || '😐',
        tags: selectedEntry.tags || []
    } : null;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
                    <p className="text-gray-500 mt-1">Capture your thoughts and reflections</p>
                </div>
                <Button onClick={() => setIsEditorOpen(!isEditorOpen)}>
                    {isEditorOpen ? (
                        <>
                            <X className="mr-2 h-4 w-4" /> Close Editor
                        </>
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" /> New Entry
                        </>
                    )}
                </Button>
            </motion.div>

            {/* Editor (Collapsible) */}
            {isEditorOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    variants={item}
                >
                    <JournalEditor onSave={handleSaveEntry} />
                </motion.div>
            )}

            {/* Archive */}
            <motion.div variants={item}>
                <h2 className="text-xl font-semibold mb-4">Your Entries</h2>
                <JournalArchive
                    entries={entries}
                    onEntryClick={handleEntryClick}
                    isLoading={isLoading}
                />
            </motion.div>

            {/* Reading View Modal */}
            <ReadingViewModal
                isOpen={!!selectedEntryId}
                onClose={() => setSelectedEntryId(null)}
                entry={mappedSelectedEntry}
            />
        </motion.div>
    );
};
