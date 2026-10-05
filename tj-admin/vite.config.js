// 项目配置页面
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";

const CWD = process.cwd();

//配置参考 https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 反向代理目标由 .env 下发（VITE_IMG_TX_TARGET），仓库内不保留内网/演示地址
  const { VITE_IMG_TX_TARGET } = loadEnv(mode, CWD, "VITE_");
  return {
    base: "./",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [vue(), vueJsx(), svgLoader()],
    server: {
      port: 18081,
      host: "0.0.0.0",
      // 未配置 .env 时不下发任何代理规则，避免 http-proxy 拿到空 target
      proxy: VITE_IMG_TX_TARGET
        ? {
            "/img-tx": {
              target: VITE_IMG_TX_TARGET,
              changeOrigin: true,
            },
          }
        : {},
    },
  };
});
