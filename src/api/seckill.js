// src/api/seckill.js
// 秒杀服务，网关前缀 /pm
import request from '@/utils/request'

// ─── 用户端 ───

/** 查询当前进行中的秒杀活动及商品 */
// GET /pm/flash-sales  响应是数组 [{id, name, startTime, endTime, items:[...]}]
export const getSeckillList = () => request.get('/pm/flash-sales')

/** 查询秒杀商品详情 */
// GET /pm/flash-sales/items/{itemId}
export const getSeckillItemDetail = (itemId) => request.get(`/pm/flash-sales/items/${itemId}`)

/** 秒杀下单 */
// POST /pm/flash-sales/items/{itemId}/order
export const seckillOrder = (itemId) => request.post(`/pm/flash-sales/items/${itemId}/order`)

// ─── 管理员端 ───

/** 创建秒杀活动 */
// POST /pm/admin/flash-sales  body: { flashSale:{...}, items:[...] }
export const adminCreateSeckill = (data) => request.post('/pm/admin/flash-sales', data)

/** 开始活动 */
// PUT /pm/admin/flash-sales/{id}/start
export const adminStartSeckill = (id) => request.put(`/pm/admin/flash-sales/${id}/start`)

/** 结束活动 */
// PUT /pm/admin/flash-sales/{id}/end
export const adminEndSeckill = (id) => request.put(`/pm/admin/flash-sales/${id}/end`)
