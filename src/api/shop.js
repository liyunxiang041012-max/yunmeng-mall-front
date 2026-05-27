// src/api/shop.js
import request from '../utils/request'

export const getShopInfo = (shopId) =>  request.get(`/it/shop/cart/${shopId}`)