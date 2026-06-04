// src/api/remark.js
// 后端服务: ym-remark (端口 8094)，网关前缀 /rm
import request from '@/utils/request'

// ─── 点赞 / 取消点赞 ───
// POST /rm/likes  body: { bizId, bizType, liked }
export const toggleLike = (data) => request.post('/rm/likes', data)

// ─── 批量查询点赞状态 ───
// GET /rm/likes/list?bizIds=1&bizIds=2&bizIds=3
export const getLikeStatus = (bizIds) => request.get('/rm/likes/list', { params: { bizIds } })

// ─── 发表评论 / 回复 ───
// POST /rm/comments  body: { bizId, bizType, parentId, content }
export const postComment = (data) => request.post('/rm/comments', data)

// ─── 分页查询评论列表 ───
// GET /rm/comments/page?bizId=...&bizType=product&pageNo=1&pageSize=20
export const getComments = (params) => request.get('/rm/comments/page', { params })
