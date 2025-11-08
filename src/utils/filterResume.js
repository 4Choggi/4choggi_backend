import { filterJD, filterResume } from "./axios.js";
import { Job } from "../models/job.model.js";

export const matchJDWithResumeList = async (jd, resume, jobId) => {
    try {
        const data = await filterResume(jd, resume);
        const similarityScores = data.map((item) => ({
            user: item._id,
            similarityScore: item.similarity_score,
        }));
        await Job.findByIdAndUpdate(jobId,
            { $set: { acceptedUsers: similarityScores } }
        );
    } catch (error) {
        throw new Error("Error matching JD with resume list");
    }
};

export const matchResumeWithJDList = async (resume, jd, userId) => {
    try {
        const data = await filterJD(resume, jd);
        data.forEach(async (jd) => {
            const job = await Job.findById(jd.JD_id);
            if (job) {
                job.acceptedUsers.push({
                    user: userId,
                    similarityScore: jd.similarity_score,
                });
                await job.save();
            }
        });
    } catch (error) {
        throw new Error("Error matching JD with resume list");
    }
};