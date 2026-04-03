// Jiayu
import { Router } from "express";
import {
  listCourseSessions,
  getCourseSession,
  createCourseSession,
  updateCourseSession,
  deleteCourseSession,
  bookSeat,
  cancelSeat,
  listByCourseId,
} from "../controllers/courseSession.controller.js";

const router = Router();

// server/src/routes/courseSession.routes.js
router.get("/", listCourseSessions);
router.get("/course/:courseId", listByCourseId);
router.get("/:id", getCourseSession);
router.post("/", createCourseSession);
router.patch("/:id", updateCourseSession);
router.delete("/:id", deleteCourseSession);
router.post("/:id/book", bookSeat);
router.post("/:id/cancel", cancelSeat);

export default router;
