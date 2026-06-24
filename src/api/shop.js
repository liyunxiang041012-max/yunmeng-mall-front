// src/api/shop.js
import request from '../utils/request'

// 获取店铺详情
export const getShopDetail = (shopId) => request.get(`/it/shop/${shopId}`)

// 获取店铺商品列表（复用商品分页接口，按shopId过滤）
export const getShopItems = (shopId, params) => {
  return request.get('/it/items/page', { params: { shopId, ...params } })
}

// 关注/取消关注店铺
export const toggleFollowShop = (shopId) => request.post(`/it/shop/follow/toggle/${shopId}`)

// 检查是否已关注店铺
export const checkFollowShop = (shopId) => request.get(`/it/shop/follow/check/${shopId}`)

// 获取我的关注列表
export const getMyFollows = (params) => request.get('/it/shop/follow/my', { params })

// 商家入驻注册（阶段一：仅创建用户 role=1，不创建 Shop）
export const createShop = (data) => request.post('/it/shop/register', data)

// 查询店铺状态（阶段二：登录后判断是否需要设置店铺）
export const getShopStatus = () => request.get('/it/shop/status')

// 店铺入驻（设置店铺信息，已入驻再次调用=更新）
export const setupShop = (data) => request.post('/it/shop/entry', data)

// 上传店铺头像
export const uploadShopAvatar = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/it/shop/upload/avatar', formData)
}

// 查询店铺粉丝数
export const getFansCount = (shopId) => request.get(`/it/shop/follow/fans-count/${shopId}`)

// ══════════════════════════════════════════
// 商家后台 - 商品管理（/it/shop/item）
// ══════════════════════════════════════════

// 分页查询我的商品
export const getShopProductPage = (params) => request.get('/it/shop/item/page', { params })

// 商品详情
export const getShopProductDetail = (itemId) => request.get(`/it/shop/item/${itemId}`)

// 新增商品（默认下架 status=0）
export const createShopProduct = (data) => request.post('/it/shop/item', data)

// 编辑商品（字段可选，传哪个改哪个）
export const updateShopProduct = (itemId, data) => request.put(`/it/shop/item/${itemId}`, data)

// 删除商品（软删除 deleted=1）
export const deleteShopProduct = (itemId) => request.delete(`/it/shop/item/${itemId}`)

// 上架/下架切换
export const toggleShopProductStatus = (itemId) => request.put(`/it/shop/item/toggle-status/${itemId}`)

// 上传商品图片（OSS 直传）
export const uploadProductImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/it/shop/item/upload/image', formData)
}

// ══════════════════════════════════════════
// 商家后台 - 订单管理
// ══════════════════════════════════════════

// 获取店铺订单列表
export const getShopOrders = (params) => request.get('/it/shop/orders', { params })

// 获取店铺订单详情
export const getShopOrderDetail = (orderId) => request.get(`/it/shop/orders/${orderId}`)

// 发货
export const shipOrder = (orderId, data) => request.put(`/it/shop/orders/${orderId}/ship`, data)

// ══════════════════════════════════════════
// 商家后台 - 数据统计
// ══════════════════════════════════════════

// 获取店铺统计数据（概览卡片）
export const getShopStats = () => request.get('/it/shop/stats')

// 获取收入趋势
export const getRevenueTrend = (period) => request.get('/it/shop/stats/revenue', { params: { period } })