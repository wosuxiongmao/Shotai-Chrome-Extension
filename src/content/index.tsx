/**
 * Content Script
 * Injected into every webpage to provide sidebar and floating button
 */

import { createRoot } from 'react-dom/client';
import SidebarContainer from './SidebarContainer';
import globalStyles from '../styles/global.css?inline';

console.log('ShotAI Content Script loaded');

// Track last hovered image so keyboard shortcuts can latch onto it
let lastHoveredImage: HTMLImageElement | null = null;
let lastSelectionValue = '';
let selectionSyncHandle: number | null = null;
type HoveredImageInfo = {
  src: string;
  elementId?: string;
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
};
let lastHoveredInfo: HoveredImageInfo | null = null;
const HOVER_ATTR = 'data-shotai-hovered';
const HOVER_ID_ATTR = 'data-shotai-hover-id';

const markHoveredImage = (image: HTMLImageElement | null) => {
  if (lastHoveredImage && lastHoveredImage !== image) {
    lastHoveredImage.removeAttribute(HOVER_ATTR);
  }
  if (image && lastHoveredImage !== image) {
    image.setAttribute(HOVER_ATTR, 'true');
  }
  lastHoveredImage = image;
};

const extractImageSrc = (img: HTMLImageElement | null | undefined) => {
  if (!img) {
    return '';
  }

  if (img.src?.startsWith('data:')) {
    return img.src;
  }

  return img.currentSrc || img.src || '';
};

const ensureHoverId = (img: HTMLImageElement) => {
  const existing = img.getAttribute(HOVER_ID_ATTR);
  if (existing) {
    return existing;
  }
  const id = `shotai-hover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  img.setAttribute(HOVER_ID_ATTR, id);
  return id;
};

const publishHoveredImage = (info: HoveredImageInfo | null) => {
  if (
    info &&
    lastHoveredInfo &&
    lastHoveredInfo.src === info.src &&
    lastHoveredInfo.elementId === info.elementId
  ) {
    (window as unknown as { __shotaiLastHoveredImage?: HoveredImageInfo }).__shotaiLastHoveredImage =
      info;
    return;
  }

  lastHoveredInfo = info;
  (window as unknown as { __shotaiLastHoveredImage?: HoveredImageInfo }).__shotaiLastHoveredImage =
    info ?? undefined;

  void chrome.runtime
    .sendMessage({
      type: 'SHOTAI_HOVERED_IMAGE_UPDATE',
      payload: {
        src: info?.src ?? '',
        elementId: info?.elementId
      }
    })
    .catch(() => {
      // Background might be unavailable; ignore
    });
};

const captureHoveredImage = (image: HTMLImageElement | null) => {
  if (!image) {
    publishHoveredImage(null);
    return;
  }

  markHoveredImage(image);
  const src = extractImageSrc(image);
  if (!src) {
    publishHoveredImage(null);
    return;
  }

  const elementId = ensureHoverId(image);
  publishHoveredImage({
    src,
    elementId,
    width: image.width,
    height: image.height,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight
  });
};

document.addEventListener(
  'pointerover',
  (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target instanceof HTMLImageElement) {
      captureHoveredImage(target);
      return;
    }

    const nestedImage = target.closest('img');
    if (nestedImage instanceof HTMLImageElement) {
      captureHoveredImage(nestedImage);
    }
  },
  true
);

document.addEventListener(
  'pointerout',
  (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement && target === lastHoveredImage) {
      target.removeAttribute(HOVER_ATTR);
      lastHoveredImage = null;
      publishHoveredImage(null);
    }
  },
  true
);

document.addEventListener('visibilitychange', () => {
  if (document.hidden && lastHoveredImage) {
    lastHoveredImage.removeAttribute(HOVER_ATTR);
    lastHoveredImage = null;
    publishHoveredImage(null);
  }
});

// Handle page navigation (for SPAs that don't reload)
let lastUrl = location.href;
const urlChangeObserver = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    // Reset state on navigation
    if (lastHoveredImage) {
      lastHoveredImage.removeAttribute(HOVER_ATTR);
      lastHoveredImage = null;
    }
    publishHoveredImage(null);
    lastSelectionValue = '';
    // Trigger selection sync to clear any stale selections
    scheduleSelectionSync();
  }
});

urlChangeObserver.observe(document, {
  childList: true,
  subtree: true
});

const readCurrentSelection = () => {
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
    const editableSelection = selection?.toString()?.trim();
    if (editableSelection) {
      return editableSelection;
    }
  }

  return '';
};

const scheduleSelectionSync = () => {
  // Clear existing timer to debounce properly
  if (selectionSyncHandle !== null) {
    clearTimeout(selectionSyncHandle);
    selectionSyncHandle = null;
  }

  // Increase debounce delay to reduce duplicate messages
  selectionSyncHandle = window.setTimeout(() => {
    selectionSyncHandle = null;
    const text = readCurrentSelection();
    
    // Only send if text has actually changed
    if (text === lastSelectionValue) {
      return;
    }

    lastSelectionValue = text;
    void chrome.runtime
      .sendMessage({
        type: 'SHOTAI_SELECTION_SYNC',
        payload: { text }
      })
      .catch(() => {
        // Background might be unavailable; ignore
      });
  }, 200); // Increased from 50ms to 200ms
};

// Use fewer event listeners to reduce duplicate triggers
// selectionchange covers most text selection changes
document.addEventListener('selectionchange', scheduleSelectionSync, true);
// pointerup for mouse-based selection completion
document.addEventListener('pointerup', scheduleSelectionSync, true);
// input for contenteditable/input field changes
document.addEventListener('input', scheduleSelectionSync, true);

// Inject sidebar into page
function injectSidebar() {
  // Check if already injected
  if (document.getElementById('shotai-extension-root')) {
    console.log('ShotAI already injected');
    return;
  }
  
  // Create container
  const container = document.createElement('div');
  container.id = 'shotai-extension-root';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '2147483647';
  
  // Use Shadow DOM to isolate styles
  const shadowRoot = container.attachShadow({ mode: 'open' });
  
  // Create shadow container
  const shadowContainer = document.createElement('div');
  shadowContainer.style.pointerEvents = 'auto';
  shadowRoot.appendChild(shadowContainer);
  
  // Inject Tailwind styles into Shadow DOM
  const style = document.createElement('style');
  style.textContent = globalStyles;
  shadowRoot.appendChild(style);
  
  // Append to body
  document.body.appendChild(container);
  
  // Render React component
  const root = createRoot(shadowContainer);
  root.render(
    <SidebarContainer onClose={() => {
      // Handle close if needed
    }} />
  );
  
  console.log('ShotAI sidebar injected');
}

// Inject when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectSidebar);
} else {
  injectSidebar();
}

type ToastPayload = {
  title?: string;
  message?: string;
  level?: 'info' | 'warning' | 'error';
  durationMs?: number;
};

const TOAST_CONTAINER_ID = 'shotai-inline-toast-container';
const TOAST_LEVEL_STYLES: Record<string, { background: string; border: string; color: string }> = {
  info: {
    background: '#eff6ff', // Solid blue background
    border: '#3b82f6',
    color: '#1d4ed8'
  },
  warning: {
    background: '#fff7ed', // Solid orange background
    border: '#f97316',
    color: '#c2410c'
  },
  error: {
    background: '#fef2f2', // Solid red background
    border: '#ef4444',
    color: '#b91c1c'
  }
};

const ensureToastContainer = () => {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.width = '400px'; // Match side panel width
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    container.style.zIndex = '2147483647';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }
  return container;
};

const showInlineToast = (payload: ToastPayload) => {
  const container = ensureToastContainer();
  const level = payload.level ?? 'info';
  const styles = TOAST_LEVEL_STYLES[level] ?? TOAST_LEVEL_STYLES.info;
  const title = payload.title ?? 'ShotAI';
  const message = payload.message ?? '';
  const duration = Math.max(1500, payload.durationMs ?? 3500);

  const toast = document.createElement('div');
  toast.style.background = styles.background;
  toast.style.border = `2px solid ${styles.border}`;
  toast.style.color = styles.color;
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  toast.style.display = 'flex';
  toast.style.flexDirection = 'column';
  toast.style.pointerEvents = 'auto';
  toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(12px)';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.fontSize = '14px';
  header.style.fontWeight = '600';
  header.textContent = title;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.style.marginLeft = '12px';
  closeButton.style.background = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = styles.color;
  closeButton.style.fontSize = '16px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.lineHeight = '1';
  closeButton.setAttribute('aria-label', 'Close notification');

  const body = document.createElement('div');
  body.style.marginTop = '6px';
  body.style.fontSize = '13px';
  body.style.opacity = '0.9';
  body.textContent = message;

  header.appendChild(closeButton);
  toast.appendChild(header);
  toast.appendChild(body);

  const dismiss = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    window.setTimeout(() => {
      toast.remove();
      if (!container.hasChildNodes()) {
        container.remove();
      }
    }, 200);
  };

  let hideTimer: number | null = window.setTimeout(dismiss, duration);

  toast.addEventListener('mouseenter', () => {
    if (hideTimer !== null) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  });

  toast.addEventListener('mouseleave', () => {
    if (hideTimer === null) {
      hideTimer = window.setTimeout(dismiss, 1200);
    }
  });

  closeButton.addEventListener('click', dismiss);

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.type === 'SHOTAI_SHOW_TOAST') {
    showInlineToast(message.payload || {});
    return true;
  }
  
  if (message.type === 'OPEN_SIDEBAR') {
    console.log('Opening sidebar with payload:', message.payload);
    // The SidebarContainer component will handle this via its own listener
    sendResponse({ success: true });
  }
  
  // Important: return true to indicate async response for other message types
  return true;
});
