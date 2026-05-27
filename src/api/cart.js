import request from '../utils/request'

export const addToCart = (data) => request.post('/ca/cart/add', data)
export const getCartList = () => request.get('/ca/cart/list')
export const updateCartItem = (data) => request.put('/ca/cart/update', data)
export const deleteCartItems = (ids) => request.delete('/ca/cart/delete', { data: { ids } })