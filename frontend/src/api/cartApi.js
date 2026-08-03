import api from './client';

export const getCart = () => api.get('/cart');
export const addCartItem = (payload) => api.post('/cart/items', payload);
export const updateCartItem = (cartLineId, payload) => api.put(`/cart/items/${cartLineId}`, payload);
export const removeCartItem = (cartLineId) => api.delete(`/cart/items/${cartLineId}`);
export const clearCart = () => api.delete('/cart');