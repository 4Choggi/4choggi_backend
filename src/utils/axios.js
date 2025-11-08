import axios from "axios";

export const extractSummary = async (resumeURL) => {
    try {
        const url = "gs://" + resumeURL.split("https://storage.googleapis.com/")[1];
        const response = await axios.post(`${process.env.AI_API_URL}/process_document`, {
            gcs_uri: url,
        });
        return response.data.summary;
    } catch (error) {
        throw new Error("Error extracting summary from resume");
    }
};

export const filterResume = async (jobDescription, resumes) => {
    try {
        const response = await axios.post(`${process.env.AI_API_URL}/filter_resumes`, {
            job: jobDescription,
            resume: resumes,
        });
        return response.data.ranked_candidates;
    } catch (error) {
        throw new Error("Error filtering resumes");
    }
};

export const filterJD = async (resume, jd) => {
    try {
        const response = await axios.post(`${process.env.AI_API_URL}/match_resume_to_jobs`, {
            resume: resume,
            jobs: jd,
        })
        return response.data.ranked_jobs;
    } catch (error) {
        throw new Error("Error filtering jd");
    }
};