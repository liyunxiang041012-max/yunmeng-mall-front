# 云梦商城 · 前端项目总结

## 📌 项目概述

**云梦商城（Yunmeng Mall）** 是一个高端品质电商平台的前端单页应用（SPA），采用 Vue 3 + Vite 技术栈构建，为品味不凡的用户提供纯粹、高品质的全球消费体验。

- **项目名称**：yunmeng-mall-front
- **GitHub 仓库**：https://github.com/liyunxiang041012-max/yunmeng-mall-front.git
- **页面标题**：云梦商城
- **设计风格**：白金极简轻奢风

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue 3** | ^3.5.29 | 前端核心框架（Composition API） |
| **Vite** | ^7.3.1 | 构建工具 & 开发服务器 |
| **Vue Router** | ^4.6.4 | SPA 路由管理 |
| **Element Plus** | ^2.8.0 | UI 组件库 |
| **Axios** | ^1.7.7 | HTTP 请求库 |
| **GSAP** | ^3.15.0 | 高性能动画引擎 |
| **Lucide Vue Next** | ^0.577.0 | 图标库 |
| **@element-plus/icons-vue** | ^2.3.1 | Element Plus 图标 |

### 开发依赖

- `@vitejs/plugin-vue` - Vite Vue 插件
- `vite-plugin-vue-devtools` - Vue 开发者工具

### 后端对接

- 后端基础地址：`http://localhost:8080`
- 认证方式：JWT Token（Bearer 方式，请求头 `Authorization`）
- Vercel 部署就绪（`vercel.json` 已配置）

---

## 📁 项目目录结构

```
yunmeng/
├── public/                        # 静态资源
│   └── favicon.ico
├── src/
│   ├── api/                       # API 接口模块
│   │   ├── admin.js               # 管理员相关接口（用户管理、商品审核、分类管理、商家管理）
│   │   ├── ai.js                  # AI 助手接口
│   │   ├── cart.js                # 购物车接口
│   │   ├── coupon.js              # 优惠券接口
│   │   ├── item.js                # 商品、收藏、浏览历史接口
│   │   ├── order.js               # 订单接口
│   │   ├── pay.js                 # 支付接口
│   │   ├── remark.js              # 评价接口
│   │   ├── shop.js                # 店铺接口
│   │   └── user.js                # 用户接口
│   ├── assets/                    # 静态资源
│   │   ├── board/                 # 首页轮播图
│   │   ├── images/                # 图片（Logo、默认头像、未找到图）
│   │   ├── base.css               # 基础样式
│   │   ├── main.css               # 主样式
│   │   ├── logo.svg               # Logo
│   │   └── region.json            # 地区数据（省市区）
│   ├── components/                # 公共组件
│   │   ├── icons/                 # 图标组件
│   │   └── LoginPage.vue          # 登录/注册组件（用户端复用）
│   ├── router/
│   │   └── index.js               # 路由配置 + 导航守卫
│   ├── utils/
│   │   └── request.js             # Axios 封装（拦截器、错误处理）
│   ├── views/                     # 页面视图
│   │   ├── HomePage.vue           # 首页（Splash、轮播、秒杀、推荐、品牌工坊）
│   │   ├── Search.vue             # 商品搜索页
│   │   ├── Product.vue            # 商品详情页
│   │   ├── Cart.vue               # 购物车
│   │   ├── Pay.vue                # 支付结算页
│   │   ├── Coupon.vue             # 优惠券中心
│   │   ├── My.vue                 # 个人中心
│   │   ├── ProfileSetup.vue       # 注册后信息完善
│   │   ├── RegisterPage.vue       # 注册页
│   │   ├── AiAssistant.vue        # AI 助手聊天页
│   │   ├── MessagePage.vue        # 消息页
│   │   ├── NoticePage.vue         # 系统通知页
│   │   ├── Shop.vue               # 店铺详情页
│   │   ├── ShopRegister.vue       # 商家入驻注册
│   │   ├── ShopSetup.vue          # 商家店铺信息设置
│   │   ├── ShopDashboard.vue      # 商家后台首页
│   │   ├── ShopNotice.vue         # 商家系统公告
│   │   ├── ShopOrders.vue         # 商家订单管理
│   │   ├── ShopProducts.vue       # 商家商品管理
│   │   ├── ShopSettings.vue       # 商家设置
│   │   ├── AdminLogin.vue         # 管理员登录
│   │   └── AdminDashboard.vue     # 管理后台仪表盘
│   ├── App.vue                    # 根组件（全局导航栏）
│   └── main.js                    # 入口文件（主题系统、插件注册）
├── .agents/skills/                # AI Agent 技能配置（GSAP 相关）
├── .vscode/                       # VSCode 配置
├── dist/                          # 构建产物
├── index.html                     # HTML 入口
├── vite.config.js                 # Vite 配置（路径别名 @）
├── vercel.json                    # Vercel 部署配置
├── package.json                   # 项目依赖
└── 文档/                          # 后端接口对接文档
    ├── AI助手-后端接口规划.md
    ├── AI开发规范.md
    ├── My页面-后端接口需求.md
    ├── 后端API需求-注册信息完善+Admin仪表盘.md
    ├── 后端接口对接文档-收藏历史.md
    ├── 商品收藏与店铺功能-后端接口文档.md
    ├── 商家后台-后端接口需求.md
    ├── 图书管理系统-开发规划.md
    ├── 管理员分类管理-后端接口需求.md
    ├── 管理员商品上下架接口.md
    └── 订单支付流程-API对接文档.md
```

---

## 🚀 功能模块

### 1. 用户体系
- **登录/注册**：手机号验证码登录、密码登录（`LoginPage.vue` 复用登录与注册）
- **个人信息完善**：注册后引导设置昵称、头像、地址等（`ProfileSetup.vue`）
- **个人中心**：订单、收藏、浏览历史、优惠券、地址管理（`My.vue`）
- **JWT 认证**：请求拦截器自动携带 Token，路由守卫拦截未登录访问
- **401 处理**：区分管理员端与用户端，自动跳转对应登录页

### 2. 首页（HomePage.vue）
- **登录 Splash 动画**：登录后显示品牌过渡动画
- **Hero 轮播**：3 张品牌轮播图自动切换
- **侧边快捷入口**：今日必抢、全球直邮、绿色优选
- **服务承诺展示**：正品溯源、尊享配送、顶级品质、智能助手
- **优惠券展示**：4 张可领取优惠券卡片
- **限时秒杀**：倒计时 + 进度条 + 商品卡片横滑
- **品牌工坊**：主推荐图 + 子推荐图布局
- **猜你喜欢**：8 款推荐商品网格
- **AI 悬浮球**：右下角 AI 助手入口
- **GSAP 动画增强**：滚动入场动画、卡片悬停效果、按钮光效

### 3. 商品系统
- **商品搜索**（`Search.vue`）：分类筛选 + 关键词搜索 + 分页加载
- **商品详情**（`Product.vue`）：SKU 选择、加入购物车、收藏切换
- **品牌/分类**：三级分类支持，品牌列表查询

### 4. 交易流程
- **购物车**（`Cart.vue`）：商品列表、价格变动提示、全选/删除、去结算
- **优惠券**（`Coupon.vue`）：优惠券列表、领取、使用状态
- **支付结算**（`Pay.vue`）：地址选择、订单确认、支付状态轮询、倒计时取消

### 5. AI 助手（AiAssistant.vue）
- 自然语言对话界面
- 会话管理（localStorage 持久化）
- 意图识别：查订单、推荐商品、查优惠券、购物车、店铺查询
- 清除历史功能

### 6. 消息通知
- **消息中心**（`MessagePage.vue`）
- **系统通知**（`NoticePage.vue`）

### 7. 店铺系统
- **店铺详情**（`Shop.vue`）：店铺信息、商品列表、收藏店铺
- **商家入驻**（`ShopRegister.vue`）：两阶段注册流程
- **店铺设置**（`ShopSetup.vue`）：首次登录配置店铺信息

### 8. 商家后台
- **仪表盘**（`ShopDashboard.vue`）：经营概览数据
- **商品管理**（`ShopProducts.vue`）：添加/编辑/上下架商品
- **订单管理**（`ShopOrders.vue`）：订单处理
- **系统公告**（`ShopNotice.vue`）
- **店铺设置**（`ShopSettings.vue`）

### 9. 管理员后台
- **仪表盘**（`AdminDashboard.vue`）：用户数、订单数、收入统计
- **用户管理**：分页查询、状态管理、角色管理
- **商品审核**：待审核/已上架/已下架，审核通过/驳回，上下架切换
- **分类管理**：三级分类 CRUD
- **商家管理**：商家列表、详情、营业状态切换
- **系统通知**：发送系统级公告

---

## 🎨 设计特色

### 主题系统
`main.js` 实现动态主题切换，不同路由自动应用不同配色方案：
| 路由 | 主题 | 色调 |
|------|------|------|
| `/my` | 暖白轻奢 | 象牙白背景 + 金色点缀 |
| `/home` | 暗金奢华 | 深色背景 + 金色文字 |

### 白金配色体系
- 主金色：`#C9A84C` / `#A07830`
- 背景：`#F5F2EC`（暖白）
- 文字：`#1A1A18`（深黑）
- 边框：`#E0D8C8`

### GSAP 动画
- 首页各区块滚动入场动画
- Splash 品牌加载动画
- 卡片悬停微交互
- 按钮光效、进度条流光

### 响应式设计
- 支持 1200px / 960px / 640px 三档断点
- 移动端适配

---

## 🔧 工程化配置

### 构建脚本
```bash
npm install        # 安装依赖
npm run dev        # 开发模式（Vite HMR）
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

### Node 版本要求
`^20.19.0 || >=22.12.0`

### Vite 配置
- 路径别名：`@` → `./src`
- 插件：`@vitejs/plugin-vue`、`vite-plugin-vue-devtools`

### Vercel 部署
- 构建命令：`npm run build`
- 输出目录：`dist`
- SPA 路由回退：`rewrites` 全部指向 `index.html`

---

## 📡 后端接口概况

通过 Axios 拦截器统一管理：
- **请求拦截**：自动注入 JWT Token
- **响应拦截**：自动解析 `data` 字段，统一处理业务错误码（非 200/0）
- **401 处理**：自动清除 Token 并跳转登录页
- **错误提示**：优先使用后端 `message`，兜底硬编码提示

涉及的后端微服务前缀：
| 前缀 | 服务 |
|------|------|
| `/us/user` | 用户服务 |
| `/it` | 商品服务（分类/品牌/收藏/历史） |
| `/py/order` | 订单服务 |
| `/py/pay` | 支付服务 |
| `/cart` | 购物车服务 |
| `/pm` | 促销/优惠券服务 |
| `/ai` | AI 助手服务 |
| `/shop` | 店铺服务 |

---

## 📊 页面路由表

| 路径 | 页面 | 需登录 | 说明 |
|------|------|--------|------|
| `/` | — | — | 重定向到 `/login` |
| `/login` | LoginPage | ❌ | 用户登录 |
| `/register` | LoginPage | ❌ | 用户注册（复用登录组件） |
| `/admin` | AdminLogin | ❌ | 管理员登录 |
| `/home` | HomePage | ❌ | 首页 |
| `/search` | Search | ✅ | 商品搜索 |
| `/product/:id` | Product | ✅ | 商品详情 |
| `/cart` | Cart | ✅ | 购物车 |
| `/pay` | Pay | ✅ | 支付结算 |
| `/coupon` | Coupon | ✅ | 优惠券中心 |
| `/ai` | AiAssistant | ✅ | AI 助手 |
| `/my` | My | ✅ | 个人中心 |
| `/message` | MessagePage | ✅ | 消息中心 |
| `/notice` | NoticePage | ✅ | 系统通知 |
| `/profile/setup` | ProfileSetup | ✅ | 信息完善 |
| `/shop/register` | ShopRegister | ❌ | 商家入驻 |
| `/shop/setup` | ShopSetup | ✅ | 店铺设置 |
| `/shop/:id` | Shop | ✅ | 店铺详情 |
| `/shop/dashboard` | ShopDashboard | ✅ | 商家后台 |
| `/shop/notice` | ShopNotice | ✅ | 商家公告 |
| `/admin/dashboard` | AdminDashboard | ✅ | 管理后台 |

---

## 📝 开发规范

- **路由守卫**：`meta.requireAuth: true` 自动拦截未登录访问
- **404 兜底**：图片加载失败显示统一占位图
- **假数据模式**：开发阶段首页部分数据使用静态假数据
- **代码注释**：中文注释 + 分隔线组织代码块
- **响应解包**：Axios 拦截器自动解包 `res.data.data`，组件直接使用业务数据

---

> **最后更新**：2026-06-24
> **当前分支**：class
> **项目状态**：活跃开发中
