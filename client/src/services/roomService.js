import axiosClient from "../api/axiosClient";

const BASE_PATH = "/rooms";

export const fetchRooms = () =>
  axiosClient.get(BASE_PATH);

export const fetchRoomById = (id) =>
  axiosClient.get(`${BASE_PATH}/${id}`);

export const createRoom = (data) =>
  axiosClient.post(BASE_PATH, data);

export const updateRoom = (id, data) =>
  axiosClient.put(`${BASE_PATH}/${id}`, data);

export const deleteRoom = (id) =>
  axiosClient.delete(`${BASE_PATH}/${id}`);

export const fetchRoomSlots = (roomId, params = {}) => {
  if (!roomId) throw new Error("roomId is required");
  return axiosClient.get(`/room-slots/${encodeURIComponent(roomId)}`, { params });
};

export const getRoomSlotById = (roomSlotId) => {
  if (!roomSlotId) throw new Error("Invalid room slot ID");
  return axiosClient.get(`/room-slots/slot/${encodeURIComponent(roomSlotId)}`);
};
