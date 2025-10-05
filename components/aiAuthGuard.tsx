"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface AIAuthGuardProps {
  children: ReactNode;
  showLoginPrompt?: boolean;
  customMessage?: string;
}

/**
 * Component to protect AI features - requires authentication
 * Usage: Wrap AI-related UI elements with this component
 */
export function AIAuthGuard({ 
  children, 
  showLoginPrompt = true,
  customMessage 
}: AIAuthGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user && showLoginPrompt) {
    return (
      <div className="relative">
        {/* Blurred/Disabled Content */}
        <div className="pointer-events-none blur-sm opacity-50">
          {children}
        </div>
        
        {/* Login Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Features Require Login</h3>
            <p className="text-gray-400 mb-6">
              {customMessage || "Sign in to unlock AI-powered features and get personalized assistance"}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in, show AI features
  return <>{children}</>;
}

/**
 * Hook to check if user can access AI features
 */
export function useAIAccess() {
  const { user } = useAuth();
  
  return {
    canUseAI: !!user,
    user,
    requireLogin: () => {
      if (!user) {
        throw new Error("AI features require authentication");
      }
    }
  };
}