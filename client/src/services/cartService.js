import axiosClient from "../api/axiosClient";

export const getCartById = (userId) =>
  axiosClient.get(`/cart/${userId}`);

export const removeCartItem = ({ cartId, itemId }) =>
  axiosClient.delete(`/cart/${cartId}/${itemId}`);

export const removeMultipleCartItems = ({ cartId, itemIds }) =>
  axiosClient.delete("/cart/removeItems", { data: { cartId, itemIds } });

export const updateCartItem = ({ cartId, itemId, occurrenceId }) =>
  axiosClient.put(`/cart/${encodeURIComponent(cartId)}/${encodeURIComponent(itemId)}`, { occurrenceId });

export const addItemToCart = (payload) =>
  axiosClient.post("/cart/addItem", payload);
