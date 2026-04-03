// Xinyi
import express from "express";
import { listRoomSlots, createRoomSlot, getRoomSlotById } from "../controllers/roomSlot.controller.js";


const router = express.Router();

router.get("/slot/:roomSlotId", getRoomSlotById); // fetch single slot by roomSlotId
router.get("/:roomId", listRoomSlots);
router.post("/", createRoomSlot);

export default router;
