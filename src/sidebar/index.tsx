/**
 * Sidebar Entry Point
 * Only used when sidebar is opened as standalone window
 */

import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './Sidebar';
import '../styles/global.css';

export type SidebarRequest = {
  requestId: string;
  timestamp: number;
  prompt?: string;
  referenceImageUrl?: string;
  referenceImageDataUrl?: string;
  source?: string;
  tabId?: number;
  windowId?: number;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [queue, setQueue] = useState<SidebarRequest[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const syncQueue = useCallback((incomingQueue?: SidebarRequest[]) => {
    if (Array.isArray(incomingQueue)) {
      setQueue(incomingQueue);
    }
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'SHOTAI_QUEUE_GET' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[Sidebar] Failed to fetch queue:', chrome.runtime.lastError.message);
      } else {
        syncQueue(response?.queue);
      }
    });

    const handleRuntimeMessage = (message: any) => {
      if (message?.type === 'SHOTAI_QUEUE_UPDATED') {
        syncQueue(message.payload?.queue);
      }
      if (message?.type === 'SHOTAI_INLINE_SIDEBAR_REQUEST') {
        syncQueue(message.payload?.queue);
      }
    };

    chrome.runtime.onMessage.addListener(handleRuntimeMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
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
        console.warn('[Sidebar] Failed to ACK request:', chrome.runtime.lastError.message);
        return;
      }
      if (!response?.success) {
        console.warn('[Sidebar] ACK unsuccessful for request:', requestId);
      }
    });
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Sidebar 
        activeRequest={activeRequest || undefined}
        queueLength={queue.length}
        onRequestAcknowledged={acknowledgeRequest}
        onClose={() => window.close()} 
      />
    </QueryClientProvider>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
