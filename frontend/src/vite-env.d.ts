/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_FRONTEND_PORT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_DEBUG: string
  readonly VITE_ENABLE_SOFT_DELETE: string
  readonly VITE_ENABLE_CALENDAR_VIEW: string
  readonly VITE_ENABLE_STATUS_TRACKING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 