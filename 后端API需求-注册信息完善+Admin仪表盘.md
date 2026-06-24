# 前端改动完成 — 后端需对接 API 清单

> **状态**：前端已全部完成，构建通过 ✅  
> **日期**：2026-06-17（更新）

---

## 一、前端改动概览

### Part A：新用户/老用户信息完善（方案 B）

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/views/ProfileSetup.vue` | **新建** | 信息完善页（生日/性别/省份+城市联动，可跳过但每次登录会再弹） |
| `src/api/user.js` | 修改 | 新增 `updateProfile` 调用 `PUT /us/user/profile`；复用 `getUserDetail` 检查是否已完善 |
| `src/router/index.js` | 修改 | 新增路由 `/profile/setup`，需要登录 |
| `src/components/LoginPage.vue` | 修改 | 注册成功 → 跳 `/profile/setup`；**登录后调用 `getUserDetail` 检查 birthday/gender/province，任一缺失则跳 `/profile/setup`** |
| `src/views/RegisterPage.vue` | 修改 | 注册成功后跳转 `/profile/setup`（原 `/home`） |

> **流程说明**：用户注册完直接跳信息完善页；老用户每次登录也检查，信息不全就跳过去。用户可点"跳过"进入首页，但下次登录继续弹，直到三个字段全部填完为止。

### Part B：Admin 仪表盘真实数据

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/api/admin.js` | 修改 | 新增 `getAdminOverview`、`getAdminRevenue` |
| `src/views/AdminDashboard.vue` | 修改 | statCards / 收入趋势 / 用户画像 / 订单 / 热销 → 全部改为从 API 拉数据 |

---

## 二、后端需要新增的 API

### API 1. `PUT /us/user/profile`

**用途**：注册后完善个人信息，或后续修改。

```
请求 Body（全部可选，传什么改什么）
{
  "birthday": "1995-06-15",   // 生日，格式 yyyy-MM-dd
  "gender": "male",           // 性别，枚举值：male / female
  "province": "广东省",        // 所在省份
  "city": "深圳市"             // 所在城市（新增）
}
```

```
成功响应
{ "code": 200, "message": "success", "data": null }
```

> ⚠️ **前端登录检查依赖**：`getUserDetail` 返回的 `birthday`/`gender`/`province` 三个字段，任一为空字符串或 null 即视为未完善，会跳转信息完善页。

---

### API 2. `GET /us/user/admin/overview`

**用途**：Admin 仪表盘概览页的全部数据，一次拉完。

> ⚠️ 前端会在进入概览页时自动调用，含 loading 状态，失败时保留占位符 "—"

```
响应格式
{
  "code": 200,
  "data": {
    "stats": {
      "gmv":        { "value": "¥128,450",  "trend": 12.5,  "delta": "¥14,280" },
      "orders":     { "value": "3,842",     "trend": 8.3,   "delta": "294" },
      "users":      { "value": "26,580",    "trend": 15.2,  "delta": "3,510" },
      "conversion": { "value": "6.8%",      "trend": -1.2,  "delta": "0.1%" }
    },
    "userPortrait": {
      "gender": { "male": 58, "female": 42 },
      "ages": [
        { "label": "18-24", "percent": 28, "color": "#D9A53C" },
        { "label": "25-34", "percent": 42, "color": "#1A1712" },
        { "label": "35-44", "percent": 18, "color": "#8C6308" },
        { "label": "45-54", "percent": 8,  "color": "#9B9484" },
        { "label": "55+",   "percent": 4,  "color": "#C0B8A8" }
      ],
      "regions": [
        { "name": "广东", "percent": 22 },
        { "name": "浙江", "percent": 18 },
        { "name": "江苏", "percent": 15 },
        { "name": "上海", "percent": 12 },
        { "name": "北京", "percent": 10 }
      ]
    },
    "consumeLevels": [
      { "label": "高消费",   "percent": 55, "color": "#D9A53C" },
      { "label": "中等消费", "percent": 25, "color": "#1A1712" },
      { "label": "低消费",   "percent": 20, "color": "#8C6308" }
    ],
    "recentOrders": [
      { "id": 1, "orderNo": "YM20260617001", "user": "张*明", "product": "手工皮具·托特包", "amount": "398.00", "status": "已付款", "statusClass": "paid", "time": "14:32" },
      { "id": 2, "orderNo": "YM20260617002", "user": "李*华", "product": "设计师灯具·落地灯", "amount": "1,280.00", "status": "已发货", "statusClass": "shipped", "time": "13:15" },
      { "id": 3, "orderNo": "YM20260617003", "user": "王*芳", "product": "天然香薰蜡烛套装", "amount": "168.00", "status": "待付款", "statusClass": "pending", "time": "11:48" },
      { "id": 4, "orderNo": "YM20260616004", "user": "陈*宇", "product": "北欧风陶瓷花瓶", "amount": "256.00", "status": "已完成", "statusClass": "done", "time": "昨天" },
      { "id": 5, "orderNo": "YM20260616005", "user": "赵*琪", "product": "真丝睡衣套装", "amount": "598.00", "status": "已取消", "statusClass": "cancel", "time": "昨天" }
    ],
    "topProducts": [
      { "name": "手工皮具托特包", "sales": "1,280", "revenue": "509,440", "color": "#FDE8C8" },
      { "name": "设计师落地灯",   "sales": "856",  "revenue": "1,095,680", "color": "#DBEAFE" },
      { "name": "天然香薰蜡烛",   "sales": "2,340", "revenue": "393,120", "color": "#E8D5F5" },
      { "name": "真丝睡衣套装",   "sales": "1,102", "revenue": "658,996", "color": "#D5F0E2" },
      { "name": "北欧陶瓷花瓶",   "sales": "980",  "revenue": "250,880", "color": "#FCE7F3" }
    ]
  }
}
```

**字段说明**：

| 数据块 | 说明 |
|--------|------|
| `stats.gmv` | 平台 GMV，`value` 展示用字符串，`trend` 正=涨负=跌，`delta` 较昨日变化 |
| `stats.orders` | 总订单数 |
| `stats.users` | 活跃用户数 |
| `stats.conversion` | 转化率（百分比字符串） |
| `userPortrait.gender` | 男女比例，加起来应 = 100 |
| `userPortrait.ages` | 年龄段分布，`percent` 加起来应 = 100，`color` 固定配色 |
| `userPortrait.regions` | 地域 TOP5，`percent` 加起来可 < 100 |
| `consumeLevels` | 消费水平分布，`percent` 加起来应 = 100 |
| `recentOrders` | 近期 5 条订单，`statusClass` 为 `paid/shipped/pending/done/cancel` |
| `topProducts` | 热销商品 TOP5，`color` 卡片底色 |

---

### API 3. `GET /us/user/admin/revenue?period=7`

**用途**：收入趋势图数据。前端切换 7天/30天/季度 时会分别请求。

```
请求参数
period = 7   →  7天数据
period = 30  →  30天数据
period = 90  →  季度数据
```

```
响应格式
{
  "code": 200,
  "data": {
    "values": [4200, 3800, 5100, 4600, 6800, 7200, 12850]
  }
}
```

> `values` 是数字数组，长度对应 period（7天=7个，30天=30个，季度=约12个）。前端 SVG 折线图会自适应数据范围。

---

## 三、现有 API 路径参考（避免重复）

所有 API 遵循项目已有的路径规范：

```
用户端：  /us/user/...        (api/user.js)
管理端：  /us/user/admin/...  (api/admin.js)
商品端：  /it/items/...       (api/item.js)
店铺端：  /it/shop/...        (api/shop.js)
订单端：  /us/order/...       (api/order.js)
```

本次新增的 3 个 API 已严格遵循此规范，不会乱加路径。
