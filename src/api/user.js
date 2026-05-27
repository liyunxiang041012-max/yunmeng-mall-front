import request from '../utils/request'

export const register     = (data) => request.post('/us/user/register', data)
export const login        = (data) => request.post('/us/user/login', data)
export const getUserInfo  = ()     => request.get('/us/user/info')
export const getUserDetail = ()    => request.get('/us/user/detail')   // ← 新增，包含 experience
export const sendSmsCode  = (data) => request.post('/us/user/sendCode', data)

export const getMyAddresses   = ()         => request.get('/us/address/list')
export const addAddress       = (data)     => request.post('/us/address/add', data)
export const setDefaultAddress = (id)      => request.put(`/us/address/setDefault/${id}`)
export const updateAddress    = (id, data) => request.put(`/us/address/update/${id}`, data)
export const deleteAddress    = (id)       => request.delete(`/us/address/delete/${id}`)

export const userLogout = () => request.post('/us/user/logout')