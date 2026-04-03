// Jiayu
import mongoose from "mongoose";
import { CourseSession } from "../models/courseSession.model.js";
import Instructor from "../models/instructor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// helper to build match object by id (ObjectId or numeric sessionId)
function buildIdMatch(id) {
  if (!id && id !== 0) return null;
  if (typeof id === "string" && mongoose.isValidObjectId(id)) {
    return { _id: new mongoose.Types.ObjectId(id) };
  }
  const n = Number(id);
  if (Number.isFinite(n)) return { sessionId: n };
  return null;
}

function parsePositiveInt(v, def) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

// aggregation stages to keep only sessions with active instructors
const AGG_KEEP_ACTIVE_INSTRUCTOR = [
  {
    $lookup: {
      from: "instructors",
      localField: "instructorId",
      foreignField: "instructorId",
      as: "inst",
    },
  },
  { $unwind: { path: "$inst", preserveNullAndEmptyArrays: false } }, // must match
  { $match: { "inst.status": "active" } },
  { $project: { inst: 0 } },
];

// GET /api/course-sessions
export const listCourseSessions = asyncHandler(async (req, res) => {
    let {
      courseId,
      instructorId,
      status,
      from, // string or yyyy-mm-dd
      to, // string or yyyy-mm-dd
      page = 1,
      limit = 10,
      sort = "startTime",
      order = "asc",
    } = req.query;

    page = parsePositiveInt(page, 1);
    limit = Math.min(parsePositiveInt(limit, 10), 100);
    // build match object
    const match = {};
    if (courseId !== undefined) {
      const n = Number(courseId);
      if (Number.isFinite(n)) match.courseId = n;
    }
    // filter by instructorId if provided
    if (instructorId !== undefined) {
      const n = Number(instructorId);
      if (Number.isFinite(n)) match.instructorId = n;
    }
    // filter by status if provided
    if (status) match.status = status;
    // filter by date range if provided
    if (from || to) {
      match.startTime = {};
      if (from) match.startTime.$gte = new Date(from);
      if (to) match.startTime.$lte = new Date(to);
    }

    const sortStage = { [sort]: order?.toLowerCase() === "desc" ? -1 : 1 };

    const basePipeline = [{ $match: match }, { $sort: sortStage }];
    // paginated aggregation with active instructor filter
    const pagePipeline = [
      ...basePipeline,
      ...AGG_KEEP_ACTIVE_INSTRUCTOR,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];
    // count aggregation
    const countPipeline = [
      ...basePipeline,
      ...AGG_KEEP_ACTIVE_INSTRUCTOR,
      { $count: "total" },
    ];
    // execute both in parallel
    const [items, totalArr] = await Promise.all([
      CourseSession.aggregate(pagePipeline),
      CourseSession.aggregate(countPipeline),
    ]);
    // extract total count
    const total = totalArr?.[0]?.total || 0;
    return res.status(200).json(new ApiResponse(200, { total, page, pageSize: limit, items }, "Course sessions fetched successfully"));
});

//only list by courseId without pagination with active instructor
export const listByCourseId = asyncHandler(async (req, res) => {
    const n = Number(req.params.courseId);
    if (!Number.isFinite(n))
      throw new ApiError(400, "Invalid courseId");

    const items = await CourseSession.aggregate([
      { $match: { courseId: n } },
      { $sort: { startTime: 1 } },
      ...AGG_KEEP_ACTIVE_INSTRUCTOR,
    ]);

    return res.status(200).json(new ApiResponse(200, items, "Course sessions fetched successfully"));
});

//if by id, return single item with active instructor
export const getCourseSession = asyncHandler(async (req, res) => {
    const match = buildIdMatch(req.params.id);
    if (!match)
      throw new ApiError(404, "CourseSession not found");

    const rows = await CourseSession.aggregate([
      { $match: match },
      ...AGG_KEEP_ACTIVE_INSTRUCTOR,
    ]);
    const doc = rows?.[0];
    if (!doc) throw new ApiError(404, "CourseSession not found");

    return res.status(200).json(new ApiResponse(200, doc, "Course session fetched successfully"));
});

// only staff can create course sessions
export const createCourseSession = asyncHandler(async (req, res) => {
    const {
      sessionId,
      courseId,
      instructorId,
      startTime,
      endTime,
      capacity,
      price,
      status = "Scheduled",
      location,
      notes,
      duration: bodyDuration,
    } = req.body || {};

    if (!Number.isFinite(Number(courseId))) {
      throw new ApiError(400, "courseId is required (number)");
    }
    if (!Number.isFinite(Number(instructorId))) {
      throw new ApiError(400, "instructorId is required (number)");
    }

    // instructor must be active
    const inst = await Instructor.findOne({
      instructorId: Number(instructorId),
      status: "active",
    })
      .select("instructorId status")
      .lean();
    if (!inst)
      throw new ApiError(400, "Instructor is not active or does not exist");

    const st = new Date(startTime);
    const et = new Date(endTime);

    const computed = Math.round((et - st) / (1000 * 60));
    const duration = Number.isFinite(Number(bodyDuration)) && Number(bodyDuration) > 0
      ? Math.floor(Number(bodyDuration))
      : computed;

    if (!Number.isFinite(duration) || duration < 1) {
      throw new ApiError(400, "duration must be >= 1 (minutes)");
    }

    // validate startTime and endTime
    if (!(st instanceof Date) || isNaN(st))
      throw new ApiError(400, "Invalid startTime");
    if (!(et instanceof Date) || isNaN(et))
      throw new ApiError(400, "Invalid endTime");
    if (et <= st)
      throw new ApiError(400, "endTime must be after startTime");
    // validate capacity
    const cap = Number(capacity);
    if (!Number.isFinite(cap) || cap < 0)
      throw new ApiError(400, "capacity must be >= 0");
    // validate price
    const priceNum = Number(
      typeof price === "object" && price?.$numberDecimal != null
        ? price.$numberDecimal
        : price
    );
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      throw new ApiError(400, "price must be a non-negative number");
    }

    // auto-increment sessionId if not provided or invalid
    let sid = Number(sessionId);
    if (!Number.isFinite(sid)) {
      const last = await CourseSession.findOne()
        .sort({ sessionId: -1 })
        .select("sessionId")
        .lean();
      sid = (last?.sessionId || 0) + 1;
    }
    // create document
    const doc = await CourseSession.create({
      sessionId: sid,
      courseId: Number(courseId),
      instructorId: Number(instructorId),
      startTime: st,
      endTime: et,
      duration, 
      capacity: cap,
      seatsBooked: 0,
      price: priceNum,
      status,
      location,
      notes,
    });
    // respond with created document
    return res.status(201).json(new ApiResponse(201, doc, "Session created successfully"));
});

// get by id with active instructor
export const updateCourseSession = asyncHandler(async (req, res) => {
    const match = buildIdMatch(req.params.id);
    if (!match)
      throw new ApiError(404, "CourseSession not found");

    const payload = { ...req.body };

    // check active instructor if instructorId is being updated
    if (payload.instructorId !== undefined) {
      const newInstId = Number(payload.instructorId);
      if (!Number.isFinite(newInstId)) {
        throw new ApiError(400, "instructorId must be a number");
      }
      const inst = await Instructor.findOne({
        instructorId: newInstId,
        status: "active",
      })
        .select("instructorId status")
        .lean();
      if (!inst) {
        throw new ApiError(400, "Instructor is not active or does not exist");
      }
    }

    // validate startTime and endTime if being updated
    if (payload.startTime) {
      const st = new Date(payload.startTime);
      if (!(st instanceof Date) || isNaN(st))
        throw new ApiError(400, "Invalid startTime");
    }
    if (payload.endTime) {
      const et = new Date(payload.endTime);
      if (!(et instanceof Date) || isNaN(et))
        throw new ApiError(400, "Invalid endTime");
    }
    if (payload.startTime && payload.endTime) {
      const st = new Date(payload.startTime);
      const et = new Date(payload.endTime);
      if (et <= st)
        throw new ApiError(400, "endTime must be after startTime");
    }
    // validate capacity
    if (payload.capacity !== undefined) {
      const cap = Number(payload.capacity);
      if (!Number.isFinite(cap) || cap < 0) {
        throw new ApiError(400, "capacity must be >= 0");
      }
    }
    // validate seatsBooked
    if (payload.seatsBooked !== undefined) {
      const sb = Number(payload.seatsBooked);
      if (!Number.isFinite(sb) || sb < 0) {
        throw new ApiError(400, "seatsBooked must be >= 0");
      }
      const cur = await CourseSession.findOne(match).select("capacity").lean();
      if (!cur)
        throw new ApiError(404, "CourseSession not found");
      if (sb > cur.capacity) {
        throw new ApiError(400, "seatsBooked cannot exceed capacity");
      }
    }
    // validate price
    if (payload.price !== undefined) {
      const priceNum =
        typeof payload.price === "object" &&
        payload.price?.$numberDecimal != null
          ? Number(payload.price.$numberDecimal)
          : Number(payload.price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        throw new ApiError(400, "price must be a non-negative number");
      }
      payload.price = priceNum;
    }

    const updated = await CourseSession.findOneAndUpdate(
      match,
      { $set: payload },
      { new: true }
    ).lean();
    if (!updated)
      throw new ApiError(404, "CourseSession not found");

    return res.status(200).json(new ApiResponse(200, updated, "Session updated successfully"));
});

// delete by id
export const deleteCourseSession = asyncHandler(async (req, res) => {
    const match = buildIdMatch(req.params.id);
    if (!match)
      throw new ApiError(404, "CourseSession not found");

    const del = await CourseSession.findOneAndDelete(match).lean();
    if (!del) throw new ApiError(404, "CourseSession not found");

    return res.status(200).json(new ApiResponse(200, null, "Session deleted successfully"));
});

export const bookSeat = asyncHandler(async (req, res) => {
    const match = buildIdMatch(req.params.id);
    if (!match)
      throw new ApiError(404, "CourseSession not found");

    // check active instructor
    const s = await CourseSession.findOne(match)
      .select("instructorId capacity seatsBooked status")
      .lean();
    if (!s) throw new ApiError(404, "CourseSession not found");

    const inst = await Instructor.findOne({
      instructorId: s.instructorId,
      status: "active",
    })
      .select("_id")
      .lean();
    if (!inst) throw new ApiError(409, "Instructor inactive");

    // only book if seats available and status is Scheduled
    const updated = await CourseSession.findOneAndUpdate(
      {
        ...match,
        status: "Scheduled",
        $expr: { $lt: ["$seatsBooked", "$capacity"] },
      },
      { $inc: { seatsBooked: 1 } },
      { new: true }
    ).lean();

    if (!updated)
      throw new ApiError(409, "Session full or not schedulable");
    return res.status(200).json(new ApiResponse(200, updated, "Seat booked successfully"));
});

export const cancelSeat = asyncHandler(async (req, res) => {
    const match = buildIdMatch(req.params.id);
    if (!match)
      throw new ApiError(404, "CourseSession not found");

    const s = await CourseSession.findOne(match)
      .select("instructorId seatsBooked status")
      .lean();
    if (!s) throw new ApiError(404, "CourseSession not found");

    const inst = await Instructor.findOne({
      instructorId: s.instructorId,
      status: "active",
    })
      .select("_id")
      .lean();
    if (!inst) throw new ApiError(409, "Instructor inactive");
    // only cancel if seatsBooked > 0 and status is Scheduled
    const updated = await CourseSession.findOneAndUpdate(
      { ...match, status: "Scheduled", seatsBooked: { $gt: 0 } },
      { $inc: { seatsBooked: -1 } },
      { new: true }
    ).lean();

    if (!updated)
      throw new ApiError(409, "No seats to release or status not schedulable");
    return res.status(200).json(new ApiResponse(200, updated, "Seat released successfully"));
});
