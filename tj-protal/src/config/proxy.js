// 各环境后端地址由 .env 下发，仓库内不保留真实地址。
// 本地开发：复制 .env.example 为 .env 并填入自己的后端地址。
const proxy = {
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
};

export default proxy;

// 浏览器端接口基地址：
// - mock 模式：远程 mock 服务（VITE_MOCK_HOST）
// - vite 开发服务器（dev / start / dev:test / dev:pro）：返回空串，请求走相对路径，
//   由 vite.config.js 中的反向代理按模块前缀转发到对应 mode 的后端，避免跨域
// - 打包构建：使用上面配置的绝对地址
export const getApiHost = () => {
  const env = import.meta.env.MODE || 'development';
  if (env === 'mock') {
    return import.meta.env.VITE_MOCK_HOST || '';
  }
  return import.meta.env.DEV ? '' : proxy[env].host;
};
