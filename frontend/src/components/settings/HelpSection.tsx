import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ChevronDown, MessageCircle, PlayCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
    { q: 'How do I track my mood?', a: 'Navigate to the Mood Tracker page and click on an emoji that best represents your current mood. You can also add notes and tags.' },
    { q: 'Can I export my journal entries?', a: 'Yes! Go to Settings → Privacy & Security → Export My Data to download all your entries.' },
    { q: 'How does the AI Coach work?', a: 'Our AI Coach analyzes your mood patterns and journal entries to provide personalized insights and recommendations.' },
    { q: 'Is my data private?', a: 'Absolutely. Your data is encrypted and stored securely. We never share personal information with third parties.' },
];

export const HelpSection: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Help & Support</h2>

            {/* FAQ */}
            <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Frequently Asked Questions</h3>
                <div className="space-y-2">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-gray-900">{faq.q}</span>
                                <ChevronDown className={cn(
                                    "h-5 w-5 text-gray-400 transition-transform",
                                    openFaq === i && "rotate-180"
                                )} />
                            </button>
                            <AnimatePresence>
                                {openFaq === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-4 pb-4 text-gray-600">{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-4">
                <Button variant="secondary" className="justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                </Button>
                <Button variant="secondary" className="justify-start">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Watch Tutorials
                </Button>
            </div>
        </Card>
    );
};
