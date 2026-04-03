// Xinyi
import Room from "../models/room.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const toPlainNumber = (val) => {
    if (val == null) return 0;
    if (typeof val === "object" && val._bsontype === "Decimal128") {
        return parseFloat(val.toString());
    }
    if (typeof val === "object" && val.$numberDecimal) {
        return parseFloat(val.$numberDecimal);
    }
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
};

const toDTO = (d) => {
    if (!d) return null;
    const r = d._doc ? d._doc : d;
    return {
        _id: r._id,
        id: r._id,
        name: r.name,
        type: r.type ?? r.roomType ?? "Room",
        capacity: toPlainNumber(r.capacity) ?? 0,
        pricePerHour: toPlainNumber(r.pricePerHour ?? r.defaultPrice),
        rating: toPlainNumber(r.rating),
        images: Array.isArray(r.images) ? r.images : (r.img ? [r.img] : []),
        amenities: Array.isArray(r.amenities) ? r.amenities : [],
        location: r.location ?? "",
        status: r.status ?? "Active",
        roomId: r.roomId ?? null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    };
};

const requireStaffRole = (user) =>
    user && (user.role === "staff" || user.role === "admin");

export const listRooms = asyncHandler(async (_req, res) => {
    const rooms = await Room.find().lean();
    return res.status(200).json(new ApiResponse(200, rooms.map(toDTO), "Rooms fetched successfully"));
});

export const getRoom = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let room = null;

    if (id.length === 24) {
        room = await Room.findById(id).lean();
    }
    if (!room) {
        const rid = Number(id);
        if (Number.isFinite(rid)) {
            room = await Room.findOne({ roomId: rid }).lean();
        }
    }
    if (!room) throw new ApiError(404, "Room not found");
    return res.status(200).json(new ApiResponse(200, toDTO(room), "Room fetched successfully"));
});

export const createRoom = asyncHandler(async (req, res) => {
    if (!requireStaffRole(req.user)) {
        throw new ApiError(403, "Forbidden: staff only");
    }

    const body = req.body ?? {};
    const payload = {
        ...body,
        pricePerHour: body.pricePerHour ?? body.defaultPrice ?? 0,
        images: Array.isArray(body.images)
        ? body.images
        : body.img
        ? [body.img]
        : [],
        amenities: Array.isArray(body.amenities) ? body.amenities : [],
    };

    const created = await Room.create(payload);
    return res.status(201).json(new ApiResponse(201, toDTO(created), "Room created successfully"));
});

export const updateRoom = asyncHandler(async (req, res) => {
    if (!requireStaffRole(req.user)) {
        throw new ApiError(403, "Forbidden: staff only");
    }
    const { id } = req.params;
    const body = req.body ?? {};
    const patch = { ...body };

    if (body.defaultPrice != null && body.pricePerHour == null) {
        patch.pricePerHour = body.defaultPrice;
    }
    if (body.img && !Array.isArray(body.images)) {
        patch.images = [body.img];
    }

    const updated = 
    id.length === 24
    ? await Room.findByIdAndUpdate(id, { $set: patch }, { new: true })
    : await Room.findOneAndUpdate(
        { roomId: Number(id) },
        { $set: patch },
        { new: true }
    );

    if (!updated) throw new ApiError(404, "Room not found");
    return res.status(200).json(new ApiResponse(200, toDTO(updated), "Room updated successfully"));
});

export const deleteRoom = asyncHandler(async (req, res) => {
    if (!requireStaffRole(req.user)) {
        throw new ApiError(403, "Forbidden: staff only");
    }
    
    const { id } = req.params;
    const deleted =
    id.length === 24
    ? await Room.findByIdAndDelete(id)
    : await Room.findOneAndDelete({ roomId: Number(id) });

    if (!deleted) throw new ApiError(404, "Room not found");

    return res.status(200).json(new ApiResponse(200, null, "Room deleted successfully"));
});

// For backward compatibility if needed
export const roomController = {
    list: listRooms,
    get: getRoom,
    create: createRoom,
    update: updateRoom,
    remove: deleteRoom
};
