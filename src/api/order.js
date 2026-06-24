import request from '../utils/request'

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @param {Array} data.items - 订单项列表 [{skuId, quantity}]
 * @returns {Promise} 返回 { orderId, expireTime } 或 orderId 字符串
 */
export const createOrder = (data) => request.post('/py/order/create', data)

/**
 * 获取订单详情
 * @param {String} orderId - 订单ID
 * @returns {Promise} 返回订单详细信息
 */
export const getOrderDetail = (orderId) => request.get(`/py/order/detail/${orderId}`)

/**
 * 获取用户订单列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回订单列表
 */
export const getUserOrders = (params) => request.get('/py/order/list', { params })

/**
 * 取消订单
 * @param {String} orderId - 订单ID
 * @returns {Promise}
 */
export const cancelOrder = (orderId) => request.put(`/py/order/cancel/${orderId}`)

/**
 * 更新订单状态
 * @param {Object} data - {orderId, status}
 * @returns {Promise}
 */
export const updateOrderStatus = (data) => request.put('/py/order/status', data)

/**
 * 获取订单明细（商品列表）
 * @param {String} orderId - 订单ID
 * @returns {Promise} 返回订单商品列表
 */
export const getOrderItems = (orderId) => request.get(`/py/order-item/list/${orderId}`)
