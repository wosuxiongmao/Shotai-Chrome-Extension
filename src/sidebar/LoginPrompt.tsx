/**
 * Login Prompt Component
 * Shown when user is not authenticated
 */

import { LogIn } from 'lucide-react';
import { apiClient } from '@/api/client';

interface LoginPromptProps {
  onClose: () => void;
}

export default function LoginPrompt({ onClose }: LoginPromptProps) {
  // Call API directly, not through useAuth (to avoid redundant checkAuth)
  const openAuthFlow = () => {
    const authUrl = `${apiClient.baseURL}/auth/extension`;
    chrome.tabs.create({ url: authUrl }, (tab) => {
      console.log('[LoginPrompt] Opened auth tab:', tab.id);
    });
  };
  
  const handleLogin = () => {
    openAuthFlow();
  };
  
  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        {/* Icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🎨</span>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to ShotAI
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">
          You can quickly copy prompts and upload images on any web page to conveniently use shotAI 
          Sign in to get started.
        </p>
        
        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <LogIn className="w-5 h-5" />
          <span>Sign in with ShotAI</span>
        </button>
      </div>
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="mt-8 text-sm text-gray-500 hover:text-gray-700"
      >
        Close
      </button>
    </div>
  );
}
