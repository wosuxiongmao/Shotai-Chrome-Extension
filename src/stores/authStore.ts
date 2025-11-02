/**
 * Auth Store
 * Manages user authentication state
 */

import { create } from 'zustand';
import type { CreditsInfo } from '@/types/models';
import { API_CONFIG } from '@/config/constants';
import { apiClient } from '@/api/client';

interface User {
  id: string;
  email: string;
  credits: CreditsInfo;
}

interface AuthState {
  // State
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => void;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // Set token and persist to storage
  setToken: async (token: string) => {
    await chrome.storage.local.set({ authToken: token });
    set({ token, isAuthenticated: true });
  },
  
  // Set user info
  setUser: (user: User) => {
    set({ user });
  },
  
  // Login with token and user info
  login: async (token: string, user: User) => {
    await chrome.storage.local.set({ 
      authToken: token,
      userInfo: user 
    });
    set({ 
      token, 
      user, 
      isAuthenticated: true,
      error: null 
    });
  },
  
  // Logout
  logout: async () => {
    await chrome.storage.local.remove(['authToken', 'userInfo']);
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false,
      error: null
    });
  },
  
  // Check if user is authenticated (load from storage)
  checkAuth: async () => {
    console.log('[authStore] checkAuth called');
    set({ isLoading: true });
    
    try {
      const result = await chrome.storage.local.get(['authToken', 'userInfo']);
      console.log('[authStore] Storage result:', { hasToken: !!result.authToken, hasUserInfo: !!result.userInfo });
      
      if (!result.authToken) {
        console.log('[authStore] No token found in storage');
        set({ isLoading: false, isAuthenticated: false });
        return false;
      }

      const token = result.authToken as string;
      
      // Optimistic update: immediately set authenticated state based on storage (prevents UI flicker)
      console.log('[authStore] Token found, setting authenticated state immediately');
      set({
        token,
        user: result.userInfo,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Then verify token with backend asynchronously in the background (non-blocking)
      console.log('[authStore] Verifying token with backend in background...');
      fetch(`${apiClient.baseURL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[authStore] Token verification failed:', response.status, errorData);
          
          // Only log out user on explicit authentication errors (401/403)
          if (response.status === 401 || response.status === 403) {
            console.warn('[authStore] Token invalid, logging out user');
            await chrome.storage.local.remove(['authToken', 'userInfo']);
            set({
              token: null,
              user: null,
              isAuthenticated: false,
              error: 'Session expired. Please sign in again.'
            });
          } else {
            console.warn('[authStore] API error but keeping user logged in:', response.status);
          }
          return;
        }
        
        const data = await response.json();
        const updatedUser = data?.data || result.userInfo;
        
        console.log('[authStore] Token verified successfully, updating user data');
        // Update user info (may have new credits, etc.)
        set({ user: updatedUser });
        await chrome.storage.local.set({ userInfo: updatedUser });
      })
      .catch(error => {
        // Network error - keep user logged in, only log warning
        console.warn('[authStore] Network error during background verification, keeping user logged in:', error);
      });
      
      return true;
    } catch (error) {
      console.error('[authStore] Auth check failed:', error);
      set({ 
        isLoading: false,
        error: 'Failed to check authentication' 
      });
      return false;
    }
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));
