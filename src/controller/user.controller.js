import { ROLES } from "../constants.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import bucket from "../config/gcs.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { analyzeUser } from "../utils/gitHubExtractor.js";
// import { extractSummary } from "../utils/extractSummary.js"; 
import { Job } from "../models/job.model.js";
// import { matchResumeWithJDList } from "../utils/filterResume.js";

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
    if (!ROLES.includes(role) || role === ROLES[2] || role === ROLES[1]) {
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

const login = asyncHandler(async (req, res) => {
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

const getSignedURLResume = asyncHandler(async (req, res) => {
    const { id, fileType } = req.body;
    if (!id || !fileType) {
        return res.status(404).json({
            error: "All fields are required",
        });
    }
    const existsUser = await User.findById(id);
    if (!existsUser) {
        return res.status(404).json({
            error: "User does not exists",
        });
    }
    const file = bucket.file(`resumes/${id}/${Date.now()}-${id}`);
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
            message: "Upload on Signed URL",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const addDetailsRegister = asyncHandler(async (req, res) => {
    let { id, resumeURL, title, yoe, skills, autoApply, github, linkedin, portfolio } = req.body;
    if (!id || !resumeURL || !title || !yoe || !skills || !github || !linkedin) {
        return res.status(404).json({
            error: "All fields are required",
        });
    }
    const existsUser = await User.findById(id);
    if (!existsUser) {
        return res.status(404).json({
            error: "User does not exists",
        });
    }
    if (autoApply === undefined || autoApply === null) {
        autoApply = existsUser.autoApply;
    }
    let skillArray = existsUser.skills;
    skillArray.push(...skills);
    const githubUsername = github.split("https://github.com/")[1];
    const githubData = await analyzeUser(`https://github.com/${githubUsername}`);
    const summary = "githubData"; 
    try {
        const user = await User.findByIdAndUpdate(
            id,
            {
                resumeURL: resumeURL,
                jobPreferences: {
                    title: title,
                    yoe: yoe,
                },
                links: {
                    github: github,
                    linkedin: linkedin,
                    portfolio: portfolio === "" ? "" : portfolio,
                },
                skills: skillArray,
                autoApply: autoApply,
                resumeSummary: summary,
            },  
            {
                new: true,
            }
        );
        return res.status(200).json({
            status: 200,
            data: user,
            message: "User Details Added",
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    try {
        const userProfile = await User.findById(user.id).select("-password");
        return res.status(200).json({
            status: 200,
            data: userProfile,
            message: "User Profile Retrieved",
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
    getSignedURLResume,
    addDetailsRegister,
    getUserProfile,
};