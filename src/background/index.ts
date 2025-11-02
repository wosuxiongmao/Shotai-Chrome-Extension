/**
 * Background Service Worker
 * Handles context menus, keyboard shortcuts, and messaging
 */

import { API_CONFIG } from '@/config/constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL;

console.log('ShotAI Background Service Worker loaded');

type PendingSidebarData = {
  requestId: string;
  timestamp: number;
  prompt?: string;
  referenceImageUrl?: string;
  referenceImageDataUrl?: string;
  source?: 'shortcut-selection' | 'shortcut-image' | 'context-menu-selection' | 'context-menu-image';
  tabId?: number;
  windowId?: number;
};

const selectionCache = new Map<number, { text: string; timestamp: number }>();
const SELECTION_CACHE_TTL_MS = 5000;

const hoveredImageCache = new Map<number, { src: string; timestamp: number; elementId?: string }>();

let lastGeneratedRequestId = Date.now();
const REQUEST_QUEUE_STORAGE_KEY = 'shotaiSidebarQueue';
let requestQueue: PendingSidebarData[] = [];
let isQueueInitialized = false;

function generateRequestId(): string {
  const now = Date.now();
  if (now <= lastGeneratedRequestId) {
    lastGeneratedRequestId += 1;
  } else {
    lastGeneratedRequestId = now;
  }
  return `${lastGeneratedRequestId}-${Math.random().toString(36).slice(2, 8)}`;
}

function createPendingData(
  partial: Omit<PendingSidebarData, 'requestId' | 'timestamp'>
): PendingSidebarData {
  return {
    requestId: generateRequestId(),
    timestamp: Date.now(),
    ...partial
  };
}

async function ensureQueueLoaded() {
  if (isQueueInitialized) {
    return;
  }

  try {
    const stored = await chrome.storage.local.get(REQUEST_QUEUE_STORAGE_KEY);
    const rawQueue = stored[REQUEST_QUEUE_STORAGE_KEY];
    if (Array.isArray(rawQueue)) {
      requestQueue = rawQueue;
    } else {
      requestQueue = [];
    }
  } catch (error) {
    console.warn('[Background] Failed to load request queue:', error);
    requestQueue = [];
  }

  isQueueInitialized = true;
}

async function persistQueue() {
  try {
    await chrome.storage.local.set({ [REQUEST_QUEUE_STORAGE_KEY]: requestQueue });
  } catch (error) {
    console.error('[Background] Failed to persist request queue:', error);
  }
}

function broadcastQueueUpdate(reason: string, requestId?: string) {
  const queueSnapshot = requestQueue.slice();
  chrome.runtime
    .sendMessage({
      type: 'SHOTAI_QUEUE_UPDATED',
      payload: {
        queue: queueSnapshot,
        reason,
        requestId,
        length: queueSnapshot.length
      }
    })
    .catch(() => {
      // No active listeners is acceptable
    });
}

async function enqueueRequest(item: PendingSidebarData) {
  await ensureQueueLoaded();
  requestQueue.push(item);
  await persistQueue();
  broadcastQueueUpdate('enqueue', item.requestId);
}

async function removeRequestFromQueue(requestId: string) {
  await ensureQueueLoaded();
  const index = requestQueue.findIndex((entry) => entry.requestId === requestId);
  if (index === -1) {
    console.warn('[Background] Attempted to ACK unknown request:', requestId);
    return false;
  }

  requestQueue.splice(index, 1);
  await persistQueue();
  broadcastQueueUpdate('ack', requestId);
  return true;
}

async function clearQueueForTab(tabId: number) {
  await ensureQueueLoaded();
  const initialLength = requestQueue.length;
  requestQueue = requestQueue.filter((entry) => entry.tabId !== tabId);
  if (requestQueue.length !== initialLength) {
    await persistQueue();
    broadcastQueueUpdate('clear-tab');
  }
}

void ensureQueueLoaded();

async function resolveImagePayload(
  src: string | undefined
): Promise<{ referenceImageUrl?: string; referenceImageDataUrl?: string }> {
  const normalized = typeof src === 'string' ? src.trim() : '';

  if (!normalized) {
    return {};
  }

  if (normalized.startsWith('data:')) {
    return { referenceImageDataUrl: normalized, referenceImageUrl: undefined };
  }

  return { referenceImageUrl: normalized };
}

function getCachedSelection(tabId: number): string {
  const cached = selectionCache.get(tabId);
  if (!cached) {
    return '';
  }

  if (Date.now() - cached.timestamp > SELECTION_CACHE_TTL_MS) {
    selectionCache.delete(tabId);
    return '';
  }

  return cached.text;
}

function updateSelectionCache(tabId: number, text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    selectionCache.delete(tabId);
    return;
  }

  selectionCache.set(tabId, {
    text: trimmed,
    timestamp: Date.now()
  });
}

// Note: Image hover tracking is kept for potential future features
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateHoveredImageCache(tabId: number, payload: { src?: string; elementId?: string }) {
  const normalized = typeof payload.src === 'string' ? payload.src.trim() : '';
  if (!normalized) {
    hoveredImageCache.delete(tabId);
    return;
  }

  hoveredImageCache.set(tabId, {
    src: normalized,
    elementId: payload.elementId,
    timestamp: Date.now()
  });
}

chrome.tabs.onRemoved.addListener((tabId) => {
  selectionCache.delete(tabId);
  hoveredImageCache.delete(tabId);
  void clearQueueForTab(tabId);
});

chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  selectionCache.delete(removedTabId);
  selectionCache.delete(addedTabId);
  hoveredImageCache.delete(removedTabId);
  hoveredImageCache.delete(addedTabId);
});

// Try to open side panel, fallback to inline sidebar only when necessary
async function ensureSidebarForRequest(tab: chrome.tabs.Tab, request: PendingSidebarData) {
  const windowId = tab.windowId;
  const tabId = tab.id;

  if (typeof windowId !== 'number' || typeof tabId !== 'number') {
    console.warn('[Background] Missing identifiers for tab when attempting to open side panel:', tab);
    return;
  }

  try {
    await chrome.sidePanel.open({ windowId });
    console.log('[Background] Side panel opened for request:', {
      requestId: request.requestId,
      queueLength: requestQueue.length
    });
  } catch (error) {
    console.error('[Background] Failed to open side panel:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('sidePanel.open()') && errorMessage.includes('user gesture')) {
      // Don't show inline sidebar - just notify user to use the icon or sidebar shortcut
      await notifyUser(tabId, 'Please click the ShotAI icon or use Ctrl+Shift+G to open the sidebar.', {
        level: 'warning',
        durationMs: 5000
      });
    } else {
      await notifyUser(tabId, 'Could not open the ShotAI panel. Try again in a moment.', {
        level: 'error'
      });
    }
  }
}

async function dispatchSidebarRequest(
  tab: chrome.tabs.Tab,
  partialData: Omit<PendingSidebarData, 'requestId' | 'timestamp'>
) {
  const request = createPendingData({
    ...partialData,
    tabId: tab.id,
    windowId: tab.windowId
  });

  await enqueueRequest(request);
  await ensureSidebarForRequest(tab, request);
}

// 提示用户当前快捷键未能获取有效上下文
async function notifyUser(
  tabId: number,
  message: string,
  options?: {
    title?: string;
    level?: 'info' | 'warning' | 'error';
    durationMs?: number;
  }
) {
  const payload = {
    title: options?.title ?? 'ShotAI',
    message,
    level: options?.level ?? 'info',
    durationMs: options?.durationMs ?? 3500
  };

  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'SHOTAI_SHOW_TOAST',
      payload
    });
  } catch (error) {
    console.warn('[Background] Failed to deliver toast to tab, falling back to console log:', error);
    console.log(`[ShotAI Notice] ${payload.title}: ${payload.message}`);
  }
}

// 通过执行脚本读取当前页面选中的文本
async function getSelectionText(tabId: number): Promise<string> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: () => {
        const extractSelection = () => {
          const selection = window.getSelection();
          const selectedText = selection?.toString()?.trim();
          if (selectedText) {
            return selectedText;
          }

          const activeElement = document.activeElement as HTMLElement | null;
          if (!activeElement) {
            return '';
          }

          if (activeElement instanceof HTMLTextAreaElement) {
            if (
              activeElement.selectionStart !== null &&
              activeElement.selectionEnd !== null &&
              activeElement.selectionStart !== activeElement.selectionEnd
            ) {
              return activeElement.value
                .slice(activeElement.selectionStart, activeElement.selectionEnd)
                .trim();
            }
          } else if (
            activeElement instanceof HTMLInputElement &&
            ['text', 'search', 'url', 'tel', 'password', 'email'].includes(activeElement.type)
          ) {
            if (
              activeElement.selectionStart !== null &&
              activeElement.selectionEnd !== null &&
              activeElement.selectionStart !== activeElement.selectionEnd
            ) {
              return activeElement.value
                .slice(activeElement.selectionStart, activeElement.selectionEnd)
                .trim();
            }
          }

          if (activeElement.isContentEditable) {
            const editableSelection = window.getSelection()?.toString()?.trim();
            if (editableSelection) {
              return editableSelection;
            }
          }

          return '';
        };

        try {
          return extractSelection();
        } catch (error) {
          console.warn('[ShotAI] Failed to read selection in frame:', error);
          return '';
        }
      }
    });

    for (const frameResult of results) {
      const text = frameResult?.result;
      if (typeof text === 'string' && text.trim()) {
        return text.trim();
      }
    }

    return '';
  } catch (error) {
    console.error('[Background] Failed to read selection text:', error);
    return '';
  }
}

async function verifyAndStoreToken(token: string) {
  console.log('[Background] Starting token verification...');
  
  const response = await fetch(`${API_BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to verify token' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const result = await response.json();
  const userData = result?.data;

  console.log('[Background] Token verified, storing to chrome.storage...');
  
  // 确保存储完成
  await chrome.storage.local.set({ authToken: token, userInfo: userData });
  
  console.log('[Background] Token stored successfully');

  // 通知其他组件（非阻塞）
  chrome.runtime.sendMessage({
    type: 'SHOTAI_AUTH_STATUS_CHANGED',
    payload: {
      token,
      user: userData
    }
  }).catch((error) => {
    // No active listeners; ignore (but log for debugging)
    console.log('[Background] No listeners for AUTH_STATUS_CHANGED (this is OK):', error.message);
  });
  
  // 返回 userData 用于确认
  return userData;
}

async function clearAuthState() {
  console.log('[Background] Clearing auth state...');
  await chrome.storage.local.remove(['authToken', 'userInfo']);
  console.log('[Background] Auth state cleared from storage');

  chrome.runtime.sendMessage({
    type: 'SHOTAI_AUTH_STATUS_CHANGED',
    payload: {
      token: null,
      user: null
    }
  }).catch((error) => {
    // No active listeners; ignore (but log for debugging)
    console.log('[Background] No listeners for logout AUTH_STATUS_CHANGED (this is OK):', error.message);
  });
}

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('ShotAI Extension installed');
  
  // Create context menus
  chrome.contextMenus.create({
    id: 'shotai-generate',
    title: 'Generate AI Image with ShotAI',
    contexts: ['page', 'selection']
  });
  
  chrome.contextMenus.create({
    id: 'shotai-use-as-reference',
    title: 'Use as Reference Image',
    contexts: ['image']
  });
  
  // Set default user preferences (if not already set)
  chrome.storage.local.get(['userPreferences'], (result) => {
    if (!result.userPreferences) {
      chrome.storage.local.set({
        userPreferences: {
          selectedModels: ['gemini-2-5-flash-image'],
          imagesPerModel: 2
        }
      });
    }
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || !tab?.windowId) return;
  
  if (info.menuItemId === 'shotai-generate') {
    void dispatchSidebarRequest(tab, {
      prompt: info.selectionText || '',
      source: 'context-menu-selection' as const
    });
  } else if (info.menuItemId === 'shotai-use-as-reference') {
    const imagePayload = await resolveImagePayload(info.srcUrl ?? undefined);
    const pendingData = {
      ...imagePayload,
      source: 'context-menu-image' as const
    };
    
    void dispatchSidebarRequest(tab, pendingData);
  }
});

// Action icon click handler - Open Side Panel
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[Background] Extension icon clicked, opening side panel');
  try {
    // Open side panel for the current window
    await chrome.sidePanel.open({ windowId: tab.windowId });
    console.log('[Background] Side panel opened successfully');
  } catch (error) {
    console.error('[Background] Failed to open side panel:', error);
  }
});

// Keyboard shortcut handler - Also open Side Panel
chrome.commands.onCommand.addListener((command) => {
  console.log('[Background] Keyboard command received:', command);
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const queryError = chrome.runtime.lastError;
    if (queryError) {
      console.error('[Background] Failed to query active tab for command:', command, queryError);
      return;
    }

    const tab = tabs[0];
    if (!tab?.windowId || !tab.id) {
      console.warn('[Background] No active tab to handle command:', command, tabs);
      return;
    }

    console.log('[Background] Handling command for tab:', {
      command,
      tabId: tab.id,
      windowId: tab.windowId,
      url: tab.url
    });

    if (command === 'open-sidebar') {
      try {
        await chrome.sidePanel.open({ windowId: tab.windowId });
        console.log('[Background] Side panel opened via keyboard shortcut');
      } catch (error) {
        console.error('[Background] Failed to open side panel:', error);
      }
      return;
    }

    if (command === 'generate-from-selection') {
      console.log('[Background] Attempting to read selection for tab:', tab.id);
      let selectionText = getCachedSelection(tab.id);
      if (!selectionText) {
        selectionText = await getSelectionText(tab.id);
      }

      if (!selectionText) {
        console.warn('[Background] No selection text found for command generate-from-selection');
        await notifyUser(tab.id, 'Highlight text before using the shortcut.', {
          level: 'warning'
        });
        return;
      }

      console.log('[Background] Selection resolved for shortcut:', {
        length: selectionText.length,
        preview: selectionText.slice(0, 100)
      });

      updateSelectionCache(tab.id, selectionText);

      const pendingData = {
        prompt: selectionText,
        source: 'shortcut-selection' as const
      };

      await dispatchSidebarRequest(tab, pendingData);
      return;
    }

    console.warn('[Background] Unhandled keyboard command:', command);
  });
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'SHOTAI_SELECTION_SYNC') {
    const tabId = sender.tab?.id;
    if (typeof tabId === 'number') {
      const incomingText = typeof message.payload?.text === 'string' ? message.payload.text : '';
      updateSelectionCache(tabId, incomingText);
    }
    return;
  }

  if (message?.type === 'SHOTAI_HOVERED_IMAGE_UPDATE') {
    const tabId = sender.tab?.id;
    if (typeof tabId === 'number') {
      const incomingSrc = typeof message.payload?.src === 'string' ? message.payload.src : '';
      const elementId =
        typeof message.payload?.elementId === 'string' ? message.payload.elementId : undefined;
      updateHoveredImageCache(tabId, { src: incomingSrc, elementId });
      if (incomingSrc) {
        console.log('[Background] Hovered image updated:', {
          tabId,
          length: incomingSrc.length,
          preview: incomingSrc.slice(0, 120),
          elementId
        });
      }
    }
    return;
  }

  if (message?.type === 'SHOTAI_QUEUE_GET') {
    void (async () => {
      await ensureQueueLoaded();
      sendResponse({
        queue: requestQueue,
        length: requestQueue.length
      });
    })();
    return true;
  }

  if (message?.type === 'SHOTAI_QUEUE_ACK') {
    const requestId = typeof message.requestId === 'string' ? message.requestId : undefined;
    if (!requestId) {
      sendResponse({ success: false, error: 'Missing requestId' });
      return true;
    }

    void (async () => {
      const removed = await removeRequestFromQueue(requestId);
      sendResponse({ success: removed });
    })();
    return true;
  }

  console.log('Background received message:', message);
  
  if (message?.type === 'GET_AUTH_TOKEN') {
    chrome.storage.local.get('authToken', (result) => {
      sendResponse({ token: result.authToken });
    });
    return true; // Keep the message channel open for async response
  }
  
  return false;
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('[Background] Received external message:', message, 'from', sender.origin);

  if (message?.type === 'SHOTAI_AUTH_TOKEN') {
    if (!message.token || typeof message.token !== 'string') {
      console.error('[Background] Invalid token received');
      sendResponse({ success: false, error: 'Missing token' });
      return false;
    }

    console.log('[Background] Processing SHOTAI_AUTH_TOKEN...');
    
    verifyAndStoreToken(message.token)
      .then((userData) => {
        console.log('[Background] Token verification complete, sending success response');
        sendResponse({ success: true, user: userData });
      })
      .catch((error: Error) => {
        console.error('[Background] Failed to verify external auth token:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }

  if (message?.type === 'SHOTAI_AUTH_LOGOUT') {
    clearAuthState()
      .then(() => sendResponse({ success: true }))
      .catch((error: Error) => {
        console.error('Failed to clear auth state:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  return false;
});
