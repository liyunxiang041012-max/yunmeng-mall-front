import request from '../utils/request'

// 创建支付单
export const createPay = (data) => request.post('/py/pay/create', data)

// 查询支付记录列表
export const getPayList = () => request.get('/py/pay/list')

// 查询支付详情
export const getPayDetail = (id) => request.get(`/py/pay/detail/${id}`)

// 支付成功回调（静默模式——错误由调用方自行处理）
export const payCallback = (payNo) => request.post(`/py/pay/callback/${payNo}`, null, { _silent: true })

// 取消支付
export const cancelPay = (id) => request.put(`/py/pay/cancel/${id}`)