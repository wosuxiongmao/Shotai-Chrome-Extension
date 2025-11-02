/**
 * Auth API
 * Authentication related API calls
 */

import { apiClient } from './client';
import type { CreditsInfo } from '@/types/models';

interface AuthResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
    credits: CreditsInfo;
    subscription?: {
      plan: string;
      status: string;
      renewsAt: string;
    };
  };
}

/**
 * Verify extension token with backend
 */
export async function verifyToken(token: string): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/extension/auth', { token });
}

/**
 * Get current user credits
 */
export async function getCredits(): Promise<CreditsInfo> {
  const response = await apiClient.get<{ success: boolean; data: CreditsInfo }>('/extension/credits');
  return response.data;
}

/**
 * Refresh credits (alias for getCredits)
 */
export async function refreshCredits(): Promise<CreditsInfo> {
  return getCredits();
}
