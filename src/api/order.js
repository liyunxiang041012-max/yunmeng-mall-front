import request from '../utils/request'

// 创建订单（从购物车选中商品生成订单）
export const createOrder = (data) => request.post('/or/order/create', data)

// 获取订单详情
export const getOrderDetail = (orderId) => request.get(`/or/order/detail/${orderId}`)

// 获取用户订单列表
export const getUserOrders = (params) => request.get('/or/order/list', { params })
