import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ROLES } from "../constants.js";
import { Employer } from "../models/employer.model.js";

const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json({
            error: "All fields are required",
        });
    }
    const user = await User.findOne({
        email: email,
    });
    if (!user) {
        return res.status(404).json({
            error: "User does not exists",
        });
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
        return res.status(400).json({
            error: "Password Doesn't Match",
        });
    }
    if (user.role !== ROLES[2]) {
        return res.status(400).json({
            error: "You are not authorized to login",
        });
    }
    const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    if (!token) {
        return res.status(400).json({
            error: "Token Generation Failed",
        });
    }
    try {
        await User.findByIdAndUpdate(
            user._id,
            {
                lastLoggedIn: Date.now(),
            }
        );
        return res.status(200).json({
            status: 200,
            data: {
                token: token,
                role: user.role,
            },
            message: "User Logged In",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const logout = asyncHandler(async (_, res) => {
    try {
        return res.status(200).json({
            status: 200,
            message: "User Logged Out",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const getUnverifiedEmployerList = asyncHandler(async (req, res) => {
    const admin = req.admin;
    try {
        const unverifiedEmployers = await Employer.find({
            isVerified: false,
        }).select("-password");
        return res.status(200).json({
            status: 200,
            data: unverifiedEmployers,
            message: "Unverified Employer List Fetched",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const acceptEmployer = asyncHandler(async (req, res) => {
    const { employerId } = req.body;
    if (!employerId) {
        return res.status(400).json({
            error: "Employer ID is required",
        });
    }
    const employer = await Employer.findById(employerId);
    if (!employer) {
        return res.status(404).json({
            error: "Employer not found",
        });
    }
    try {
        await Employer.findByIdAndUpdate(
            employerId,
            {
                isVerified: true,
            }
        );
        return res.status(200).json({
            status: 200,
            message: "Employer Verified",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const rejectEmployer = asyncHandler(async (req, res) => {
    const { employerId } = req.body;
    if (!employerId) {
        return res.status(400).json({
            error: "Employer ID is required",
        });
    }
    const employer = await Employer.findById(employerId);
    if (!employer) {
        return res.status(404).json({
            error: "Employer not found",
        });
    }
    try {
        await Employer.findByIdAndDelete(employerId);
        return res.status(200).json({
            status: 200,
            message: "Employer Rejected",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

export {
    adminLogin,
    logout,
    getUnverifiedEmployerList,
    acceptEmployer,
    rejectEmployer,
};