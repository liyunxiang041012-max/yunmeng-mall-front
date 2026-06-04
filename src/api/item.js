// src/api/item.js
import request from '@/utils/request'

export const getTopCategories = () => request.get('/it/categories/top')
export const getItemPage = (params) => request.get('/it/items/page', { params })
export const getItemDetail = (id) => request.get(`/it/items/${id}`)
// 批量获取SKU实时价格
export const getSkuPrices = (skuIds) => request.post('/it/skus/prices/batch', { skuIds })

// ─── 收藏 ───
export const toggleFavorite = (itemId) => request.post(`/it/favorites/toggle/${itemId}`)
export const checkFavorite = (itemId) => request.get(`/it/favorites/check/${itemId}`)
export const getMyFavorites = (params) => request.get('/it/favorites/my', { params })

// ─── 浏览历史 ───
export const getBrowseHistory = (params) => request.get('/it/history/my', { params })
export const deleteBrowseHistory = (id) => request.delete(`/it/history/${id}`)
export const clearBrowseHistory = () => request.delete('/it/history/clear')