import "./config.js"
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT_ID,
    keyFilename: "./bucket-477219-e96bd1cdbb1d.json",
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);

export default bucket;