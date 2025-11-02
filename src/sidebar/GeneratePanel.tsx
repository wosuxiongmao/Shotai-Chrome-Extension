/**
 * Generate Panel Component
 * Main image generation interface
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Sparkles, X } from 'lucide-react';
import { IMAGE_MODELS, filterModelsByCapability } from '@/config/models';
import type { CreditsInfo, GenerationRequest } from '@/types/models';
import Toast, { ToastType } from '@/components/Toast';

const MAX_REFERENCE_IMAGES = 5;

type ReferenceImageItem = {
  id: string;
  file: File;
  previewUrl: string;
  sourceUrl?: string;
};

const createReferenceImageItem = (file: File, sourceUrl?: string): ReferenceImageItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  file,
  previewUrl: URL.createObjectURL(file),
  sourceUrl
});

const revokeReferenceImage = (image?: ReferenceImageItem) => {
  if (image?.previewUrl) {
    URL.revokeObjectURL(image.previewUrl);
  }
};

interface GeneratePanelProps {
  activeRequest?: {
    requestId: string;
    timestamp: number;
    prompt?: string;
    referenceImageUrl?: string;
    referenceImageDataUrl?: string;
    source?: string;
  };
  queueLength: number;
  isReady: boolean;
  onRequestAcknowledged: (requestId: string) => void;
  credits?: CreditsInfo; // Passed from parent to avoid redundant useAuth calls
}

export default function GeneratePanel({ 
  activeRequest,
  queueLength,
  isReady,
  onRequestAcknowledged,
  credits
}: GeneratePanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-2-5-flash-image']);
  const [imagesPerModel, setImagesPerModel] = useState(2);
  const [referenceImages, setReferenceImages] = useState<ReferenceImageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
    actionText?: string;
    actionUrl?: string;
  } | null>(null);
  const referenceImagesRef = useRef<ReferenceImageItem[]>([]);
  const lastAppliedRequestIdRef = useRef<string | null>(null);
  const latestImageRequestIdRef = useRef<string | null>(null);
  const imageFetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    referenceImagesRef.current = referenceImages;
  }, [referenceImages]);

  useEffect(() => {
    return () => {
      referenceImagesRef.current.forEach(revokeReferenceImage);
      if (imageFetchControllerRef.current) {
        imageFetchControllerRef.current.abort();
        imageFetchControllerRef.current = null;
      }
    };
  }, []);
  
  // Load user preferences from storage on mount
  useEffect(() => {
    chrome.storage.local.get(['userPreferences'], (result) => {
      if (result.userPreferences) {
        const { selectedModels: savedModels, imagesPerModel: savedCount } = result.userPreferences;
        
        if (savedModels && Array.isArray(savedModels) && savedModels.length > 0) {
          console.log('[GeneratePanel] Loaded saved models:', savedModels);
          setSelectedModels(savedModels);
        }
        
        if (savedCount && typeof savedCount === 'number' && savedCount >= 1 && savedCount <= 6) {
          console.log('[GeneratePanel] Loaded saved images per model:', savedCount);
          setImagesPerModel(savedCount);
        }
      }
      setPreferencesLoaded(true);
    });
  }, []);
  
  // Save selected models to storage when changed (debounced)
  useEffect(() => {
    if (!preferencesLoaded) return; // 不在初始加载时保存
    
    const timeoutId = setTimeout(() => {
      chrome.storage.local.get(['userPreferences'], (result) => {
        const currentPrefs = result.userPreferences || {};
        chrome.storage.local.set({
          userPreferences: {
            ...currentPrefs,
            selectedModels
          }
        }).then(() => {
          console.log('[GeneratePanel] Saved selected models:', selectedModels);
        });
      });
    }, 500); // 500ms 防抖
    
    return () => clearTimeout(timeoutId);
  }, [selectedModels, preferencesLoaded]);
  
  // Save images per model to storage when changed (debounced)
  useEffect(() => {
    if (!preferencesLoaded) return; // 不在初始加载时保存
    
    const timeoutId = setTimeout(() => {
      chrome.storage.local.get(['userPreferences'], (result) => {
        const currentPrefs = result.userPreferences || {};
        chrome.storage.local.set({
          userPreferences: {
            ...currentPrefs,
            imagesPerModel
          }
        }).then(() => {
          console.log('[GeneratePanel] Saved images per model:', imagesPerModel);
        });
      });
    }, 500); // 500ms 防抖
    
    return () => clearTimeout(timeoutId);
  }, [imagesPerModel, preferencesLoaded]);
  
  
  const addReferenceImage = useCallback(
    (options: {
      value: string | undefined;
      requestId: string;
      type: 'url' | 'dataUrl';
      originalUrl?: string;
      suggestedName?: string;
    }) => {
      const { value, requestId, type, originalUrl, suggestedName } = options;
      const normalizedValue = typeof value === 'string' ? value.trim() : '';
      const normalizedOriginal = typeof originalUrl === 'string' ? originalUrl.trim() : '';
      const sourceKey = normalizedOriginal || normalizedValue;

      if (!normalizedValue || !sourceKey) {
        return;
      }

      if (referenceImagesRef.current.some((item) => item.sourceUrl === sourceKey)) {
        setToast({
          type: 'info',
          message: 'Image already added.'
        });
        return;
      }

      if (imageFetchControllerRef.current) {
        imageFetchControllerRef.current.abort();
      }

      const controller = new AbortController();
      imageFetchControllerRef.current = controller;
      latestImageRequestIdRef.current = requestId;

      fetch(normalizedValue, { signal: controller.signal })
        .then((response) => {
          if (!response.ok && type === 'url') {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          if (controller.signal.aborted) {
            return;
          }

          if (latestImageRequestIdRef.current !== requestId) {
            return;
          }

          const filename =
            suggestedName ||
            (normalizedOriginal && normalizedOriginal.split(/[?#]/)[0].split('/').pop()) ||
            normalizedValue.split(/[?#]/)[0].split('/').pop() ||
            `reference-${requestId}.png`;

          const file = new File([blob], filename, { type: blob.type || 'image/png' });
          const imageItem = createReferenceImageItem(file, sourceKey);

          setReferenceImages((prev) => {
            if (prev.some((item) => item.sourceUrl === sourceKey)) {
              revokeReferenceImage(imageItem);
              return prev;
            }

            const next = [...prev, imageItem];

            if (next.length > MAX_REFERENCE_IMAGES) {
              const overflow = next.length - MAX_REFERENCE_IMAGES;
              const removed = next.splice(0, overflow);
              removed.forEach(revokeReferenceImage);
              setToast({
                type: 'info',
                message:
                  overflow === 1
                    ? `Reached the maximum of ${MAX_REFERENCE_IMAGES} reference images. Removed the oldest image.`
                    : `Reached the maximum of ${MAX_REFERENCE_IMAGES} reference images. Removed the oldest ${overflow} images.`
              });
            }

            return next;
          });

          if (imageFetchControllerRef.current === controller) {
            imageFetchControllerRef.current = null;
          }
        })
        .catch((error) => {
          if (controller.signal.aborted) {
            return;
          }
          console.error('Failed to load reference image:', error);
          setToast({
            type: 'error',
            message: 'Failed to load reference image. Please try again.'
          });
          if (imageFetchControllerRef.current === controller) {
            imageFetchControllerRef.current = null;
          }
        });
    },
    [setToast]
  );

  const lastAcknowledgedRequestIdRef = useRef<string | null>(null);
  const hasActiveRequest = Boolean(activeRequest);
  const remainingQueueItems = Math.max(queueLength - (hasActiveRequest ? 1 : 0), 0);

  useEffect(() => {
    if (!activeRequest) {
      return;
    }

    if (lastAppliedRequestIdRef.current === activeRequest.requestId) {
      return;
    }

    lastAppliedRequestIdRef.current = activeRequest.requestId;

    if (typeof activeRequest.prompt === 'string') {
      setPrompt(activeRequest.prompt);
    } else {
      setPrompt('');
    }

    setReferenceImages((prev) => {
      if (prev.length > 0) {
        prev.forEach(revokeReferenceImage);
      }
      return [];
    });

    const { referenceImageDataUrl, referenceImageUrl } = activeRequest;

    if (referenceImageDataUrl && referenceImageDataUrl.trim()) {
      addReferenceImage({
        value: referenceImageDataUrl,
        originalUrl: referenceImageUrl,
        requestId: activeRequest.requestId,
        type: 'dataUrl'
      });
    } else if (referenceImageUrl && referenceImageUrl.trim()) {
      addReferenceImage({
        value: referenceImageUrl,
        requestId: activeRequest.requestId,
        type: 'url'
      });
    }

    if (lastAcknowledgedRequestIdRef.current !== activeRequest.requestId) {
      onRequestAcknowledged(activeRequest.requestId);
      lastAcknowledgedRequestIdRef.current = activeRequest.requestId;
    }
  }, [activeRequest, addReferenceImage, onRequestAcknowledged]);
  
  // Filter models based on reference images
  const availableModels = filterModelsByCapability(referenceImages.length);
  
  // Calculate total credits needed
  const totalCredits = selectedModels.length === 0 ? 0 : selectedModels.reduce((sum, modelId) => {
    const model = IMAGE_MODELS.find(m => m.id === modelId);
    return sum + (model?.creditCost || 2) * imagesPerModel;
  }, 0);
  
  // Toggle model selection
  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter(id => id !== modelId));
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // Allow re-uploading the same file

    if (files.length === 0) {
      return;
    }

    let toastMessage: string | null = null;

    setReferenceImages((prev) => {
      const availableSlots = MAX_REFERENCE_IMAGES - prev.length;

      if (availableSlots <= 0) {
        toastMessage = `You can upload up to ${MAX_REFERENCE_IMAGES} reference images.`;
        return prev;
      }

      const filesToAdd = files.slice(0, availableSlots);

      if (filesToAdd.length < files.length) {
        toastMessage = `Only ${filesToAdd.length} additional image${filesToAdd.length === 1 ? '' : 's'} added (max ${MAX_REFERENCE_IMAGES}).`;
      }

      const newItems = filesToAdd.map((file) => createReferenceImageItem(file));
      return [...prev, ...newItems];
    });

    if (toastMessage) {
      setToast({
        type: 'info',
        message: toastMessage
      });
    }
  };
  
  // Remove reference image
  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      revokeReferenceImage(removed);
      return next;
    });
  };
  
  // Handle generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setToast({
        type: 'error',
        message: 'Please enter a prompt'
      });
      return;
    }
    
    if (selectedModels.length === 0) {
      setToast({
        type: 'error',
        message: 'Please select at least one model'
      });
      return;
    }
    
    if (!credits || credits.total < totalCredits) {
      setToast({
        type: 'error',
        message: `Insufficient credits. You need ${totalCredits} credits but only have ${credits?.total || 0}.`
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Convert files to base64
      const referenceImageBase64: string[] = [];
      for (const { file } of referenceImages) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        referenceImageBase64.push(base64);
      }
      
      // Prepare request data
      const requestData: GenerationRequest = {
        prompt: prompt.trim(),
        models: selectedModels,
        imagesPerModel,
        referenceImages: referenceImageBase64.length > 0 ? referenceImageBase64 : undefined,
        source: 'extension'
      };
      
      console.log('[GeneratePanel] Sending request:', {
        prompt: requestData.prompt,
        models: requestData.models,
        imagesPerModel: requestData.imagesPerModel,
        referenceImagesCount: referenceImageBase64.length,
        source: requestData.source
      });
      
      // Call API
      const { generateImages } = await import('@/api/generate');
      const result = await generateImages(requestData);
      
      console.log('[GeneratePanel] Generation started:', result);
      
      // Show success message with link to dashboard
      const dashboardUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://shotai.org'}/dashboard/logs`;
      
      setToast({
        type: 'success',
        message: `Generation started! ${result.assets.length} images are being generated.`,
        actionText: 'View in Dashboard',
        actionUrl: dashboardUrl
      });
      
      // Clear form
      setPrompt('');
      referenceImages.forEach(revokeReferenceImage);
      setReferenceImages([]);
      
    } catch (error: any) {
      console.error('[GeneratePanel] Generation failed:', error);
      console.error('[GeneratePanel] Error details:', {
        message: error.message,
        response: error.response,
        status: error.status
      });
      
      setToast({
        type: 'error',
        message: error.message || 'Generation failed. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="p-6 space-y-6 relative">
      {/* {isReady && !hasActiveRequest && prompt.trim().length === 0 && referenceImages.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Use shortcuts or context menu to quickly fill text and images from webpages here.
        </div>
      )} */}

      {hasActiveRequest && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700 flex items-center justify-between">
          <span>Processing shortcut action...</span>
          {remainingQueueItems > 0 && (
            <span className="font-medium">{remainingQueueItems} more in queue</span>
          )}
        </div>
      )}

      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the image you want to generate..."
          maxLength={5000}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Use descriptive language for best results</span>
          <span>{prompt.length}/5000</span>
        </div>
      </div>
      
      {/* Reference Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reference Images (Optional)
        </label>
        
        {referenceImages.length === 0 ? (
          // Empty state - show upload area
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload (max {MAX_REFERENCE_IMAGES} images)
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PNG, JPEG, WEBP (max 10MB each)
              </span>
            </label>
          </div>
        ) : (
          // Show uploaded images with thumbnails
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {referenceImages.map((image, index) => (
                <div key={image.id} className="relative group overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img
                    src={image.previewUrl}
                    alt={image.file.name}
                    className="w-full h-32 object-contain bg-gray-100"
                  />
                  <button
                    onClick={() => removeReferenceImage(index)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow-lg ring-1 ring-black/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-gray-900"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                    <span className="truncate block">{image.file.name}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {referenceImages.length < MAX_REFERENCE_IMAGES && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-more"
                />
                <label
                  htmlFor="file-upload-more"
                  className="flex items-center justify-center cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Add more images ({referenceImages.length}/{MAX_REFERENCE_IMAGES})
                  </span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Models ({selectedModels.length} selected)
        </label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {availableModels.map((model) => {
            const isAvailable = selectedModels.length === 0 || 
                               selectedModels.includes(model.id) ||
                               model.supportsTextToImage && referenceImages.length === 0 ||
                               model.supportsImageToImage && referenceImages.length === 1 ||
                               model.supportsMultiImageToImage && referenceImages.length > 1;
            
            return (
              <label
                key={model.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedModels.includes(model.id)
                    ? 'border-blue-500 bg-blue-50'
                    : isAvailable
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model.id)}
                  onChange={() => toggleModel(model.id)}
                  disabled={!isAvailable}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {model.tagline} • {model.creditCost} credits/image
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
      
      {/* Images Per Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images per model: {imagesPerModel}
        </label>
        <input
          type="range"
          min="1"
          max="6"
          value={imagesPerModel}
          onChange={(e) => setImagesPerModel(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>6</span>
        </div>
      </div>
      
      {/* Generate Button */}
      <div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedModels.length === 0 || !prompt.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>
                {selectedModels.length === 0 
                  ? 'Please select models' 
                  : `Generate (${totalCredits} credits)`}
              </span>
            </>
          )}
        </button>
        
        {/* Credits Info */}
        <div className="text-center text-sm text-gray-600 mt-2">
          {selectedModels.length === 0 ? (
            <span className="text-orange-600">⚠️ Please select at least one model above</span>
          ) : (
            <span>Your balance: {credits?.total || 0} credits</span>
          )}
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          actionText={toast.actionText}
          actionUrl={toast.actionUrl}
          duration={5000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
