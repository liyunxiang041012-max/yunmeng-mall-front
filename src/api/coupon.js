// src/api/coupon.js
// 后端服务: ym-promotion，网关前缀 /pm
import request from '@/utils/request'

// ─── 发放中的优惠券列表（用户端可领券中心） ───
// GET /pm/coupons/list  响应是数组，非分页
export const getAvailableCoupons = () => request.get('/pm/coupons/list')

// ─── 领取优惠券 ───
// POST /pm/user-coupons/{couponId}/receive
export const claimCoupon = (couponId) => request.post(`/pm/user-coupons/${couponId}/receive`)

// ─── 兑换优惠券（输入兑换码） ───
// POST /pm/user-coupons/{code}/exchange
export const redeemCoupon = (code) => request.post(`/pm/user-coupons/${code}/exchange`)

// ─── 分页查询我的优惠券 ───
// GET /pm/user-coupons/page?pageNo=1&pageSize=20&status=1 (1=未使用,2=已使用,3=已过期)
export const getMyCoupons = (params) => request.get('/pm/user-coupons/page', { params })

// ─── 使用优惠券（创建订单时调用） ───
// POST /pm/user-coupons/{id}/use?orderAmount=15000
export const useCoupon = (id, orderAmount) => request.post(`/pm/user-coupons/${id}/use`, null, { params: { orderAmount } })
