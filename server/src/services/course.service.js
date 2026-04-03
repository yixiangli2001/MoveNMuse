import Course from "../models/course.model.js";
import { CourseSession } from "../models/courseSession.model.js";
import { ApiError } from "../utils/ApiError.js";

class CourseService {
    static async listCourses({ kw, category, level, page = 1, pageSize = 10 }) {
        const q = {};
        if (category && category.toLowerCase() !== "all categories")
            q.category = category;
        if (level && level !== "All levels") q.level = level;
        if (kw) {
            const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            q.$or = [{ courseName: regex }, { description: regex }];
        }

        const projection = "courseId courseName category level description defaultPrice capacity";

        const [rawItems, total] = await Promise.all([
            Course.find(q)
                .sort({ createdAt: -1, courseName: 1 })
                .select(projection)
                .lean()
                .skip((page - 1) * pageSize)
                .limit(pageSize),
            Course.countDocuments(q),
        ]);

        const courseIds = rawItems.map((c) => c.courseId).filter((v) => v != null);
        let nextByCourseId = new Map();

        if (courseIds.length) {
            const now = new Date();
            const rows = await CourseSession.aggregate([
                {
                    $match: {
                        courseId: { $in: courseIds },
                        status: "Scheduled",
                        startTime: { $gte: now },
                    },
                },
                { $sort: { startTime: 1 } },
                {
                    $group: {
                        _id: "$courseId",
                        sessionId: { $first: "$sessionId" },
                        startTime: { $first: "$startTime" },
                        capacity: { $first: "$capacity" },
                        seatsBooked: { $first: "$seatsBooked" },
                    },
                },
            ]);
            nextByCourseId = new Map(rows.map((r) => [r._id, r]));
        }

        const items = rawItems.map((c) => {
            const cap = Number(c.capacity ?? 0);
            const next = nextByCourseId.get(c.courseId);
            const capacity = next?.capacity ?? cap;
            const booked = next?.seatsBooked ?? 0;
            const remaining = Math.max((capacity || 0) - (booked || 0), 0);

            return {
                id: String(c._id),
                courseId: c.courseId,
                name: c.courseName,
                category: c.category,
                level: c.level || "All levels",
                description: c.description || "",
                price: parseFloat(c.defaultPrice?.toString() || "0"),
                capacity,
                booked,
                remaining,
                lowCapacity: remaining <= 3,
                nextStartTime: next?.startTime ?? null,
                nextSessionId: next?.sessionId ?? null,
            };
        });

        return { items, total, page, pageSize };
    }

    static async getCourse(id) {
        let course;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            course = await Course.findById(id).lean();
        } else {
            course = await Course.findOne({ courseId: Number(id) }).lean();
        }

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        const upcoming = await CourseSession.find(
            {
                courseId: course.courseId,
                status: "Scheduled",
                startTime: { $gte: new Date() },
            }
        )
            .sort({ startTime: 1 })
            .limit(3)
            .lean();

        const head = upcoming?.[0];
        const capacity = head?.capacity ?? Number(course.capacity || 0);
        const booked = head?.seatsBooked ?? 0;
        const remaining = Math.max(capacity - booked, 0);

        return {
            ...course,
            id: String(course._id),
            price: parseFloat(course.defaultPrice?.toString() || "0"),
            capacity,
            booked,
            remaining,
            lowCapacity: remaining <= 3,
            upcomingSessions: upcoming.map(s => ({
                ...s,
                price: parseFloat(s.price?.toString() || "0")
            }))
        };
    }

    static async createCourse(data) {
        let { courseName, name, category, level, defaultPrice, description, courseId } = data;
        courseName = (courseName || name || "").trim();
        
        if (!courseName) throw new ApiError(400, "Course name is required");

        let assignedId = courseId;
        if (!assignedId) {
            const last = await Course.findOne().sort({ courseId: -1 }).lean();
            assignedId = (last?.courseId ?? 0) + 1;
        }

        const course = await Course.create({
            courseId: assignedId,
            courseName,
            category,
            level,
            description,
            defaultPrice: parseFloat(defaultPrice || "0")
        });

        return course;
    }

    static async deleteCourse(id) {
        let deleted;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            deleted = await Course.findByIdAndDelete(id);
        } else {
            deleted = await Course.findOneAndDelete({ courseId: Number(id) });
        }

        if (!deleted) throw new ApiError(404, "Course not found");
        return deleted;
    }

    static async listOpenCourses() {
        const now = new Date();
        const rows = await CourseSession.aggregate([
            { $match: { status: "Scheduled", endTime: { $gt: now } } },
            {
                $lookup: {
                    from: "courses",
                    localField: "courseId",
                    foreignField: "courseId",
                    as: "c",
                },
            },
            { $unwind: "$c" },
            {
                $group: {
                    _id: "$courseId",
                    name: { $first: "$c.courseName" },
                    category: { $first: "$c.category" },
                    level: { $first: "$c.level" },
                    description: { $first: "$c.description" },
                    price: { $first: "$c.defaultPrice" },
                },
            },
        ]);

        return rows.map((r) => ({
            id: r._id,
            name: r.name,
            category: r.category,
            level: r.level || "All levels",
            description: r.description || "",
            price: parseFloat(r.price?.toString() || "0"),
        }));
    }

    static async updateCourse(id, data) {
        let course;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            course = await Course.findByIdAndUpdate(id, data, { new: true }).lean();
        } else {
            course = await Course.findOneAndUpdate({ courseId: Number(id) }, data, { new: true }).lean();
        }

        if (!course) throw new ApiError(404, "Course not found");
        return course;
    }
}

export { CourseService };
