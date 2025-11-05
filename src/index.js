import app from "./app.js";
import "./config/config.js";
import { connectDB } from "./db/db.js";

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port: ${process.env.PORT}`);
        });
    })
    .catch((e) => {
        process.exit(1);
    });