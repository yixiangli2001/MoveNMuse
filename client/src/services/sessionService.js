import axiosClient from "../api/axiosClient";

const BASE = "/course-sessions";

// support filtering/pagination
export function listSessions(params = {}) {
  return axiosClient.get(BASE, { params });
}

// detail
export function getSession(id) {
  return axiosClient.get(`${BASE}/${id}`);
}

export function getCourseSession(sessionId) {
  if (!sessionId) throw new Error("Invalid session ID");
  return axiosClient.get(`${BASE}/${sessionId}`);
}

// by course
export function getSessionsByCourse(courseId) {
  return axiosClient.get(`${BASE}/course/${courseId}`);
}

// Staff: create
export function createSession(payload) {
  return axiosClient.post(BASE, payload);
}

// Staff: update
export function updateSession(id, payload) {
  return axiosClient.patch(`${BASE}/${id}`, payload);
}

// Staff: delete
export function deleteSession(id) {
  return axiosClient.delete(`${BASE}/${id}`);
}

// Book a seat
export function bookSeat(id) {
  return axiosClient.post(`${BASE}/${id}/book`);
}

export function cancelSeat(id) {
  return axiosClient.post(`${BASE}/${id}/cancel`);
}
