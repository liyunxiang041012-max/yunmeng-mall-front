import request from '../utils/request'

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @param {Array} data.items - 订单项列表 [{skuId, quantity}]
 * @returns {Promise} 返回订单ID
 */
export const createOrder = (data) => request.post('/or/order/create', data)

/**
 * 获取订单详情
 * @param {String} orderId - 订单ID
 * @returns {Promise} 返回订单详细信息
 */
export const getOrderDetail = (orderId) => request.get(`/or/order/detail/${orderId}`)

/**
 * 获取用户订单列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回订单列表
 */
export const getUserOrders = (params) => request.get('/or/order/list', { params })

/**
 * 取消订单
 * @param {String} orderId - 订单ID
 * @returns {Promise}
 */
export const cancelOrder = (orderId) => request.put(`/or/order/cancel/${orderId}`)

/**
 * 更新订单状态
 * @param {Object} data - {orderId, status}
 * @returns {Promise}
 */
export const updateOrderStatus = (data) => request.put('/or/order/status', data)
