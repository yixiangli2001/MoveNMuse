// Marina
import Booking from "../models/booking.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const getUserBookings = asyncHandler(async (req, res) => {
    let { userId, page = 1, limit = 5, sortBy = "newest" } = req.query;

    userId = parseInt(userId, 10);
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(userId)) {
        throw new ApiError(400, "Invalid or missing userId");
    }

    // Determine sort order
    let sortObj;
    switch (sortBy) {
      case "oldest":
        sortObj = { orderDate: 1, _id: 1 }; // oldest first
        break;
      case "priceHigh":
        sortObj = { orderTotal: -1, _id: -1 }; // highest total first
        break;
      case "priceLow":
        sortObj = { orderTotal: 1, _id: 1 }; // lowest total first
        break;
      case "newest":
      default:
        sortObj = { orderDate: -1, _id: -1 }; // newest first
        break;
    }

    const bookings = await Booking.find({ userId })
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments({ userId });

    return res.status(200).json(new ApiResponse(200, { bookings, total, page, limit }, "Bookings fetched successfully"));
});

// POST /api/bookings
export const createBooking = asyncHandler(async (req, res) => {
    let { userId, items, orderDate, orderTotal, status } = req.body || {};

    userId = parseInt(userId, 10);

    if (
      isNaN(userId) ||
      !Array.isArray(items) ||
      !orderDate ||
      typeof orderTotal !== "number" ||
      !status
    ) {
        throw new ApiError(400, "Missing or invalid fields");
    }

    const lastBooking = await Booking.findOne().sort({ orderId: -1 });
    const newOrderId = lastBooking ? lastBooking.orderId + 1 : 1;

    const newBooking = new Booking({
      userId,
      items,
      orderId: newOrderId,
      orderDate,
      orderTotal,
      status,
    });

    await newBooking.save();

    return res.status(201).json(new ApiResponse(201, { booking: newBooking }, "Booking created successfully"));
});
