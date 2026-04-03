import axiosClient from "../api/axiosClient";

// support listing with optional filters
export function listCourses(params) {
  return axiosClient.get("/courses", { params });
}

//details by id
export function getCourse(id) {
  return axiosClient.get(`/courses/${id}`);
}

// create new course (needs staff auth)
export function createCourse(payload) {
  return axiosClient.post("/courses", payload);
}

// update course by id (needs staff auth)
export function updateCourse(courseId, payload) {
  return axiosClient.put(`/courses/${encodeURIComponent(courseId)}`, payload);
}

//  delete course by id (needs staff auth)
export function deleteCourse(courseId) {
  return axiosClient.delete(`/courses/${encodeURIComponent(courseId)}`);
}




