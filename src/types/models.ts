/**
 * Image Model Configuration
 * Shared between main platform and Chrome extension
 */

export interface ImageModel {
  id: string;
  name: string;               // Friendly display name (English only)
  description: string;        // English description for tooltip/card
  tagline: string;            // Short tagline for card
  platform: string;           // Platform identifier
  creditCost: number;         // Credits per image (default 2; exceptions noted below)
  maxBatch: number;           // UI per-model max images to generate (kept as-is)
  
  // Capability tags (used for UI gating with uploaded images)
  supportsTextToImage: boolean;
  supportsImageToImage: boolean;
  supportsMultiImageToImage: boolean; // Multi-Image-to-Image (≤5)
  
  // Backward-compat flag (not used for gating anymore)
  supportsReferenceImage: boolean;
  
  // Optional environment gate
  availabilityEnv?: string;
  
  // Info tooltip content (English)
  info?: string;
  
  // Default aspect ratio for loading placeholders (width / height)
  defaultAspectRatio?: number; // e.g., 1 for square, 0.75 for 3:4 portrait, 1.78 for 16:9
}

/**
 * Generation Request
 */
export interface GenerationRequest {
  prompt: string;
  models: string[];
  imagesPerModel?: number;
  referenceImages?: string[];  // Base64 or URLs
  source?: 'web' | 'extension' | 'api';
}

/**
 * Generation Response
 */
export interface GenerationResponse {
  generationId: string;
  shareUrl: string;
  assets: GenerationAsset[];
  creditSpent: number;
  remainingCredits: number;
}

export interface GenerationAsset {
  id: string;
  model: string;
  modelDisplayName: string;
  url: string;
  cdnUrl: string;
  creditCost: number;
  status: 'processing' | 'succeeded' | 'failed';
}

/**
 * User Credits Info
 */
export interface CreditsInfo {
  subscription: number;
  permanent: number;
  total: number;
  plan?: string;
  renewsAt?: string;
}
