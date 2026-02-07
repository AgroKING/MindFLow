import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { EntryCard } from './EntryCard';
import { Search, Grid, List, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { JournalEntry } from '../../store/useJournalStore';

interface JournalArchiveProps {
    entries: JournalEntry[];
    onEntryClick: (entryId: string) => void;
    isLoading?: boolean;
}

export const JournalArchive: React.FC<JournalArchiveProps> = ({ entries, onEntryClick, isLoading }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEntries = entries.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    const mapToEntry = (entry: JournalEntry) => ({
        id: entry.id,
        title: entry.title,
        preview: entry.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        date: new Date(entry.date),
        mood: entry.mood || '😐',
        tags: entry.tags || []
    });

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search entries..."
                        className="pl-10 bg-white shadow-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                        <ChevronDown className="h-3 w-3" />
                    </Button>

                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 transition-colors",
                                viewMode === 'grid' ? "bg-blue-50 text-blue-600" : "bg-white text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 transition-colors",
                                viewMode === 'list' ? "bg-blue-50 text-blue-600" : "bg-white text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Entries Grid/List */}
            <div className={cn(
                "gap-4",
                viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
            )}>
                {filteredEntries.map(entry => (
                    <EntryCard
                        key={entry.id}
                        entry={mapToEntry(entry)}
                        viewMode={viewMode}
                        onClick={() => onEntryClick(entry.id)}
                    />
                ))}
            </div>

            {filteredEntries.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <p>No entries found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
};
