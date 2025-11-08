import asyncHandler from "../utils/asyncHandler.js";
import { Job } from "../models/job.model.js";
import { matchJDWithResumeList } from "../utils/filterResume.js";
import { User } from "../models/user.model.js";

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
        const resumes = await User.find().select("_id resumeSummary jobPreferences");
        const validResumes = resumes
            .filter(
                (resume) =>
                    resume._id &&
                    resume.resumeSummary &&
                    resume.resumeSummary.trim() !== "" &&
                    resume.jobPreferences &&
                    resume.jobPreferences.title &&
                    resume.jobPreferences.yoe &&
                    resume.jobPreferences.title.trim() !== "" &&
                    resume.jobPreferences.yoe.trim() !== ""
            )
            .map((resume) => ({
                summary: resume.resumeSummary.trim(),
                jobPreference: {
                    title: resume.jobPreferences.title.trim(),
                    yoe: resume.jobPreferences.yoe.trim(),
                },
                _id: resume._id.toString(),
            }));
        const validJobDescription = {
            title,
            expLevel,
            location,
            requiredSkills,
            jobDescription,
        }
        await matchJDWithResumeList(validJobDescription, validResumes, job._id);
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

const getJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find().select("_id title expLevel location requiredSkills jobDescription expiresAt");
    return res.status(200).json({
        status: 200,
        message: "Jobs Fetched",
        data: {
            jobs: jobs,
        },
    });
});

export {
    createJob,
    getJobs,
};