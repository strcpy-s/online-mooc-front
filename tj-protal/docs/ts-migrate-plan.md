# tj-protal 渐进式 JS → TS 重构计划

> 取舍：宽松渐进（`allowJs + noImplicitAny:false`）/ 不升级依赖 / 先底层后页面

## 0. 现状结论

- 规模：`src` 下 104 个 `.vue`（全 `<script setup>` 纯 JS，无 Options、无 TSX）+ 27 个自研 `.js` + 4 个厂商 `src/assets/tcadpter/*.min.js`（永不迁移）；零 `.ts`、无 `tsconfig/jsconfig/*.d.ts`。
- 构建：`vite@2.9.9 + @vitejs/plugin-vue@2.3.3 + vue@3.2.25 + vue-router@4.1.2 + pinia@2.0.15 + element-plus@2.2.9`。Vite2/esbuild 已可直接编译 TS，无需升大版本。
- 复用层风格：
  - `src/api/` 8 个（`ai, class, classDetails, message, notes, order, subject, user`）：全 `import request from "@/utils/request.js"` + 按微服务前缀拼 URL + `export const fn = (params/data) => request({...})`，参数无校验。
  - `src/utils/request.js` 是唯一 axios 封装（成功码直接 `return response.data`）；`tool.js` 纯函数；`refreshToken.js` 裸 axios 防循环；`wxLogin.js` 是微信 IIFE 挂 `window.WxLogin`。
  - `src/store/` 5 个（`index + modules/user, permission, tabs-router, dataCache`）：全 Options 式 `defineStore` + 旧 `pinia-use-persist`，state 大量 `[]/{}`。
  - `src/router/` 4 个：全 JS 懒加载 `Layout + children + meta{title,icon,active,hidden}`，无 `RouteRecordRaw/RouteMeta` 类型。
  - `@` 别名只在 `vite.config.js` 定义，无 `paths` 智能提示。

## 1. 总体策略

`allowJs:true + checkJs:false` 让 `.js/.ts/.vue` 混编可运行；按 `基建 → config/utils/types → api → store → router/入口 → 页面分批` 单文件重命名迁移，每步 `vue-tsc --noEmit` + `vite dev/build` 验证；`vite.config.js` 和厂商 JS 最后动，任何一步失败只回退当文件。

## 2. Step 0：TS 基建（一次性，不碰业务）

1. 安装（不升级业务依赖，在 `tj-protal` 目录下执行）：`npm install -D typescript@~5.0 vue-tsc@^1 @types/node`（若 peer 警告则改 `typescript@~4.9`）。
2. 新建 `tj-protal/tsconfig.json`：
   `target/module: ESNext, moduleResolution: node, jsx: preserve, allowJs: true, checkJs: false, strict: false, noImplicitAny: false, esModuleInterop: true, skipLibCheck: true, resolveJsonModule: true, types: ["vite/client"], baseUrl: ".", paths: {"@/*": ["src/*"]}, lib: ["ESNext","DOM","DOM.Iterable"], include: ["src/**/*.ts","src/**/*.vue","src/**/*.d.ts","src/vite-env.d.ts"]`。
3. 新建 `src/vite-env.d.ts`：`/// <reference types="vite/client" />` + `ImportMetaEnv`（`VITE_API_HOST_DEVELOPMENT/TEST/PRODUCT, VITE_MOCK_HOST, VITE_IMG_*`）+ 必要时 `declare module "*.vue"`。
4. 新建 `src/types/api.ts`（以 `docs/api/*.openapi.yaml` 为准）：`interface R<T> = { code: number; msg: string; requestId: string; data: T }`、`enum BizCode { SUCC = 200, UNAUTH = 401 }`（文档仅定义"200-成功，其它-失败"，不写死其它业务码）、`interface PageQuery { pageNo: number; pageSize: number; [k: string]: any }`、`interface PageVO<T> { records: T[]; total: number; pages?: number }`（分页类型为 Step 2 预留）。
5. 新建 `src/types/router.d.ts`：扩展 `RouteMeta { title?, icon?, active?, hidden?, current?, parent? }`。
6. 新建 `src/types/global.d.ts`：`declare global { interface Window { WxLogin: any } }` + `declare module "*.min.js"`（覆盖厂商播放器）。
7. `package.json` 加 `"type-check": "vue-tsc --noEmit -p tsconfig.json"`，`build` 保持 `vite build` 不变（渐进期不阻塞打包）。

验证：`npm run type-check` 通过；`npm run dev` 正常启动 18082。

## 3. Step 1：config + utils（先迁，无页面依赖）

- `src/config/global.js → .ts`：`prefix/TOKEN_NAME` 字面量类型。
- `src/config/proxy.js → .ts`：`getApiHost(): string`，`import.meta.env` 靠 Step 0 的 Env 声明。
- `src/utils/tool.js → .ts`：`upperAlpha(num, type?)`、`timeFormat(time)`、`amountConversion(item?)` 加签名，模板里 `Number(price)/100` 不动。
- `src/utils/request.js → .ts`（核心）：`const instance: AxiosInstance = axios.create(...)`，封装 `export function request<T>(config: AxiosRequestConfig): Promise<R<T>>`（内部 `as unknown as` 转换），拦截器 `code === BizCode.SUCC` 分支保留，401 刷新逻辑原样搬。
- `src/utils/refreshToken.js → .ts`：`tryRefreshToken(): Promise<boolean>`，`host` 用 `getApiHost()` 代替裸字符串拼接（行为不变）。
- `src/utils/wxLogin.js`：不重写，顶部加 `// @ts-nocheck` 隔离。
- import 后缀：迁移中把 `@/utils/request.js` 统一改为 `@/utils/request`（靠 `paths` + vite alias），每迁一个 api 文件顺手改其 import。

验证：`type-check` + 登录页手工走一次（token 刷新不断）。

## 4. Step 2：api 层（8 文件，user.js 打头）

逐个 `*.js → *.ts`，统一模式：`export const getUserInfo = (params: PageQuery) => request<UserVO>({ url: ..., method: "get", params })`。

- 首迁 `src/api/user.js → user.ts`：抽 `src/types/user.ts`（`enum LoginType { PW=1, PHONE=2, WX=3 }`、`UserVO`、`LoginDTO/UserRegisterDTO/ResetPwdDTO`）。
- 次迁 `src/api/class.js`：抽 `src/types/course.ts`（`Category/Course/CouponVO + enum CouponDiscountType` + `formatRule` 参数类型）。
- 剩下 `order/subject/classDetails/message/notes/ai` 按需抽 `XxxDTO/XxxVO`，分页接口统一 `PageQuery/PageVO<T>`，暂不消费 `records` 的先 `any` 占位并标 `// TODO: strict 阶段收紧`。

验证：每迁一个文件跑 `type-check`。

## 5. Step 3：store 层（5 文件，Options 式原样转类型）

- `src/store/index.js → index.ts`：`createPinia()` 不变，`export *` 改无后缀；`pinia-use-persist` 保持不动，若类型报错加 `declare module "pinia-use-persist"` 兜底。
- `modules/user.ts`：`interface UserState { token: string; userInfo: UserVO | null }`，`JSON.parse(...) as UserVO`，actions 补 `: void / Promise<void>`；`getToken/isLogin/getPermissionStore` 等外部 helpers 收敛到 `store/helpers.ts` 并定返回类型。
- `modules/dataCache.ts`：`interface DataCacheState` 消灭 `[]/{}` 隐式 any。
- `permission/tabs-router.ts`：同理 `PermissionState/TabsState` 接口化。

验证：`type-check` + `permission.ts` 的 `userStore.token` 不再 `any`。

## 6. Step 4：router + 入口（小而中心）

- `src/router/modules/{base,components,others}.js → .ts`：`const xxxRouters: RouteRecordRaw[] = [...]`，`component: () => import('@/pages/...')` 不变，`meta` 靠 Step 0 的 `RouteMeta` 扩展。
- `src/router/index.js → index.ts`：`allRoutes: RouteRecordRaw[]`，`getActive(): string` 定返回类型。
- `src/permission.js → permission.ts`：保留全放行逻辑，只补 store 类型。
- `src/main.js → main.ts` + `src/App.vue` 加 `lang="ts"`，同步改 `index.html` 的 `/src/main.js → /src/main.ts`。`vite.config.js` 本阶段不动。

验证：`type-check` + 全路由点击一遍（含 `/login`、`/main`、`/:w+ → /result/404`）。

## 7. Step 5：页面/组件分批（92 + 11，风险由低到高）

每文件固定动作：`<script setup>` → `<script setup lang="ts">`，`ref([])` → `ref<Course[]>([])`，`defineProps({ data: { type: Object } })` → `defineProps<{ data: CourseCard; type?: ... }>()`，API 调用加泛型，`h()/setInterval` 处先 `: any` 隔离。

- 第 1 批（展示型，即迁即赢）：`components/Empty, MainTitle, Breadcrumb, ClassCards, CouponCards, Footer` + `pages/footer/* + pages/result/* + pages/*/components/Swiper, SortBar, OpenClass`。
- 第 2 批（需接口类型）：先定 `Category/Course/Search` 再迁 `pages/main/index.vue + classSearch/ + classList/ + classDetails/`。
- 第 3 批（重逻辑，最后迁）：`components/Header.vue`（debounce/resize）、`pages/learning/index.vue`（`h()` + 播放器 + timer，`player: ref<any>` 隔离）、`pages/pay/*`（金额分转元收敛到 `amountConversion`）、`pages/personal/*`（订单/考试/积分）、`pages/login/* + pages/ask/*`（token/markdown/katex/ws）。

验证：每批 `type-check` + 对应页面手工冒烟。

## 8. Step 6：收紧（可选，业务全量 TS 后）

1. `tsconfig` 翻转 `noImplicitAny: true`（存量加 `// TODO`），再 `strict: true`，`checkJs` 保持 false。
2. `build` 改为 `"build": "vue-tsc --noEmit && vite build --mode development"`（test/product 同理）。
3. 此时再评估 `vite.config.js → .ts`、`pinia-use-persist → pinia-plugin-persistedstate`、ElementPlus 导入路径等升级（本计划内不做）。

## 9. 文件清单（关键路径）

- 基建：`tsconfig.json（新）、src/vite-env.d.ts（新）、src/types/*.ts（新）、package.json（加 type-check）`
- 底层：`src/config/*.js → .ts、src/utils/request/tool/refreshToken.js → .ts、wxLogin.js（加 nocheck）`
- 业务：`src/api/*.js → .ts（8）、src/store/**/*.js → .ts（5）、src/router/**/*.js → .ts（4）、src/permission.js → .ts、src/main.js → .ts、index.html（改入口）、src/**/*.vue（加 lang=ts，104 个分 3 批）`
- 不动：`vite.config.js、src/assets/tcadpter/*`

## 10. 回滚与共存

任何一步失败只回退当文件（`.ts → .js` 改回 + import 后缀改回），`allowJs: true` 保证 `.js/.ts` 互调不中断；全程 git 按 `chore(protal): ts-migrate-stepN-<范围>` 小步提交。

## 11. 当前完成进度（持续更新）

> 给 AI 的提醒：每完成一个 Step（或中途有实质进展）后，必须同步更新下表——改状态图标、写日期和验证结果；若实现与上文某条计划不一致，也要同步修正对应条款，不要只改代码不改文档。
>
> 状态图例：⬜ 未开始 / 🚧 进行中 / ✅ 已完成。每完成一步更新本表。
>
> 包管理器统一用 npm（本文命令均已按 npm 改写，以 `package-lock.json` 为准）。

| 步骤 | 范围 | 状态 | 备注 |
|---|---|---|---|
| Step 0 | TS 基建（tsconfig、vite-env.d.ts、types、type-check） | ✅ 已完成 | 2026-10-29：装 `typescript@~5.0 + vue-tsc@^1 + @types/node`；新建 `tsconfig.json / src/vite-env.d.ts / src/types/{api.ts,router.d.ts,global.d.ts}`；`package.json` 加 `type-check`；`npm run type-check` ✅、`npm run build` ✅、dev 服务器 18082 ✅。同日按 `docs/api` 修正 `api.ts`：`R<T>` 补 `requestId`，`BizCode` 去掉无依据的 `1001`；`type-check` 重新通过 ✅ |
| Step 1 | config + utils（含 request.ts 核心封装） | ✅ 已完成 | 2026-10-29：`global/proxy/tool/refreshToken/request` 迁为 `.ts`（逻辑原样搬，成功/401 分支改用 `BizCode`），`wxLogin.js` 加 `// @ts-nocheck`；8 个 api 文件 + 6 处 tool 引用的 import 去 `.js` 后缀；`npm run type-check` ✅、`npm run build` ✅、登录页手工验证通过 ✅。附带发现：`config/style.js` 无人引用、`wxLogin.js` 为死代码（登录页用 CDN 版），均保持不动 |
| Step 2 | api 层（8 文件，user.js 打头） | ⬜ 未开始 | — |
| Step 3 | store 层（5 文件） | ⬜ 未开始 | — |
| Step 4 | router + 入口（含 main.ts、index.html 入口修改） | ⬜ 未开始 | — |
| Step 5 | 页面/组件分批（104 个 `.vue`，分 3 批） | ⬜ 未开始 | — |
| Step 6 | 收紧（可选，noImplicitAny / strict） | ⬜ 未开始 | 前置条件：业务全量 TS |
