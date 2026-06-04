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