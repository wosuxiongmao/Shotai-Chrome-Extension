import type { ImageModel } from '../types/models';

/**
 * 所有可用的图片生成模型。
 * 同步自主站 config/image-models.ts。
 *
 * 插件只保留当前 UI 会渲染并发送给 extension API 的公开模型元数据。
 * 专属模型页的 inputFields 暂留在主站，等插件具备对应控件后再接入。
 */
export const IMAGE_MODELS: ImageModel[] = [
  {
    id: "gemini-2-5-flash-image",
    name: "nano-banana",
    description: "Gemini 3 Image Preview (aka Nano Banana) is an advanced AI model excelling in natural language-driven image generation and editing. It produces hyper-realistic, physics-aware visuals with seamless style transformations.",
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
    id: "gemini-3-Pro-image",
    name: "nano-banana-pro",
    description: "Google DeepMind’s Nano Banana Pro delivers sharper 2K imagery, intelligent 4K scaling, improved text rendering, and enhanced character consistency—offering a major leap in visual quality for creative and API-driven workflows.",
    tagline: "Fast iteration",
    platform: "KIE",
    creditCost: 3,
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
    id: "gemini-3.1-flash-image",
    name: "nano-banana-2",
    description: "Google DeepMind’s Nano Banana 2 delivers sharper 2K imagery, intelligent 4K scaling, improved text rendering, and enhanced character consistency—offering a major leap in visual quality for creative and API-driven workflows.",
    tagline: "Fast iteration",
    platform: "KIE",
    creditCost: 3,
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
    id: "bytedance-seedream-v4.5",
    name: "Seedream-V4.5",
    description: "Seedream 4.5 is Bytedance’s refined image model for 4K generation, precise editing, and consistent multi-image output.",
    tagline: "High-quality realism",
    platform: "KIE",
    creditCost: 3,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: true,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Multi-Image-to-Image (≤5). Defaults: aspect_ratio=1:1, quality=basic.",
    defaultAspectRatio: 1,
  },
  {
    id: "bytedance-seedream-v4",
    name: "Seedream-V4",
    description: "Seedream 4.0 API from ByteDance is a next-generation model that combines text-to-image, image-to-image, and editing with batch consistency, high speed, and professional-quality outputs.",
    tagline: "High-quality realism",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: true,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Multi-Image-to-Image (≤5). Defaults: image_size=square_hd, image_resolution=1K. Count maps to max_images.",
    defaultAspectRatio: 1,
  },
  {
    id: "grok-imagine",
    name: "Grok-Imagine",
    description: "Grok Imagine is xAI’s multimodal image and video generation model that converts text or images into short visual outputs with coherent motion and synchronized audio.",
    tagline: "High-quality realism",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: false,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Image-to-Image (single). Defaults: aspect_ratio: 3:2. Returns 6 images per task.",
    defaultAspectRatio: 3 / 2,
  },
  {
    id: "midjourney-v7",
    name: "Midjourney-V7",
    description: "Cinematic, highly stylized generations with multi-image guidance (up to 5) and 4-image grids per task. Tune speed, aspect ratio, stylization, and variety.",
    tagline: "Creative diversity",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: true,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Multi-Image-to-Image (≤5). Output: 4 images per task. Defaults: speed=relaxed, aspectRatio=16:9, version=7. Costs: relaxed=2, fast=4, turbo=8 credits.",
    defaultAspectRatio: 16 / 9,
  },
  {
    id: "gpt4o-image",
    name: "GPT-4o-Image",
    description: "The GPT-Image-1 model, also known as ChatGPT 4o Image, is OpenAI’s latest AI image generation model. It understands both text and visual context, allowing developers to create and edit images with remarkable accuracy. Unlike traditional diffusion models, GPT-Image-1 follows instructions precisely, supports consistent styles, and renders legible text — making it ideal for applications in design, marketing, and creative automation.",
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
    id: "gpt-image-2",
    name: "GPT-Image-2",
    description: "GPT Image 2 is OpenAI’s next-gen image model. It delivers enhanced photorealism, precise editing, sharper text rendering, and professional product photography. Designed for advanced creative and commercial workflows, it elevates image generation beyond basic outputs.",
    tagline: "Next-gen precision",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: true,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Multi-Image-to-Image (≤5). Defaults: resolution=1K. Costs: 1K=2, 2K=3, 4K=4 credits. Note: 4K only supports 9:16, 16:9, 4:3, 3:4 ratios.",
    defaultAspectRatio: 1,
  },
  {
    id: "qwen-image",
    name: "Qwen-Image",
    description: "Qwen-Image-Edit is an open-source image editing model based on Qwen-Image, supporting semantic and appearance editing with precise, visually coherent results. It also handles bilingual (Chinese and English) text editing while preserving font, size, and style, making it a versatile tool for advanced visual content manipulation.",
    tagline: "Balanced control",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: false,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image, Image-to-Image (single image). Defaults: num_inference_steps=30, guidance_scale=2.5, safety=on, output=png.",
    defaultAspectRatio: 1,
  },
  {
    id: "qwen-image-edit",
    name: "Qwen-Image-Edit",
    description: "Qwen-Image-Edit is an open-source image editing model based on Qwen-Image, supporting semantic and appearance editing with precise, visually coherent results. It also handles bilingual (Chinese and English) text editing while preserving font, size, and style, making it a versatile tool for advanced visual content manipulation.",
    tagline: "Balanced control",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: false,
    supportsImageToImage: true,
    supportsMultiImageToImage: false,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities:  Image-to-Image (single image). Defaults:image_size:'square', num_inference_steps=25, guidance_scale=4,enable_safety_checker=true, safety=on, output=png, acceleration='none'.",
    defaultAspectRatio: 1,
  },
  {
    id: "ideogram-v3",
    name: "Ideogram-V3",
    description: "Typography-first text-to-image with prompt expansion and controllable rendering speed. Great for posters, logos, and legible text.",
    tagline: "Text-first",
    platform: "KIE",
    creditCost: 2,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: false,
    supportsMultiImageToImage: false,
    supportsReferenceImage: false,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Text-to-Image. Defaults: rendering_speed=Turbo, style=AUTO, image_size=square_hd. Costs: Turbo=2, Balanced=3, Quality=5 credits.",
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
    info: "Capabilities: Text-to-Image. Defaults: aspect_ratio=1:1. Optional: negative_prompt, seed. Count maps to num_images (string).",
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
    info: "Capabilities: Text-to-Image. 4 credits per image. Optional: negative_prompt, seed. Count maps to num_images (string).",
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
    info: "Capabilities: Image-to-Image (single). English prompts only. Field: inputImage.",
    defaultAspectRatio: 1,
  },
  {
    id: "flux-kontext-max",
    name: "FLUX-Kontext-Max",
    description: "English-only single-image edits. Higher credit cost (3).",
    tagline: "Kontext Max",
    platform: "KIE",
    creditCost: 4,
    maxBatch: 6,
    supportsTextToImage: true,
    supportsImageToImage: true,
    supportsMultiImageToImage: false,
    supportsReferenceImage: true,
    availabilityEnv: "KIE_API_KEY",
    info: "Capabilities: Image-to-Image (single). English prompts only. 3 credits per image.",
    defaultAspectRatio: 1,
  },
];

/**
 * 根据 ID 获取模型。
 */
export function getModelById(id: string): ImageModel | undefined {
  return IMAGE_MODELS.find(m => m.id === id);
}

/**
 * 获取支持文生图的模型。
 */
export function getTextToImageModels(): ImageModel[] {
  return IMAGE_MODELS.filter(m => m.supportsTextToImage);
}

/**
 * 获取支持图生图的模型。
 */
export function getImageToImageModels(): ImageModel[] {
  return IMAGE_MODELS.filter(m => m.supportsImageToImage);
}

/**
 * 获取支持多图生图的模型。
 */
export function getMultiImageToImageModels(): ImageModel[] {
  return IMAGE_MODELS.filter(m => m.supportsMultiImageToImage);
}

/**
 * 根据参考图数量按能力过滤模型。
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
