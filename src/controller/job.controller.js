import asyncHandler from "../utils/asyncHandler.js";
import { Job } from "../models/job.model.js";

const createJob = asyncHandler(async (req, res) => {
    const { title, expLevel, location, requiredSkills, jobDescription, expiresAt } = req.body;
    if (!title || !expLevel || !location || !requiredSkills || !jobDescription || !expiresAt) {
        return res.status(404).json({
            error: "All fields are required",
        });
    }
    const employer = req.employer;
    try {
        const job = await Job.create({
            title,
            expLevel,
            location,
            requiredSkills,
            jobDescription,
            expiresAt,
        });
        employer.jobs.push(job._id);
        await employer.save();
        return res.status(201).json({
            status: 201,
            message: "Job Created",
            data: {
                job: job,
            },
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

export {
    createJob,
};