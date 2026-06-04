# My.vue 页面 — 后端接口需求

> 以下 2 个接口目前前端已调用但始终无法获取到数据，页面显示为空，请后端排查并实现。

---

## 1. 浏览历史（历史浏览 + 足迹）

### 基本信息

| 项目 | 内容 |
|------|------|
| **接口路径** | `GET /it/history/my` |
| **认证** | 需要（Header: `Authorization: Bearer <token>`） |
| **前端调用** | `src/api/item.js` → `getBrowseHistory()` |
| **前端页面** | `src/views/My.vue` → `loadHistory()` |

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 无需传参 | - | - | 根据 token 获取当前用户浏览记录 |

### 期望响应格式

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "mainImage": "/uploads/xxx.jpg",
      "name": "商品名称",
      "price": 12900,
      "createTime": "2026-05-28T14:30:00"
    }
  ]
}
```

### 返回字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | ✅ | 浏览记录 ID |
| `mainImage` | String | ✅ | 商品主图（相对路径如 `/uploads/xxx.jpg`，前端自动拼接 `http://localhost:8080`） |
| `name` | String | ✅ | 商品名称 |
| `price` | Long | ✅ | 商品价格，**单位：分**（前端会 `/100` 转元） |
| `createTime` | String | ✅ | 浏览时间（ISO 8601 格式，如 `2026-05-28T14:30:00`） |

> ⚠️ `footprint`（足迹）在前端直接取 `historyItems.length`，即浏览历史的总条数，不需要单独接口。

---

## 2. 我的收藏

### 基本信息

| 项目 | 内容 |
|------|------|
| **接口路径** | `GET /it/favorites/my` |
| **认证** | 需要（Header: `Authorization: Bearer <token>`） |
| **前端调用** | `src/api/item.js` → `getMyFavorites()` |
| **前端页面** | `src/views/My.vue` → `loadFavorites()` |

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 无需传参 | - | - | 根据 token 获取当前用户收藏列表 |

### 期望响应格式

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "itemId": 100,
      "mainImage": "/uploads/xxx.jpg",
      "name": "商品名称",
      "price": 12900
    }
  ]
}
```

### 返回字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | ✅ | 收藏记录 ID |
| `itemId` | Long | ✅ | 商品 ID（用于取消收藏时调用 toggle 接口） |
| `mainImage` | String | ✅ | 商品主图（相对路径） |
| `name` | String | ✅ | 商品名称 |
| `price` | Long | ✅ | 商品价格，**单位：分** |

---

## 3. 已有的辅助接口（可能已实现，确认下）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 取消收藏 | `POST` | `/it/favorites/toggle/{itemId}` | 收藏/取消收藏切换 |
| 删除浏览记录 | `DELETE` | `/it/history/{id}` | 删除单条浏览记录 |
| 清空浏览记录 | `DELETE` | `/it/history/clear` | 清空全部浏览记录 |

---

## 补充说明

- 前端 baseURL 为 `http://localhost:8080`
- 响应拦截器已做 `res => res.data`，所以后端返回的 `{ code: 200, data: [...] }` 中 `data` 字段才是前端实际收到的内容
- 如果返回空数组 `[]`，页面会显示"暂无浏览记录"/"暂无收藏"
- 如果返回格式不对，页面同样显示为空（前端 catch 了错误，现在已加上 `console.error`，可在浏览器控制台查看具体错误）
