import React from 'react';
import { AlertTriangle, Phone, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';

interface CrisisAlertProps {
    onDismiss: () => void;
}

export const CrisisAlert: React.FC<CrisisAlertProps> = ({ onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 mx-4 rounded-xl shadow-lg"
        >
            <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <AlertTriangle className="h-6 w-6" />
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">We're here for you</h3>
                    <p className="text-sm text-red-100 mb-3">
                        It sounds like you might be going through a difficult time.
                        Please know that help is available and you're not alone.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <a
                            href="tel:988"
                            className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                            <Phone className="h-4 w-4" />
                            988 Suicide & Crisis Lifeline
                        </a>
                        <a
                            href="sms:741741"
                            className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                        >
                            Text HOME to 741741
                        </a>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDismiss}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </motion.div>
    );
};
