// src/api/item.js
import request from '@/utils/request'

export const getTopCategories = () => request.get('/it/categories/top')
export const getCategoryChildren = (parentId) => request.get('/it/categories/children', { params: { parentId } })
export const getBrandList = () => request.get('/it/brands/list')
export const getItemPage = (params) => request.get('/it/items/page', { params })
export const getItemDetail = (id) => request.get(`/it/items/${id}`)
// 批量获取SKU实时价格
export const getSkuPrices = (skuIds) => request.post('/it/skus/prices/batch', { skuIds })

// ─── 规格模板（商家管理用） ───
export const getSpecTemplates = (categoryId) => request.get('/it/spec-template/list', { params: { categoryId } })
export const createSpecTemplate = (data) => request.post('/it/spec-template', data)
export const updateSpecTemplate = (id, data) => request.put(`/it/spec-template/${id}`, data)
export const deleteSpecTemplate = (id) => request.delete(`/it/spec-template/${id}`)

// ─── 收藏 ───
export const toggleFavorite = (itemId) => request.post(`/it/favorites/toggle/${itemId}`)
export const checkFavorite = (itemId) => request.get(`/it/favorites/check/${itemId}`)
export const getMyFavorites = (params) => request.get('/it/favorites/my', { params })

// ─── 浏览历史 ───
export const getBrowseHistory = (params) => request.get('/it/history/my', { params })
export const deleteBrowseHistory = (id) => request.delete(`/it/history/${id}`)
export const clearBrowseHistory = () => request.delete('/it/history/clear')