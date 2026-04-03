import axiosClient from "../api/axiosClient";

export const login = ({ email, password }) =>
  axiosClient.post("/auth/login", { email, password });

export const registerUser = (formData) =>
  axiosClient.post("/user/register", formData);

export const changePassword = (formData) =>
  axiosClient.post("/user/changePassword", formData);
