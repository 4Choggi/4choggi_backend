import { ROLES } from "../constants.js";
import { Employer } from "../models/employer.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import bucket from "../config/gcs.config.js"; 

const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(404).json({
            error: "All fields are required",
        });
    }
    const employerExists = await Employer.findOne({ email: email });
    if (employerExists) {
        return res.status(404).json({
            error: "Email already exists",
        });
    }
    const userExists = await User.findOne({ email: email });
    if (userExists) {
        return res.status(404).json({
            error: "User with this email already exists",
        });
    }
    if (!ROLES.includes(role) || role === ROLES[0] || role === ROLES[2]) {
        return res.status(400).json({
            error: "Invalid role",
        });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    if (!hashedPassword) {
        return res.status(400).json({
            error: "Hashing Error",
        });
    }
    try {
        const employer = await Employer.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: role,
        });
        return res.status(201).json({
            status: 201,
            data: employer,
            message: "Employer Created",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json({
            error: "All fields are required",
        });
    }
    const employer = await Employer.findOne({ email: email });
    if (!employer) {
        return res.status(404).json({
            error: "Employer with this email does not exist",
        });
    }
    if (!employer.isVerified) {
        return res.status(400).json({
            error: "Employer not verified",
        });
    }
    const isPasswordValid = await bcrypt.compare(password, employer.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            error: "Invalid password",
        });
    }
    const token = await jwt.sign({ id: employer.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    if (!token) {
        return res.status(400).json({
            error: "Token Generation Failed",
        });
    }
    try {
        return res.status(200).json({
            status: 200,
            data: {
                token: token,
                role: employer.role,
            },
            message: "Employer Logged In",
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
            message: "Employer Logged Out",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const getSignedURLIDCard = asyncHandler(async (req, res) => {
    const { id, fileType } = req.body;
    if (!id || !fileType) {
        return res.status(404).json({
            error: "All fields are required",
        });
    }
    const existsEmployer = await Employer.findById(id);
    if (!existsEmployer) {
        return res.status(404).json({
            error: "Employer not found",
        });
    }
    const file = bucket.file(`id_card/${id}/${Date.now()}-${id}`);
    try {
        const [uploadURL] = await file.getSignedUrl({
            version: "v4",
            action: "write",
            expires: Date.now() + 15 * 60 * 1000,
            contentType: fileType, // application/pdf
        });
        return res.status(200).json({
            status: 200,
            data: {
                uploadURL: uploadURL,
                publicURL: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
            },
            message: "ID Card Upload URL Generated",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const addDetailsRegister = asyncHandler(async (req, res) => {
    const { id, idCardURL, linkedin, companyName, companyLocation, companySite, position } = req.body;
    if (!id || !idCardURL || !linkedin || !companyName || !companyLocation || !position) {
        return res.status(404).json({
            error: "All fields are required",
        });
    }
    const existsEmployer = await Employer.findById(id);
    if (!existsEmployer) {
        return res.status(404).json({
            error: "Employer not found",
        });
    }
    try {
        const employer = await Employer.findByIdAndUpdate(id, {
            idCard: idCardURL,
            linkedin: linkedin,
            companyName: companyName,
            companyLocation: companyLocation,
            companySite: companySite === "" ? "" : companySite,
            position: position,
        }, { new: true });
        return res.status(200).json({
            status: 200,
            data: employer,
            message: "Employer Details Updated",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const getEmployerProfile = asyncHandler(async (req, res) => {
    const employer = req.employer;
    try {
        const employerProfile = await Employer.findById(employer._id).select("-password");
        return res.status(200).json({
            status: 200,
            data: employerProfile,
            message: "Employer Profile Retrieved",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

export {
    register,
    login,
    logout,
    getSignedURLIDCard,
    addDetailsRegister,
    getEmployerProfile,
};