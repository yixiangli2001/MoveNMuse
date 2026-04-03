// Shirley, Xinyi, Jiayu, Marina
import express from "express";
const router = express.Router();

import authRoutes from "./auth.routes.js";
router.use("/auth", authRoutes);

import cartRoutes from "./cart.routes.js";
router.use("/cart", cartRoutes);

import paymentRoutes from "./payment.routes.js";
router.use("/payment", paymentRoutes);

import roomRoutes from "./room.routes.js";
router.use("/rooms", roomRoutes);

import paymentDetailRoutes from "./payment-detail.routes.js";
router.use("/payment-details", paymentDetailRoutes);

import userRoutes from "./user.routes.js";
router.use("/user", userRoutes);

import bookingRoutes from "./booking.routes.js";
router.use("/bookings", bookingRoutes); 

import courseBookingRoutes from "./course-booking.routes.js";
router.use("/course-bookings", courseBookingRoutes);

import courseRoutes from "./course.routes.js";
router.use("/courses", courseRoutes);

import { capacityBoard } from "../controllers/courseBooking.controller.js";
router.get("/dashboard/capacity", capacityBoard);

import courseSessionRoutes from "./course-session.routes.js";
router.use("/course-sessions", courseSessionRoutes);

import instructorRoutes from "./instructor.routes.js";
router.use("/instructors", instructorRoutes);

import accountRoutes from "./account.routes.js";
router.use("/account", accountRoutes);

import roomSlotRoutes from "./room-slot.routes.js";
router.use("/room-slots", roomSlotRoutes);

export default router;
