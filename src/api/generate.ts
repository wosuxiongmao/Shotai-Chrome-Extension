/**
 * Generate API
 * Image generation related API calls
 */

import { apiClient } from './client';
import type { GenerationRequest, GenerationResponse } from '@/types/models';

/**
 * Generate images with selected models
 */
export async function generateImages(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const response = await apiClient.post<{ success: boolean; data: GenerationResponse }>(
    '/api/extension/generate',
    {
      prompt: request.prompt,
      models: request.models,
      imagesPerModel: request.imagesPerModel || 2,
      referenceImages: request.referenceImages || [],
      source: request.source || 'extension'
    }
  );
  
  return response.data;
}
