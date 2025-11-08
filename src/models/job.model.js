import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    expLevel: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    requiredSkills: {
        type: [String],
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    acceptedUsers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
            similarityScore: {
                type: Number,
            },
        },
    ],
}, {
    timestamps: true,
});

export const Job = mongoose.model("jobs", jobSchema);