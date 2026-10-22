import React from 'react';
import { Plus, Sparkles, AlertTriangle } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { NextRouter } from 'next/router'; // Next.js 13+ router type is different, but for simplicity

interface CustomSentenceSectionProps {
    user: User | null;
    customSentencesCount: number;
    setShowCustomModal: (show: boolean) => void;
    setErrorMessage: (message: string) => void;
    router: { push: (path: string) => void }; // Simplified NextRouter type
}

export const CustomSentenceSection: React.FC<CustomSentenceSectionProps> = ({
    user,
    customSentencesCount,
    setShowCustomModal,
    setErrorMessage,
    router
}) => {
    return (
        <div className="mb-6 p-4 bg-brand/10 border border-brand rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Sparkles className="text-brand" size={20} />
                    <h3 className="text-lg font-medium text-brand">Custom Sentences with AI</h3>
                </div>
                <button
                    onClick={() => {
                        if (!user) {
                            setErrorMessage('Please log in to use AI-generated phonetics');
                            return;
                        }
                        setShowCustomModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    <span>Add Sentence</span>
                </button>
            </div>
            {!user && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg flex items-start space-x-3">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-amber-700 dark:text-amber-300 font-medium mb-1">Authentication Required</p>
                        <p className="text-amber-600 dark:text-amber-400 text-sm">
                            You must be logged in to use AI-powered phonetic generation. 
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 underline ml-1"
                            >
                                Log in
                            </button> to create custom sentences.
                        </p>
                    </div>
                </div>
            )}
            {customSentencesCount === 0 && user && (
                <p className="text-brand text-center py-4">
                    No custom sentences yet. Add your first sentence to get started!
                </p>
            )}
        </div>
    );
};