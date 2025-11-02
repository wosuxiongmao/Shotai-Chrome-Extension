import type { ImageModel } from '../types/models';

/**
 * All available image generation models
 * Synced from main platform config/image-models.ts
 */
export const IMAGE_MODELS: ImageModel[] = [
  {
    id: "gemini-2-5-flash-image",
    name: "Gemini-2.5-Flash-Image (nano-banana)",
    description: "Fast generation and multi-image edits (up to 5).",
    tagline: "Fast iteration",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: true,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Multi-Image-to-Image (≤5). Defaults: output=png, image_size=auto.",
    defaultAspectRatio: 1,
  },
  {
    id: "bytedance-seedream-v4",
    name: "Seedream-V4",
    description: "High-fidelity image generation and edits. Multi-image edits supported (up to 5 images).",
    tagline: "High-quality realism",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: true,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Multi-Image-to-Image (≤5). Defaults: image_size=square_hd, image_resolution=1K.",
    defaultAspectRatio: 1,
  },
  {
    id: "midjourney-v7",
    name: "Midjourney-V7",
    description: "Text and multi-image generation (up to 5).",
    tagline: "Creative diversity",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: true,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Multi-Image-to-Image (≤5). Defaults: speed=relaxed, aspectRatio=16:9, version=7.",
    defaultAspectRatio: 16 / 9,
  },
  {
    id: "gpt4o-image",
    name: "GPT-4o-Image",
    description: "Multi-image edits with optional mask (2nd image as mask).",
    tagline: "Versatile edits",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: true,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Multi-Image-to-Image (≤5). Optional mask via 2nd image.",
    defaultAspectRatio: 1,
  },
  {
    id: "qwen-image",
    name: "Qwen-Image",
    description: "Versatile generation and single-image edits with safe defaults.",
    tagline: "Balanced control",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: false,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Image-to-Image (single image). Defaults: num_inference_steps=30, guidance_scale=2.5.",
    defaultAspectRatio: 1,
  },
  {
    id: "qwen-image-edit",
    name: "Qwen-Image-Edit",
    description: "Versatile generation and single-image edits with safe defaults.",
    tagline: "Balanced control",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: false,
    supportsImageToImage: true,
    supportsMultiImageToImage: false,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Image-to-Image (single image). Defaults: image_size:'square', num_inference_steps=25.",
    defaultAspectRatio: 1,
  },
  {
    id: "ideogram-v3",
    name: "Ideogram-V3",
    description: "Text-to-Image generation with clean typography.",
    tagline: "Text-first",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: false,
    supportsMultiImageToImage: false,
    supportsReferenceImage: false,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image. Defaults: rendering_speed=Turbo, style=AUTO, image_size=square_hd.",
    defaultAspectRatio: 1,
  },
  {
    id: "ideogram-v3-remix",
    name: "Ideogram-V3-Remix",
    description: "Single-image remix with strength and prompt expansion.",
    tagline: "Remix",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: false,
    supportsImageToImage: true,
    supportsMultiImageToImage: false,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Image-to-Image (single). Defaults: strength=0.8, expand_prompt=true.",
    defaultAspectRatio: 1,
  },
  {
    id: "google-imagen-4",
    name: "Google-Imagen-4",
    description: "High-quality text-to-image with consistent outputs.",
    tagline: "Consistency",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: false,
    supportsMultiImageToImage: false,
    supportsReferenceImage: false,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image. Defaults: aspect_ratio=1:1.",
    defaultAspectRatio: 1,
  },
  {
    id: "google-imagen-4-ultra",
    name: "Google-Imagen-4-Ultra",
    description: "Premium text-to-image. Higher credit cost (4).",
    tagline: "Premium fidelity",
    platform: "KIE",
    creditCost: 4,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: false,
    supportsMultiImageToImage: false,
    supportsReferenceImage: false,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image. 4 credits per image.",
    defaultAspectRatio: 1,
  },
  {
    id: "flux-kontext-pro",
    name: "FLUX-Kontext-Pro",
    description: "English-only single-image edits.",
    tagline: "Kontext Pro",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: false,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Image-to-Image (single). English prompts only.",
    defaultAspectRatio: 1,
  },
  {
    id: "flux-kontext-max",
    name: "FLUX-Kontext-Max",
    description: "English-only single-image edits. Higher credit cost (4).",
    tagline: "Kontext Max",
    platform: "KIE",
    creditCost: 4,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: false,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Image-to-Image (single). English prompts only. 4 credits per image.",
    defaultAspectRatio: 1,
  },
];

/**
 * Get model by ID
 */
export function getModelById(id: string): ImageModel | undefined {
  return IMAGE_MODELS.find(m => m.id === id);
}

/**
 * Get models that support text-to-image
 */
export function getTextToImageModels(): ImageModel[] {
  return IMAGE_MODELS.filter(m => m.supportsTextToImage);
}

/**
 * Get models that support image-to-image
 */
export function getImageToImageModels(): ImageModel[] {
  return IMAGE_MODELS.filter(m => m.supportsImageToImage);
}

/**
 * Get models that support multi-image-to-image
 */
export function getMultiImageToImageModels(): ImageModel[] {
  return IMAGE_MODELS.filter(m => m.supportsMultiImageToImage);
}

/**
 * Filter models by capability based on number of reference images
 */
export function filterModelsByCapability(referenceImageCount: number): ImageModel[] {
  if (referenceImageCount === 0) {
    return getTextToImageModels();
  } else if (referenceImageCount === 1) {
    return getImageToImageModels();
  } else {
    return getMultiImageToImageModels();
  }
}
