interface ProxyEnv {
  host: string
  cdn: string
}

const proxy: Record<string, ProxyEnv> = {
  development: {
    host: import.meta.env.VITE_API_HOST_DEVELOPMENT || '',
    cdn: '',
  },
  test: {
    host: import.meta.env.VITE_API_HOST_TEST || '',
    cdn: '',
  },
  product: {
    host: import.meta.env.VITE_API_HOST_PRODUCT || '',
    cdn: '',
  },
}

export default proxy

export const getApiHost = (): string => {
  const env: string = import.meta.env.MODE || 'development'
  if (env === 'mock') {
    return import.meta.env.VITE_MOCK_HOST || ''
  }
  return import.meta.env.DEV ? '' : proxy[env].host
}
