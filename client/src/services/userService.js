import axiosClient from "../api/axiosClient";

export const getUserProfile = () =>
  axiosClient.get("/user/profile");

export const getAccount = () =>
  axiosClient.get("/account");

export const updateAccount = (payload) =>
  axiosClient.put("/account", payload);
