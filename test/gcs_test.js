import { Storage } from "@google-cloud/storage";

const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT_ID,
    keyFilename: "./bucket-477219-e96bd1cdbb1d.json",
});

(async () => {
    const [buckets] = await storage.getBuckets();
    console.log(buckets.map(b => b.name));
})();