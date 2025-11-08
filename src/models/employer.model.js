import mongoose from "mongoose";
import { ROLES } from "../constants.js";

const employerSchema = new mongoose.Schema({
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
        default: ROLES[1],
    },
    idCard: {
        type: String,
        default: "",
    },
    linkedin: {
        type: String,
        default: "",
    },
    companyName: {
        type: String,
        default: "",
    },
    companyLocation: {
        type: String,
        default: "",
    },
    companySite: {
        type: String,
        default: "",
    },
    position: {
        type: String,
        default: "",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    jobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "jobs",
        },
    ]
}, {
    timestamps: true,
});

export const Employer = mongoose.model("employers", employerSchema);