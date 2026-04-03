import axiosClient from "../api/axiosClient";

const BASE_PATH = "/instructors";

// support filtering/pagination
export function listInstructors(params) {
  return axiosClient.get(BASE_PATH, { params });
}

// detail
export function getInstructor(id) {
  return axiosClient.get(`${BASE_PATH}/${id}`);
}

// create
export function createInstructor(payload) {
  // payload: { name, email, phone, bio, status }
  return axiosClient.post(BASE_PATH, payload);
}

// update
export function updateInstructor(id, payload) {
  return axiosClient.put(`${BASE_PATH}/${id}`, payload);
}

// delete
export function deleteInstructor(id) {
  return axiosClient.delete(`${BASE_PATH}/${id}`);
}
