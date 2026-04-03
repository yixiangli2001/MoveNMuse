import { CourseService } from "../services/course.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/** GET /api/courses */
export const listCourses = asyncHandler(async (req, res) => {
    const { kw, category, level, page, pageSize } = req.query;
    const result = await CourseService.listCourses({
        kw,
        category,
        level,
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10
    });
    return res.status(200).json(new ApiResponse(200, result, "Courses fetched successfully"));
});

/** GET /api/courses/:id */
export const getCourse = asyncHandler(async (req, res) => {
    const course = await CourseService.getCourse(req.params.id);
    return res.status(200).json(new ApiResponse(200, course, "Course fetched successfully"));
});

/** POST /api/courses */
export const createCourse = asyncHandler(async (req, res) => {
    const course = await CourseService.createCourse(req.body);
    return res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
});

/** DELETE /api/courses/:id */
export const deleteCourse = asyncHandler(async (req, res) => {
    await CourseService.deleteCourse(req.params.id);
    return res.status(200).json(new ApiResponse(200, null, "Course deleted successfully"));
});

/** PUT /api/courses/:id */
export const updateCourse = asyncHandler(async (req, res) => {
    const course = await CourseService.updateCourse(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, course, "Course updated successfully"));
});

/** GET /api/courses/open */
export const listOpenCourses = asyncHandler(async (req, res) => {
    const courses = await CourseService.listOpenCourses();
    return res.status(200).json(new ApiResponse(200, courses, "Open courses fetched successfully"));
});
