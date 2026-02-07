import React, { useState, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Calendar, Clock, Send, Lock, Globe, Mic, Check, Loader2 } from 'lucide-react';

const MOODS = ['😭', '😢', '😐', '🙂', '🤩'];
const PRESET_TAGS = ['Reflection', 'Gratitude', 'Goals', 'Anxiety', 'Work', 'Personal'];

interface JournalEditorProps {
    onSave?: (entry: { title: string; content: string; mood: string; tags: string[]; isPrivate: boolean }) => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({ onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isPrivate, setIsPrivate] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const wordCount = useMemo(() => {
        const text = content.replace(/<[^>]*>/g, '').trim();
        return text ? text.split(/\s+/).length : 0;
    }, [content]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handlePublish = useCallback(() => {
        setIsSaving(true);
        // Simulate save
        setTimeout(() => {
            setIsSaving(false);
            setLastSaved(new Date());
            onSave?.({ title, content, mood: selectedMood || '', tags: selectedTags, isPrivate });
        }, 1000);
    }, [title, content, selectedMood, selectedTags, isPrivate, onSave]);

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    }), []);

    return (
        <Card className="p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(), 'MMM d, yyyy')}</span>
                    <span className="w-px h-4 bg-gray-300" />
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-3">
                    {lastSaved && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Saved {format(lastSaved, 'h:mm a')}
                        </span>
                    )}
                    <Button
                        onClick={handlePublish}
                        disabled={!title.trim() || isSaving}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Publish
                    </Button>
                </div>
            </div>

            {/* Title Input */}
            <div className="px-6 pt-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title your entry..."
                    className="w-full text-3xl font-bold tracking-tight border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-gray-300"
                />
            </div>

            {/* Rich Text Editor */}
            <div className="px-6 py-4 min-h-[300px]">
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    placeholder="Start writing your thoughts..."
                    className="border-0 [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-base [&_.ql-editor]:leading-relaxed"
                />
            </div>

            {/* Metadata Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 space-y-4">
                <div className="flex flex-wrap items-center gap-6">
                    {/* Mood Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Mood:</span>
                        <div className="flex gap-1">
                            {MOODS.map(mood => (
                                <button
                                    key={mood}
                                    onClick={() => setSelectedMood(mood)}
                                    className={cn(
                                        "text-2xl p-1 rounded-lg transition-all hover:scale-110",
                                        selectedMood === mood ? "bg-blue-100 scale-110" : "grayscale hover:grayscale-0"
                                    )}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Privacy Toggle */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPrivate(!isPrivate)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                isPrivate
                                    ? "bg-gray-100 text-gray-700 border-gray-200"
                                    : "bg-blue-50 text-blue-600 border-blue-200"
                            )}
                        >
                            {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                            {isPrivate ? 'Private' : 'Shared'}
                        </button>
                    </div>

                    {/* Voice Button */}
                    <Button variant="ghost" size="sm" className="text-gray-500">
                        <Mic className="h-4 w-4 mr-1" /> Voice
                    </Button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Tags:</span>
                    {PRESET_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                                selectedTags.includes(tag)
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Word Count */}
                <div className="text-xs text-gray-400">
                    {wordCount} words
                </div>
            </div>
        </Card>
    );
};
