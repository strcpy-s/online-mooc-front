// 各环境后端地址由 .env 下发，仓库内不保留真实地址。
// 本地开发：复制 .env.example 为 .env 并填入自己的后端地址。
export default {
  development: {
    // 开发环境接口请求
    host: import.meta.env.VITE_API_HOST_DEVELOPMENT || '',
    // 开发环境 cdn 路径
    cdn: '',
  },
  test: {
    // 测试环境接口地址
    host: import.meta.env.VITE_API_HOST_TEST || '',
    // 测试环境 cdn 路径
    cdn: '',
  },
  product: {
    // 正式环境接口地址
    host: import.meta.env.VITE_API_HOST_PRODUCT || '',
    // 正式环境 cdn 路径
    cdn: '',
  },
  pro: {
    // 正式环境接口地址
    host: import.meta.env.VITE_API_HOST_PRO || '',
    // 正式环境 cdn 路径
    cdn: '',
  },
};

