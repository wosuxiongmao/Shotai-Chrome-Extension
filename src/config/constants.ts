/**
 * Shared configuration constants
 */

export const API_CONFIG = {
  // Main platform base URL (can be overridden by environment variable)
  BASE_URL: 'https://shotai.org',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: '/api/extension/auth',
    GENERATE: '/api/extension/generate',
    CREDITS: '/api/extension/credits',
    MODELS: '/api/image-models',
  },
  
  // Request limits
  MAX_PROMPT_LENGTH: 5000,
  MAX_REFERENCE_IMAGES: 5,
  MAX_IMAGE_SIZE_MB: 10,
  
  // Generation limits
  DEFAULT_IMAGES_PER_MODEL: 2,
  MAX_IMAGES_PER_MODEL: 6,
  
  // Credits
  FREE_TIER_CREDITS: 20,
  FREE_TIER_DAILY_LIMIT: 5,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_INFO: 'userInfo',
  CREDITS: 'credits',
  SETTINGS: 'settings',
};

export const EXTENSION_CONFIG = {
  // UI settings
  SIDEBAR_WIDTH: 400,
  FLOATING_BUTTON_POSITION: { bottom: 20, right: 20 },
  

};
