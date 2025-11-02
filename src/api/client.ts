/**
 * API Client
 * Handles communication with ShotAI backend
 */

import { API_CONFIG } from '@/config/constants';

class APIClient {
  public baseURL: string; // Made public for auth flow
  private token: string | null = null;
  
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL;
    this.loadToken();
  }
  
  private async loadToken() {
    const result = await chrome.storage.local.get('authToken');
    this.token = result.authToken || null;
  }
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure token is loaded
    if (!this.token) {
      await this.loadToken();
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    console.log(`[APIClient] ${options.method || 'GET'} ${this.baseURL}${endpoint}`);
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[APIClient] Error response (${response.status}):`, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'API request failed' };
      }
      
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      console.error(`[APIClient] Error message:`, errorMessage);
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`[APIClient] Success response:`, data);
    return data;
  }
  
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  setToken(token: string) {
    this.token = token;
    chrome.storage.local.set({ authToken: token });
  }
  
  clearToken() {
    this.token = null;
    chrome.storage.local.remove('authToken');
  }
}

export const apiClient = new APIClient();
