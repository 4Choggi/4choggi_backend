import mongoose from "mongoose";
import { ROLES } from "../constants.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ROLES,
        default: ROLES[0],
    },
    resumeURL: {
        type: String,
        default: "",
    },
    jobPreferences: {
        title: {
            type: String,
            default: "",
        },
        yoe: {
            type: String,
            default: "",
        }
    },
    skills: [
        {
            type: String,
        }
    ],
    autoApply: {
        type: Boolean,
        default: true,
    },
    links: {
        github: {
            type: String,
            default: "",
        },
        linkedin: {
            type: String,
            default: "",
        },
        portfolio: {
            type: String,
            default: "",
        },
    },
    lastLoggedIn: {
        type: Date,
    }
}, {
    timestamps: true,
});

export const User = mongoose.model("users", userSchema);