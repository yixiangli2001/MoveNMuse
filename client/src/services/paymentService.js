import axiosClient from "../api/axiosClient";

export const getPaymentHistoryById = (userId) =>
  axiosClient.get("/payment/getPayments", { params: { userId } });

export const getAllPaymentHistory = () =>
  axiosClient.get("/payment/getAllPayments");

export const processPayment = (payload) =>
  axiosClient.post("/payment/processPayment", payload);

export const getPaymentDetails = (userId) =>
  axiosClient.get("/payment-details", { params: { userId } });

export const addPaymentDetail = (payload) =>
  axiosClient.post("/payment-details/addPaymentDetail", payload);

export const setDefaultPaymentDetail = (payload) =>
  axiosClient.post("/payment-details/setDefault", payload);

export const deletePaymentDetail = (paymentDetailId) =>
  axiosClient.delete(`/payment-details/${encodeURIComponent(paymentDetailId)}`);
