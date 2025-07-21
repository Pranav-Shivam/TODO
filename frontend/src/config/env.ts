// Frontend environment configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7035',
  
  // Frontend Configuration
  FRONTEND_PORT: import.meta.env.VITE_FRONTEND_PORT || '7038',
  
  // Application Settings
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Calendar-Integrated To-Do App',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false,
  
  // Feature Flags
  ENABLE_SOFT_DELETE: import.meta.env.VITE_ENABLE_SOFT_DELETE !== 'false',
  ENABLE_CALENDAR_VIEW: import.meta.env.VITE_ENABLE_CALENDAR_VIEW !== 'false',
  ENABLE_STATUS_TRACKING: import.meta.env.VITE_ENABLE_STATUS_TRACKING !== 'false',
}; 