/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_HOST_DEVELOPMENT: string
  readonly VITE_API_HOST_TEST: string
  readonly VITE_API_HOST_PRODUCT: string
  readonly VITE_MOCK_HOST: string
  readonly VITE_IMG_TX_TARGET: string
  readonly VITE_IMG_MINIO_TARGET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
