/**
 * useAuth Hook
 * Provides authentication utilities
 */

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../api/client';

export function useAuth() {
  const { 
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    clearError
  } = useAuthStore();
  
  // Check authentication on mount (only once)
  useEffect(() => {
    console.log('[useAuth] Component mounted, checking auth (optimistic)...');
    checkAuth().then((success) => {
      console.log('[useAuth] checkAuth completed:', success ? 'User authenticated' : 'User not authenticated');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ 空数组：只在 mount 时执行一次
  
  useEffect(() => {
    const handleMessage = (message: any) => {
      console.log('[useAuth] Received message:', message);
      
      if (message?.type === 'SHOTAI_AUTH_STATUS_CHANGED') {
        // 只有明确收到有效的登录信息才更新登录状态
        if (message.payload?.token && message.payload?.user) {
          console.log('[useAuth] Logging in with token from message');
          login(message.payload.token, message.payload.user);
        } 
        // 只有明确收到 payload 且 token 为 null 才登出（而不是 payload 缺失）
        else if (message.payload && message.payload.token === null) {
          console.warn('[useAuth] Explicit logout signal received');
          logout();
        } else {
          // 忽略格式错误的消息
          console.warn('[useAuth] Received malformed AUTH_STATUS_CHANGED message, ignoring:', message);
        }
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ 空数组：login 和 logout 来自 Zustand，引用稳定
  
  // Open OAuth flow
  const openAuthFlow = () => {
    const authUrl = `${apiClient.baseURL}/auth/extension`;
    
    // Open auth page in new tab
    chrome.tabs.create({ url: authUrl }, (tab) => {
      console.log('Opened auth tab:', tab.id);
    });
  };
  
  return {
    // State
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    openAuthFlow,
    clearError,
    
    // Computed
    credits: user?.credits,
    email: user?.email
  };
}
