import { ROLES } from "../constants.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyToken = asyncHandler(async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(404).json({
            middlwareError: "Token Not Found",
        });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(404).json({
            middlwareError: "User Not Found",
        });
    }
    if (user.role !== ROLES[2]) {
        return res.status(403).json({
            middlwareError: "Forbidden",
        });
    }
    try {
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            middlwareError: "Internal Server Error",
        });
    }
});