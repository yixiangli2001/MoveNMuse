// Xinyi
import { RoomSlot } from "../models/roomSlot.model.js";
import Room from "../models/room.model.js"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const listRoomSlots = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { from, to } = req.query;

    const filter = { roomId: Number(roomId) };
    if (from && to) {
        filter.$and = [
            { startTime: { $lt: new Date(to) } },
            { endTime: { $gt: new Date(from) } },
        ];
    }

    const slots = await RoomSlot.find(filter).sort({ startTime: 1 }).lean();
    const normalized = slots.map(s => ({
        ...s,
        price: s.price != null ? Number(s.price) : 0
    }));
    return res.status(200).json(new ApiResponse(200, normalized, "Room slots fetched successfully"));
});

export const createRoomSlot = asyncHandler(async (req, res) => {
    const slot = await RoomSlot.create(req.body);
    return res.status(201).json(new ApiResponse(201, slot, "Room slot created successfully"));
});

export const getRoomSlotById = asyncHandler(async (req, res) => {
    const { roomSlotId } = req.params;

    const slot = await RoomSlot.findOne({ roomSlotId: Number(roomSlotId) });
    if (!slot) throw new ApiError(404, "Room slot not found");

    const room = await Room.findOne({ roomId: slot.roomId });
    if (!room) throw new ApiError(404, "Room not found");

    return res.status(200).json(new ApiResponse(200, { slot, room }, "Room slot fetched successfully"));
});
