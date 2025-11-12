/**
 * Sidebar Main Component
 * Main generation interface
 */

import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import GeneratePanel from './GeneratePanel';
import LoginPrompt from './LoginPrompt';
import UserMenu from './UserMenu';

type SidebarRequest = {
  requestId: string;
  timestamp: number;
  prompt?: string;
  referenceImageUrl?: string;
  referenceImageDataUrl?: string;
  source?: string;
  tabId?: number;
  windowId?: number;
};

interface SidebarProps {
  activeRequest?: SidebarRequest;
  queueLength: number;
  onRequestAcknowledged: (requestId: string) => void;
  onClose: () => void;
}

export default function Sidebar({ 
  activeRequest,
  queueLength,
  onRequestAcknowledged,
  onClose 
}: SidebarProps) {
  const { isAuthenticated, isLoading, credits } = useAuth();
  
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <LoginPrompt onClose={onClose} />;
  }
  
  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-3">
            <img
              src="/icons/icon-48.png"
              alt="ShotAI logo"
              className="h-6 w-6"
            />
            <h1 className="text-lg font-bold text-gray-900">ShotAI</h1>
          </div>

          {/* User Menu */}
          <div className="flex-shrink-0">
            <UserMenu />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <GeneratePanel
          activeRequest={activeRequest}
          queueLength={queueLength}
          credits={credits}
          onRequestAcknowledged={onRequestAcknowledged}
        />
      </div>
    </div>
  );
}
