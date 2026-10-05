// 项目配置页面
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';

const CWD = process.cwd();

// 按微服务模块划分的接口前缀（对应 src/api 各模块中的 API_PREFIX）
// key 带尾斜杠，避免 /ask 等前端路由被误匹配
const API_PREFIXES = ['/as/', '/us/', '/ts/', '/ss/', '/cs/', '/ls/', '/ms/', '/prs/', '/es/', '/ct/', '/sms/', '/rs/'];

//配置参考 https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 后端地址与图片代理目标全部由 .env 下发（VITE_API_HOST_* / VITE_IMG_*_TARGET），
  // 仓库内不保留真实地址；未配置某项时不下发对应的代理规则，避免 http-proxy 拿到空 target。
  // 注意：不要在此 import src/config/proxy.js，它内部使用了 import.meta.env，
  // vite 将 config 打包为 CJS 时会报错
  const env = loadEnv(mode, CWD, 'VITE_');
  const API_TARGETS = {
    development: env.VITE_API_HOST_DEVELOPMENT || '',
    test: env.VITE_API_HOST_TEST || '',
    product: env.VITE_API_HOST_PRODUCT || '',
  };
  // 当前 mode 对应的后端地址，未配置的模式回退到 development
  const target = API_TARGETS[mode] || API_TARGETS.development;

  const proxy = {};
  if (target) {
    // 站内信 WebSocket，放在 /sms/ 之前优先匹配
    proxy['/sms/ws'] = {
      target: target.replace(/^http/, 'ws'),
      changeOrigin: true,
      ws: true,
    };
    // 各业务模块接口统一代理到当前 mode 对应的后端
    for (const prefix of API_PREFIXES) {
      proxy[prefix] = { target, changeOrigin: true };
    }
  }
  if (env.VITE_IMG_TX_TARGET) {
    proxy['/img-tx'] = { target: env.VITE_IMG_TX_TARGET, changeOrigin: true };
  }
  if (env.VITE_IMG_MINIO_TARGET) {
    proxy['/img-minio'] = { target: env.VITE_IMG_MINIO_TARGET, changeOrigin: true };
  }

  return {
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      svgLoader()
    ],
    server: {
      hmr:{
        overlay:false
      },
      port: 18082,
      host: '0.0.0.0',
      proxy,
    },
  }
})
