import request from '../utils/request'

export const register     = (data) => request.post('/us/user/register', data)
export const login        = (data) => request.post('/us/user/login', data)
export const shopLogin    = (data) => request.post('/us/user/shop/login', data)
export const getUserInfo  = ()     => request.get('/us/user/info')
export const getUserDetail = ()    => request.get('/us/user/detail')   // ← 新增，包含 experience
export const sendSmsCode  = (data) => request.post('/us/user/sendCode', data)

export const getMyAddresses   = ()         => request.get('/us/address/list')
export const addAddress       = (data)     => request.post('/us/address/add', data)
export const setDefaultAddress = (id)      => request.put(`/us/address/setDefault/${id}`)
export const updateAddress    = (id, data) => request.put(`/us/address/update/${id}`, data)
export const deleteAddress    = (id)       => request.delete(`/us/address/delete/${id}`)

// 上传头像
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/us/user-profile/avatar', formData)
}

export const userLogout = () => request.post('/us/user/logout')

// 注册后完善个人信息（生日、性别、省份）
export const updateProfile = (data) => request.put('/us/user/profile', data)

// 检查个人信息是否已完善（city、birthday、province 均非空才返回 true）
export const getProfileStatus = () => request.get('/us/user/profile/status')

// ═══ 系统通知 ═══
export const getNoticePage = (params) => request.get('/us/user/notice/page', { params })
export const markNoticeRead = (noticeId) => request.put(`/us/user/notice/${noticeId}/read`)
export const getUnreadNoticeCount = () => request.get('/us/user/notice/unread')