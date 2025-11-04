/**
 * Sidebar Container
 * Injected into web pages via Content Script
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '../sidebar/Sidebar';

interface SidebarContainerProps {
  onClose: () => void;
}

export default function SidebarContainer({ onClose }: SidebarContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [queue, setQueue] = useState<Array<{
    requestId: string;
    timestamp: number;
    prompt?: string;
    referenceImageUrl?: string;
    referenceImageDataUrl?: string;
    source?: string;
    tabId?: number;
    windowId?: number;
  }>>([]);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      }),
    []
  );

  const syncQueue = useCallback((incomingQueue?: typeof queue) => {
    if (Array.isArray(incomingQueue)) {
      setQueue(incomingQueue);
    }
  }, []);
  
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'SHOTAI_QUEUE_GET' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[SidebarContainer] Failed to fetch queue:', chrome.runtime.lastError.message);
      } else {
        syncQueue(response?.queue);
      }
    });
  }, [syncQueue]);

  // Listen for messages from background script
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'OPEN_SIDEBAR' || message.type === 'SHOTAI_INLINE_SIDEBAR_REQUEST') {
        setIsOpen(true);
        syncQueue(message.payload?.queue);
      } else if (message.type === 'SHOTAI_QUEUE_UPDATED') {
        syncQueue(message.payload?.queue);
      } else if (message.type === 'CLOSE_SIDEBAR') {
        setIsOpen(false);
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [syncQueue]);

  useEffect(() => {
    if (!queue.length) {
      setActiveRequestId(null);
      return;
    }
    if (!activeRequestId || !queue.some((item) => item.requestId === activeRequestId)) {
      setActiveRequestId(queue[0].requestId);
    }
  }, [queue, activeRequestId]);

  const activeRequest = useMemo(() => {
    if (!activeRequestId) {
      return queue[0] ?? null;
    }
    return queue.find((item) => item.requestId === activeRequestId) ?? queue[0] ?? null;
  }, [queue, activeRequestId]);

  const acknowledgeRequest = useCallback((requestId: string) => {
    chrome.runtime.sendMessage({ type: 'SHOTAI_QUEUE_ACK', requestId }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[SidebarContainer] Failed to ACK request:', chrome.runtime.lastError.message);
        return;
      }
      if (!response?.success) {
        console.warn('[SidebarContainer] ACK unsuccessful for request:', requestId);
      }
    });
  }, []);
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[2147483647]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div className="absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        <QueryClientProvider client={queryClient}>
          <Sidebar
            activeRequest={activeRequest || undefined}
            queueLength={queue.length}
            onRequestAcknowledged={acknowledgeRequest}
            onClose={handleClose}
          />
        </QueryClientProvider>
      </div>
    </div>
  );
}
