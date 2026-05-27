// src/api/item.js
import request from '@/utils/request'

export const getTopCategories = () => request.get('/it/categories/top')
export const getItemPage = (params) => request.get('/it/items/page', { params })
export const getItemDetail = (id) => request.get(`/it/items/${id}`)
// 批量获取SKU实时价格
export const getSkuPrices = (skuIds) => request.post('/it/skus/prices/batch', { skuIds })