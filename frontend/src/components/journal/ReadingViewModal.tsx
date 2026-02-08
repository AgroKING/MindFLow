import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { X, Edit, Trash2, Share2, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { chatService } from '../../services/chat.service';

interface ReadingViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: {
        title: string;
        content: string;
        date: Date;
        mood: string;
        tags: string[];
    } | null;
}

export const ReadingViewModal: React.FC<ReadingViewModalProps> = ({ isOpen, onClose, entry }) => {
    const [isLoadingAI, setIsLoadingAI] = React.useState(false);
    const [aiResponse, setAiResponse] = React.useState<string | null>(null);

    const handleGetAIFeedback = async () => {
        setIsLoadingAI(true);
        try {
            // content is guaranteed to be string here due to ensure
            const response = await chatService.getAIResponse(entry?.content || '');
            setAiResponse(response.message || response.content || response);
        } catch (error) {
            console.error('Failed to get AI feedback', error);
            setAiResponse("I'm having trouble connecting to your AI coach right now. Please check your connection and try again in a moment.");
        } finally {
            setIsLoadingAI(false);
        }
    };

    if (!entry) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-10 lg:inset-20 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{entry.mood}</span>
                                <span className="text-sm text-gray-500">{format(entry.date, 'MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12">
                            <article className="max-w-3xl mx-auto">
                                <h1 className="text-4xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Merriweather, serif' }}>
                                    {entry.title}
                                </h1>

                                {/* Content - Strip HTML for display */}
                                <div
                                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
                                    style={{ fontFamily: 'Merriweather, serif' }}
                                >
                                    {(() => {
                                        const tmp = document.createElement('DIV');
                                        tmp.innerHTML = entry.content;
                                        return tmp.textContent || tmp.innerText || '';
                                    })()}
                                </div>

                                {/* Tags */}
                                <div className="mt-8 flex flex-wrap gap-2">
                                    {entry.tags.map(tag => (
                                        <span key={tag} className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* AI Feedback Section */}
                                <div className="mt-10 pt-8 border-t border-gray-100">
                                    {!aiResponse ? (
                                        <Button
                                            onClick={handleGetAIFeedback}
                                            disabled={isLoadingAI}
                                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                                        >
                                            {isLoadingAI ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Getting AI Feedback...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Get AI Feedback
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="h-5 w-5 text-purple-600" />
                                                <h3 className="font-semibold text-purple-900">AI Coach Feedback</h3>
                                            </div>
                                            <p className="text-purple-800 leading-relaxed">{aiResponse}</p>
                                        </div>
                                    )}
                                </div>
                            </article>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
