// Marina
import User from '../models/user.model.js';
import { getNextUserId } from '../utils/idGenerator.js'; 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phoneNo } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const existing = await User.findOne({ email });
    if (existing) {
        throw new ApiError(400, "This email is already used by an existing account");
    }

    const userId = await getNextUserId(); 

    const newUser = new User({
      userId,
      email,
      password, 
      firstName,
      lastName,
      phoneNo,
      role: "customer",
      loginDate: new Date(),
    });

    await newUser.save();

    return res.status(201).json(new ApiResponse(201, newUser, "User registered successfully"));
});
