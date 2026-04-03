// Jiayu
import mongoose from "mongoose";
import Instructor from "../models/instructor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// create new instructor
export const createInstructor = asyncHandler(async (req, res) => {
    const { name, email, phone, status } = req.body;

    if (!name || !email) {
        throw new ApiError(400, "Name and Email are required");
    }

    const doc = await Instructor.create({ name, email, phone, status });
    return res.status(201).json(new ApiResponse(201, { id: doc._id }, "Instructor created successfully"));
});

// update instructor
export const updateInstructor = asyncHandler(async (req, res) => {
    const query = buildIdQuery(req.params.id);
    const doc = await Instructor.findOneAndUpdate(query, req.body, {
        new: true,
    });
    if (!doc) throw new ApiError(404, "Instructor not found");
    return res.status(200).json(new ApiResponse(200, doc, "Instructor updated successfully"));
});

// disable instructor
export const disableInstructor = asyncHandler(async (req, res) => {
    const query = buildIdQuery(req.params.id);
    const doc = await Instructor.findOneAndUpdate(
        query,
        { status: "inactive" },
        { new: true }
    );
    if (!doc) throw new ApiError(404, "Instructor not found");
    return res.status(200).json(new ApiResponse(200, doc, "Instructor disabled successfully"));
});

// list all instructors
export const listInstructors = asyncHandler(async (req, res) => {
    const docs = await Instructor.find().sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, docs, "Instructors fetched successfully"));
});

// get instructor by id (supports both _id and instructorId)
export const getInstructorById = asyncHandler(async (req, res) => {
    const query = buildIdQuery(req.params.id);
    const doc = await Instructor.findOne(query);
    if (!doc) throw new ApiError(404, "Instructor not found");
    return res.status(200).json(new ApiResponse(200, doc, "Instructor fetched successfully"));
});

// helper to build query for _id or instructorId
function buildIdQuery(id) {
    if (mongoose.isValidObjectId(id)) return { _id: id };
    const n = Number(id);
    if (!isNaN(n)) return { instructorId: n };
    return { _id: "__never_match__" };
}
