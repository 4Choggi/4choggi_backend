import { ROLES } from "../constants.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(404).json({
            error: "All fields are required",
        });
    }
    const existingUser = await User.findOne({
        email: email,
    });
    if (existingUser) {
        return res.status(400).json({
            error: "Email already exists",
        });
    }
    if (!ROLES.includes(role) || role === ROLES[2]) {
        return res.status(400).json({
            error: "Role Invalid",
        });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    if (!hashedPassword) {
        return res.status(400).json({
            error: "Hashing Error",
        });
    }
    try {
        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: role,
        });
        return res.status(201).json({
            status: 201,
            data: user,
            message: "User Created",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

export {
    register
};