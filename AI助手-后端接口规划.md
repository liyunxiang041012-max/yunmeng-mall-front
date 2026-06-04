# 云梦 AI 助手 — 后端接口规划文档

## 一、模块概述

**模块名称**：yunmeng-ai-service（云梦 AI 助手服务）  
**端口**：`8095`  
**网关前缀**：`/ai`  
**后端基础路径**：`/chat`、`/history`  
**认证方式**：JWT Token → Header: `Authorization: Bearer <token>`  

---

## 二、核心接口设计

### 2.1 发送消息（核心接口）

```
POST /ai/chat
```

**请求体：**

```json
{
  "message": "帮我查最近订单",
  "sessionId": "ai_1717000000000_abc123"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | String | 是 | 用户输入的自然语言消息 |
| sessionId | String | 否 | 会话 ID，为空则后端创建新会话并返回 |

**响应体：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reply": "您最近有 3 笔订单：\n1. 订单 #OD20260531001 极简无线降噪耳机 — 已发货\n2. ...",
    "sessionId": "ai_1717000000000_abc123"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 业务状态码，200 成功 |
| data.reply | String | AI 回复内容（支持换行） |
| data.sessionId | String | 会话 ID |

**错误响应：**

```json
{
  "code": 500,
  "message": "AI 服务暂时不可用，请稍后重试"
}
```

---

### 2.2 获取对话历史

```
GET /ai/history?sessionId=ai_1717000000000_abc123
```

**响应体：**

```json
{
  "code": 200,
  "data": {
    "sessionId": "ai_1717000000000_abc123",
    "messages": [
      { "role": "ai", "text": "你好！我是云梦 AI 助手...", "time": "2026-05-31 10:30:00" },
      { "role": "user", "text": "帮我查订单", "time": "2026-05-31 10:31:00" },
      { "role": "ai", "text": "您最近有...", "time": "2026-05-31 10:31:02" }
    ]
  }
}
```

### 2.3 清除对话历史

```
DELETE /ai/history?sessionId=ai_1717000000000_abc123
```

---

## 三、AI 意图识别与路由

### 3.1 整体架构

```
用户消息 → 意图识别 → 调用对应后端服务 → 组装回复 → 返回前端
```

### 3.2 意图分类及对应的后端调用

| 意图 | 触发关键词/模式 | 调用的后端服务 | 接口 |
|------|---------------|--------------|------|
| **查订单** | 订单、买了什么、物流、发货、到哪了 | 订单服务 (order) | `GET /order/list` 等 |
| **推荐商品** | 推荐、有什么好的、帮我找、想买 | 商品服务 (item) | `GET /item/search` |
| **查优惠券** | 优惠券、券、折扣、满减 | 优惠券服务 (promotion) | `GET /pm/user-coupons` |
| **购物车** | 购物车、加了什么、结算 | 购物车服务 (cart) | `GET /cart/list` |
| **店铺** | 店铺、商家、品牌 | 店铺服务 (shop) | `GET /shop/detail` |
| **支付** | 支付、付款、退款 | 支付服务 (pay) | `GET /pay/status` |
| **闲聊/兜底** | 你好、谢谢、其他 | 大模型直接回复 | — |

### 3.3 意图识别方案（三选一）

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **A. 规则匹配** | 简单、快速、零成本 | 覆盖有限，生硬 | ⭐⭐ |
| **B. 大模型 API** | 理解力强，回复自然 | 需要 API Key，有延迟 | ⭐⭐⭐ |
| **C. 规则 + 大模型混合** | 先规则匹配，未命中走大模型 | 稍复杂 | ⭐⭐⭐⭐ |

**建议：先用方案 A（规则匹配）快速上线，后续升级到方案 C。**

---

## 四、Spring Boot 项目结构建议

```
yunmeng-ai-service/
├── src/main/java/com/yunmeng/ai/
│   ├── AiServiceApplication.java          # 启动类
│   ├── controller/
│   │   └── AiChatController.java           # AI 聊天控制器
│   ├── service/
│   │   ├── AiChatService.java              # 核心聊天逻辑
│   │   ├── IntentParser.java               # 意图识别
│   │   └── ReplyBuilder.java               # 回复组装
│   ├── client/                             # 远程调用其他服务
│   │   ├── OrderClient.java                # 调用订单服务
│   │   ├── ItemClient.java                 # 调用商品服务
│   │   ├── CouponClient.java               # 调用优惠券服务
│   │   └── ...
│   ├── model/
│   │   ├── ChatRequest.java                # 请求 DTO
│   │   ├── ChatResponse.java               # 响应 DTO
│   │   └── ChatMessage.java                # 消息实体
│   └── config/
│       └── WebConfig.java                  # 跨域等配置
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

### 4.1 application.yml 关键配置

```yaml
server:
  port: 8095

spring:
  application:
    name: yunmeng-ai-service
  cloud:
    gateway:
      routes:
        - id: ai-route
          uri: lb://yunmeng-ai-service
          predicates:
            - Path=/ai/**

# 调用其他服务的 base URL
yunmeng:
  services:
    order: http://localhost:8080/order
    item: http://localhost:8080/item
    cart: http://localhost:8080/cart
    coupon: http://localhost:8093/pm
    user: http://localhost:8080/us
    shop: http://localhost:8080/shop
```

---

## 五、推荐商品场景示例（核心逻辑伪代码）

```java
@Service
public class AiChatService {

    public ChatResponse handleMessage(String message, String sessionId) {
        // 1. 意图识别
        Intent intent = intentParser.parse(message);
        
        // 2. 根据意图调用对应服务获取数据
        String reply;
        switch (intent.getType()) {
            case ORDER:
                List<Order> orders = orderClient.getUserOrders(currentUserId());
                reply = replyBuilder.buildOrderReply(orders);
                break;
            case RECOMMEND:
                List<Item> items = itemClient.search(intent.getKeywords());
                reply = replyBuilder.buildRecommendReply(items);
                break;
            case COUPON:
                List<Coupon> coupons = couponClient.getUserCoupons(currentUserId());
                reply = replyBuilder.buildCouponReply(coupons);
                break;
            // ... 其他意图
            default:
                reply = "抱歉，我还不太理解你的意思。你可以试试问我：\n• 帮我查最近订单\n• 推荐一款耳机\n• 我有什么优惠券";
        }
        
        // 3. 保存对话记录（可选，存 Redis 或数据库）
        
        return new ChatResponse(reply, sessionId);
    }
}
```

---

## 六、对话历史存储方案

| 方案 | 说明 | 适用场景 |
|------|------|---------|
| **Redis** | 按 sessionId 存储，设置 TTL（如 24h） | 快速上线，适合 MVP |
| **MySQL** | 建 chat_message 表持久化 | 需要长期保留历史 |
| **前端 localStorage** | 前端自行存储（当前实现） | 无需后端参与，简单 |

**当前前端已实现 localStorage 方案**，后端可先不实现历史存储，快速上线。

---

## 七、开发优先级与排期

| 优先级 | 任务 | 预估工时 |
|--------|------|---------|
| P0 | 新建 Spring Boot 项目 + 启动类 | 0.5h |
| P0 | `POST /ai/chat` 接口 + 意图识别（规则匹配） | 2h |
| P0 | 对接订单服务（查订单场景） | 1h |
| P0 | 对接商品服务（推荐场景） | 1h |
| P0 | 对接优惠券服务（查券场景） | 1h |
| P1 | 对接购物车服务 | 0.5h |
| P1 | 对接店铺服务 | 0.5h |
| P2 | `GET /ai/history` + `DELETE /ai/history` | 1.5h |
| P2 | 升级到大模型 API（通义千问/DeepSeek） | 3h |
| P2 | 多轮对话上下文管理 | 2h |

---

## 八、网关路由配置（待添加）

在 `ym-gateway` 中添加：

```yaml
# 云梦 AI 助手路由
- id: yunmeng-ai
  uri: lb://yunmeng-ai-service
  predicates:
    - Path=/ai/**
  filters:
    - StripPrefix=0
```

---

## 九、前端对接 Checklist

| 检查项 | 状态 |
|--------|------|
| `src/api/ai.js` API 模块 | ✅ 已完成 |
| `src/views/AiAssistant.vue` 聊天页面 | ✅ 已完成 |
| `router/index.js` `/ai` 路由 | ✅ 已完成 |
| Shop.vue "联系客服" 按钮删除 | ✅ 已完成 |
| HomePage.vue AI 浮窗删除 + 跳转 | ✅ 已完成 |
| 后端服务启动后联调 | ⬜ 待进行 |
