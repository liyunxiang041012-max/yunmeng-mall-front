# 订单支付流程 — 前后端 API 对接文档

> **问题描述**：从商品页"立即购买"或购物车"结算"进入支付页面后，订单商品信息不显示。
> **排查方向**：`POST /py/order/create` → `GET /py/order/detail/{id}` → `GET /py/order-item/list/{id}` 这条链路中某个接口未正确返回数据。

---

## 一、完整请求链路图

```
[商品页 / 购物车]
    │
    ├─(1) POST /py/order/create          ← 创建订单
    │     请求: { items: [{skuId, quantity}] }
    │     返回: 订单ID (String)
    │
    ├─(2) 跳转 /pay?orderId=xxx
    │
    ▼
[支付页面 Pay.vue] 并行发起两个请求：
    │
    ├─(3) GET /py/order/detail/{orderId}     ← 获取订单详情
    │     返回: { id, totalAmount, payAmount, createTime, status, ... }
    │
    └─(4) GET /py/order-item/list/{orderId}  ← 获取订单商品列表 ⚠️ 关键接口
          返回: [{ itemName, price, quantity, image, skuName, ... }]
```

---

## 二、接口详细说明

### 接口 1：创建订单

```
POST /py/order/create
```

**请求体 (JSON)**：

```json
{
  "items": [
    {
      "skuId": 10001,
      "quantity": 2
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| items | Array | 是 | 订单商品列表 |
| items[].skuId | Long | 是 | SKU ID（注意不是商品 itemId，是具体规格的 SKU ID） |
| items[].quantity | Integer | 是 | 购买数量 |

**期望返回值**：`Result<String>`（订单ID字符串）

```json
{
  "code": 200,
  "msg": "ok",
  "data": "20260617001"
}
```

> ⚠️ `data` 字段直接是订单ID字符串，不是对象。前端通过 `res.data || res` 获取。

**前端调用位置**：
- `src/views/Product.vue` 第 576-611 行（立即购买 `buyNow` 函数）
- `src/views/Cart.vue` 第 453-542 行（购物车结算 `checkout` 函数）
- API 封装：`src/api/order.js` 第 9 行

---

### 接口 2：获取订单详情

```
GET /py/order/detail/{orderId}
```

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| orderId | String/Long | 订单ID（由接口1返回） |

**期望返回值**：`Result<OrderDetailVO>`

```json
{
  "code": 200,
  "msg": "ok",
  "data": {
    "id": "20260617001",
    "totalAmount": 17800,
    "payAmount": 17800,
    "discountAmount": 0,
    "status": 1,
    "createTime": "2026-06-17 14:30:00"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String/Long | 是 | 订单ID（用于页面显示订单号） |
| totalAmount | Integer | 是 | 订单总金额，单位 **分** |
| payAmount | Integer | 是 | 实付金额，单位 **分** |
| discountAmount | Integer | 否 | 优惠金额，单位 **分**，默认 0 |
| status | Integer | 是 | 订单状态：1=待支付, 2=已支付, 3=已发货, 4=已取消 |
| createTime | String | 是 | 创建时间，格式 `yyyy-MM-dd HH:mm:ss`（用于30分钟倒计时） |

**前端调用位置**：
- `src/views/Pay.vue` 第 404-406 行
- API 封装：`src/api/order.js` 第 16 行

---

### 接口 3：获取订单商品列表 ⚠️ 重点排查

```
GET /py/order-item/list/{orderId}
```

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| orderId | String/Long | 订单ID（由接口1返回） |

**期望返回值**：`Result<List<OrderItemVO>>`

```json
{
  "code": 200,
  "msg": "ok",
  "data": [
    {
      "id": 5001,
      "orderId": "20260617001",
      "skuId": 10001,
      "itemName": "极简无线降噪耳机",
      "skuName": "星空黑 / 128G",
      "image": "/images/item/101/main.jpg",
      "price": 8900,
      "quantity": 2
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 否 | 订单项ID |
| orderId | String/Long | 否 | 所属订单ID |
| skuId | Long | 否 | SKU ID |
| **itemName** | **String** | **是 ⚠️** | **商品名称（Pay.vue 用 `item.name` 显示）** |
| **skuName** | **String** | **是** | **规格名称（Pay.vue 用 `item.sku` 显示）** |
| **image** | **String** | **是 ⚠️** | **商品图片URL（Pay.vue 用 `item.image` 显示缩略图）** |
| **price** | **Integer** | **是 ⚠️** | **商品单价，单位 分（Pay.vue 前端会除以100转为元）** |
| **quantity** | **Integer** | **是 ⚠️** | **购买数量（Pay.vue 用 `item.quantity` 显示）** |

> ⚠️ **关键**：Pay.vue 模板中直接使用了 `item.name`、`item.image`、`item.sku`、`item.price`、`item.quantity` 这些字段。如果后端返回的字段名不同（比如叫 `itemName` 而非 `name`），商品信息就不会显示！

**前端调用位置**：
- `src/views/Pay.vue` 第 404-407 行
- API 封装：`src/api/order.js` 第 44 行

**前端 Pay.vue 数据解析逻辑**（第 390-467 行）：

```javascript
// 并行请求订单详情和订单商品
const [orderRes, itemsRes] = await Promise.all([
  getOrderDetail(orderId),     // GET /py/order/detail/{orderId}
  getOrderItems(orderId)       // GET /py/order-item/list/{orderId}
])

const orderData = orderRes.data || {}
const itemsData = itemsRes.data || []

// ⚠️ 关键：前端直接使用 itemsData 数组渲染
// 模板中访问 item.name、item.image、item.sku、item.price、item.quantity
payData.value.items = Array.isArray(itemsData) ? itemsData : []
```

**Pay.vue 模板渲染代码**（第 56-67 行）：

```html
<div v-for="item in payData.items" :key="item.id" class="oi-row">
  <img :src="item.image" :alt="item.name" class="oi-img" />
  <div class="oi-info">
    <p class="oi-name">{{ item.name }}</p>
    <p class="oi-sku">{{ item.sku }}</p>
  </div>
  <div class="oi-right">
    <span class="oi-price">¥{{ item.price }}</span>
    <span class="oi-qty">×{{ item.quantity }}</span>
  </div>
</div>
```

---

## 三、响应拦截器说明

前端 `src/utils/request.js` 配置了响应拦截器：

```javascript
request.interceptors.response.use(
  res => res.data,   // ← 自动解包一层 axios response
  err => { ... }
)
```

Axios 原始响应结构是 `{ data: 后端响应体, status, headers, config }`，
拦截器 `res => res.data` 会把外层的 `data` 去掉，直接返回后端的响应体。

**所以前端收到的就是后端 `Result<T>` 的完整 JSON**：
```json
{ "code": 200, "msg": "ok", "data": { ... } }
```

然后前端再通过 `res.data` 取 `data` 字段的内容。

---

## 四、排查 Checklist（给后端）

| 检查项 | 说明 |
|--------|------|
| ☐ `POST /py/order/create` 是否成功创建订单并返回订单ID | 检查日志，看看请求是否到达后端 |
| ☐ 创建订单时是否**同时保存了订单项数据** | 订单和订单项应该在一个事务中创建 |
| ☐ `GET /py/order-item/list/{orderId}` 是否返回了数据 | **这是最关键的一步**，如果这个接口返回空数组 `[]`，支付页就看不到商品 |
| ☐ 返回的字段名是否与前端一致 | 前端用 `name`/`image`/`sku`/`price`/`quantity`，后端如果返回 `itemName`/`mainImage` 等不同字段名，前端不会做映射 |
| ☐ `price` 字段单位是否为**分** | 前端会用 `item.price / 100` 转为元 |
| ☐ 接口是否返回了 `Result<T>` 包装格式 | `{ code: 200, data: [...], msg: "ok" }` |

---

## 五、最可能的问题

**问题1**：`GET /py/order-item/list/{orderId}` 返回空数组 `[]`
- 原因：创建订单时没有保存订单项数据到 `order_item` 表

**问题2**：字段名不匹配
- 后端返回 `itemName`，前端模板读 `item.name` → 显示为空
- 后端返回 `mainImage`，前端模板读 `item.image` → 图片不显示

**问题3**：`POST /py/order/create` 请求根本没到达后端
- 前端 `console.log('创建订单参数:', orderDTO)` 会在浏览器控制台打印，让前端打开 F12 控制台查看

**建议后端做的验证**：
1. 调用 `POST /py/order/create` 拿到 `orderId`
2. 用拿到的 `orderId` 调用 `GET /py/order-item/list/{orderId}`
3. 确认返回的商品列表中包含 `name`、`image`、`price`、`quantity` 字段且非空
