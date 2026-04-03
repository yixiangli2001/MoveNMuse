// Marina
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { UserViewProfileController } from "../controllers/user.controller.js";
import { UserUpdateProfileController } from "../controllers/user.controller.js";
import { registerUser } from "../controllers/registerUser.controller.js";
import { changePassword } from "../controllers/changePassword.controller.js";

const router = express.Router();
router.get("/profile", authMiddleware, UserViewProfileController);
router.put("/update", authMiddleware, UserUpdateProfileController);
router.post('/register', registerUser); 
router.post('/changePassword', changePassword); 

export default router;
