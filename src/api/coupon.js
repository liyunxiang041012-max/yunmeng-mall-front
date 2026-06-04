// src/api/coupon.js
// 后端服务: ym-promotion (端口 8093)，网关前缀 /pm
import request from '@/utils/request'

// ─── 发放中的优惠券列表（用户端可领券中心） ───
// GET /pm/coupons/list  响应是数组，非分页
export const getAvailableCoupons = () => request.get('/pm/coupons/list')

// ─── 领取优惠券 ───
// POST /pm/user-coupons/{couponId}/receive
export const claimCoupon = (couponId) => request.post(`/pm/user-coupons/${couponId}/receive`)

// ─── 兑换优惠券（输入兑换码） ───
// POST /pm/user-coupons/{code}/exchange  code 为10位 Base32
export const redeemCoupon = (code) => request.post(`/pm/user-coupons/${code}/exchange`)

// ─── 分页查询我的优惠券 ───
// GET /pm/user-coupons/page?pageNo=1&pageSize=20&status=1
export const getMyCoupons = (params) => request.get('/pm/user-coupons/page', { params })
