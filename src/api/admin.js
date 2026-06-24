import request from '../utils/request'

// ═══ 管理员登录 ═══
export const adminLogin = (data) => request.post('/us/user/admin/login', data)

// ═══ 用户管理 ═══
export const getUserPage = (params) => request.get('/us/user/admin/page', { params })
export const getUserDetail = (userId) => request.get(`/us/user/admin/${userId}`)
export const updateUserStatus = (userId, status) => request.put(`/us/user/admin/${userId}/status`, { status })
export const updateUserRole = (userId, role) => request.put(`/us/user/admin/${userId}/role`, { role })

// ═══ 仪表盘概览 ═══
export const getAdminOverview = () => request.get('/us/user/admin/overview')
export const getAdminRevenue = (period) => request.get('/us/user/admin/revenue', { params: { period } })

// ═══ 分类管理 ═══
/** 获取全部分类（平铺列表，含 parentId 字段） */
export const getAllCategories = () => request.get('/it/categories/admin/all')
/** 新增分类 { name, parentId?, sort? } */
export const createCategory = (data) => request.post('/it/categories/admin', data)
/** 编辑分类 { name, sort? } */
export const updateCategory = (id, data) => request.put(`/it/categories/admin/${id}`, data)
/** 删除分类 */
export const deleteCategory = (id) => request.delete(`/it/categories/admin/${id}`)

// ═══ 系统通知 ═══
/** 管理员发送系统通知 { title, content, targetRole } */
export const sendAdminNotice = (data) => request.post('/us/user/admin/notice', data)

// ═══ 商品审核 ═══
/** 管理员商品分页（status: 2=待审核 1=已上架 0=已下架，不传=全部） */
export const getAdminItemPage = (params) => request.get('/it/shop/admin/item/page', { params })
/** 审核通过 */
export const approveItem = (id) => request.put(`/it/shop/admin/item/${id}/approve`)
/** 审核驳回 */
export const rejectItem = (id) => request.put(`/it/shop/admin/item/${id}/reject`)
/** 管理员上下架商品 */
export const toggleAdminItemStatus = (id) => request.put(`/it/shop/admin/item/toggle-status/${id}`)

// ═══ 商家管理 ═══
/** 商家列表 */
export const getShopPage = (params) => request.get('/it/shop/admin/page', { params })
/** 商家详情 */
export const getShopDetail = (id) => request.get(`/it/shop/admin/${id}`)
/** 编辑商家 */
export const updateShop = (id, data) => request.put(`/it/shop/admin/${id}`, data)
/** 开关营业状态 */
export const toggleShopStatus = (id) => request.put(`/it/shop/admin/toggle-status/${id}`)
