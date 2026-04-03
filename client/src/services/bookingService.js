import axiosClient from "../api/axiosClient";

export const createBooking = ({ userId, courseId }) => {
  if (!userId || !courseId) throw new Error("Invalid booking data");
  return axiosClient.post("/bookings", { userId, courseId });
};

export const listBookingsByUser = (userId, params = {}) => {
  if (!userId) throw new Error("Invalid user ID");
  return axiosClient.get("/bookings", { params: { userId, ...params } });
};

export const createNewBooking = (payload) =>
  axiosClient.post("/bookings/newBooking", payload);

export const getBookingDetails = (bookingId) =>
  axiosClient.get(`/bookings/${bookingId}`);
