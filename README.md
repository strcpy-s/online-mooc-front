# tj-front

本目录包含「智慧 MOOC / 天机学堂」类在线教育平台的两个前端子项目：

| 目录 | 说明 | 技术栈 |
| --- | --- | --- |
| [`tj-admin/`](./tj-admin) | 运营管理后台（课程、考试、订单、用户、营销、消息、媒资等） | Vue 3 + Vite + Element Plus + Pinia |
| [`tj-protal/`](./tj-protal) | 用户门户（课程浏览、学习、支付、个人中心、AI 问答） | Vue 3 + Vite + Element Plus + Pinia |

> 目录名 `tj-protal` 沿用上游拼写（非 `portal`），为避免大面积改名暂不修正。

## 项目来源

本项目**并非原创**，取自公开仓库的子目录：

- 上游仓库：<https://github.com/finch04/online-mooc>
- 所用代码路径：[`tj-front`](https://github.com/finch04/online-mooc/tree/main/tj-front)（`tj-admin` 与 `tj-protal` 两个子项目）
- 拉取时间：2026 年（本地副本最后同步于 2026-04-21）
- 上游许可：**Apache License 2.0**（见上游根目录 `LICENSE`）

上游 README 自述该项目「基于天机学堂进行改造……本项目仅为学习项目」。本项目在其基础上继续做重构与学习实践，**上游原作者的版权声明与许可条款适用于其原创部分，本仓库不主张该部分著作权**。

## 当前状态：重构中

本仓库处于重构阶段，接口契约、目录结构与依赖版本均可能随时变动，**不建议直接用于生产**。

已完成的改动（相对上游 `main` 分支，2026-10-05 逐文件核对）：

- `tj-protal/vite.config.js`：新增 `API_TARGETS` / `API_PREFIXES`，按 `import.meta.env.MODE` 为各微服务前缀（`/as`、`/us`、`/ts`、`/ss`、`/cs`、`/ls`、`/ms`、`/prs`、`/es`、`/ct`、`/sms`、`/rs`）配置反向代理，并代理站内信 WebSocket（`/sms/ws`）。
- `tj-protal/src/config/proxy.js`：新增 `getApiHost()` 导出——开发服务器下返回空串使请求走相对路径由 Vite 代理转发，`mock` 模式指向远程 Mock，构建产物使用绝对地址。

上述改动使业务接口不再由浏览器直连网关，从而规避开发期跨域。

待办（重构方向）：

- [ ] 环境地址与配置项改为 `.env` 下发，仓库内只保留 `.env.example`
- [ ] 清理上游遗留的默认登录表单预填值、控制台敏感日志、内网/演示环境地址
- [ ] 第三方素材（商标图形、课程宣传图、闭源播放器 SDK）替换为可自分发资源
- [ ] 前端代码渐进式引入 TypeScript（按 `utils` → `api` → `store` → `.vue` 顺序）

## 许可与第三方素材边界

- 上游作者原创代码：沿用其 **Apache License 2.0**；再分发须保留版权声明并按 §4 说明改动（见上文「已完成的改动」）。
- **不属于上游授权范围、需各自确认授权的部分**：
  - 「天机学堂 / TIANJI ONLINE SCHOOL」商标与 logo 图形（`tj-protal/src/assets/天机学堂.png`、`tj-admin/src/assets/天机学堂大.png`、`天机学堂小.png`、两个子项目的 `public/favicon.ico`）
  - 课程宣传图片素材（`tj-protal/src/assets/banner*.jpg`、`adv.png`、`coup*.png` 等）
  - 腾讯闭源播放器压缩包（`tj-protal/src/assets/tcadpter/`、`tj-protal/public/tcadpter/`：tcplayer、TXLivePlayer、hls、flv）
  - 通过 npm 引入的依赖各自遵循其上游许可
- 本仓库不因其公开而获得上述第三方的任何授权。若你从本仓库再分发，请自行处理这些素材与依赖的许可。

## 本地运行

两个子项目相互独立，需分别安装依赖、分别启动：

```bash
# 运营后台（默认 http://localhost:18081）
cd tj-admin
npm install
npm run dev

# 用户门户（默认 http://localhost:18082）
cd tj-protal
npm install
npm run dev
```

各 mode 对应的启动与构建命令见子项目 `package.json` 的 `scripts`；后端地址见 `src/config/proxy.js`（门户另有 `vite.config.js` 的 `API_TARGETS`）。子项目内更细的结构说明见 [`tj-admin/README.md`](./tj-admin/README.md) 与 [`tj-protal/README.md`](./tj-protal/README.md)（注意：这两个 README 为上游遗留，部分内容与实际代码已不一致）。
