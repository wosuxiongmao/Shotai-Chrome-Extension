/**
 * Popup UI
 * Shown when clicking the extension icon
 */

import { createRoot } from 'react-dom/client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Sparkles, Settings, LogIn, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import '../styles/global.css';

const queryClient = new QueryClient();

function Popup() {
  const { isAuthenticated, credits, email, openAuthFlow } = useAuth();
  
  const openSidebar = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'OPEN_SIDEBAR',
          payload: {}
        });
        window.close();
      }
    });
  };
  
  if (!isAuthenticated) {
    return (
      <div className="w-80 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎨</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Welcome to ShotAI
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Sign in to start generating AI images
          </p>
          <button
            onClick={openAuthFlow}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-80 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🎨</span>
        <h1 className="text-xl font-bold text-gray-900">ShotAI</h1>
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">{email}</p>
            <p className="text-sm font-medium text-gray-900 flex items-center space-x-1">
              <CreditCard className="w-4 h-4" />
              <span>{credits?.total || 0} credits</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={openSidebar}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Images</span>
        </button>
        
        <button
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Shift+G</kbd> for quick access
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Popup />
    </QueryClientProvider>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
