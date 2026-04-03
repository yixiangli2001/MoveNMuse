// Marina
import conf from "../conf/conf.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";  
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const filterUserData = (user) => ({
  userId: user.userId,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  phoneNo: user.phoneNo,
  loginDate: user.loginDate,
  logoutDate: user.logoutDate,
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required.");
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
        throw new ApiError(401, "Invalid email or password.");
    }

    user.loginDate = new Date();
    await user.save();

    const payload = {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNo: user.phoneNo,
      role: user.role,
    };

    const token = jwt.sign(payload, conf.JWT_SECRET, { expiresIn: "2h" });

    return res.status(200).json(new ApiResponse(200, {
      token,
      user: filterUserData(user),
    }, "Login successful"));
});
