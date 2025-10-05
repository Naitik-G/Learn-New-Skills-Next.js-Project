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
        <div className="mb-6 p-4 bg-indigo-950/30 border border-indigo-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Sparkles className="text-indigo-400" size={20} />
                    <h3 className="text-lg font-medium text-indigo-200">Custom Sentences with AI</h3>
                </div>
                <button
                    onClick={() => {
                        if (!user) {
                            setErrorMessage('Please log in to use AI-generated phonetics');
                            return;
                        }
                        setShowCustomModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    <span>Add Sentence</span>
                </button>
            </div>
            {!user && (
                <div className="mb-4 p-3 bg-amber-950/30 border border-amber-800 rounded-lg flex items-start space-x-3">
                    <AlertTriangle className="text-amber-400 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-amber-300 font-medium mb-1">Authentication Required</p>
                        <p className="text-amber-400 text-sm">
                            You must be logged in to use AI-powered phonetic generation. 
                            <button
                                onClick={() => router.push('/login')}
                                className="text-amber-300 hover:text-amber-200 underline ml-1"
                            >
                                Log in
                            </button> to create custom sentences.
                        </p>
                    </div>
                </div>
            )}
            {customSentencesCount === 0 && user && (
                <p className="text-indigo-300 text-center py-4">
                    No custom sentences yet. Add your first sentence to get started!
                </p>
            )}
        </div>
    );
};