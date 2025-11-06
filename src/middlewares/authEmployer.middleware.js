import { Employer } from "../models/employer.model.js";
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
    const employer = await Employer.findById(decoded.id);
    if (!employer) {
        return res.status(404).json({
            middlwareError: "Employer Not Found",
        });
    }
    if (!employer.isVerified) {
        return res.status(403).json({
            middlwareError: "Employer Not Verified",
        });
    }
    try {
        req.employer = employer;
        next();
    } catch (error) {
        return res.status(500).json({
            middlwareError: "Internal Server Error",
        });
    }
});