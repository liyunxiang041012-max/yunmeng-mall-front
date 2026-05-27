import request from '../utils/request'

// 创建支付单
export const createPay = (data) => request.post('/py/pay/create', data)

// 查询支付记录列表
export const getPayList = () => request.get('/py/pay/list')

// 查询支付详情
export const getPayDetail = (id) => request.get(`/py/pay/detail/${id}`)

// 取消支付
export const cancelPay = (id) => request.put(`/py/pay/cancel/${id}`)