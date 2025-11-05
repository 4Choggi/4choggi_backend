import express from 'express';
import cors from "cors";

const app = express();

app.use(cors({
    origin: "*",
}));

app.use(express.json({
    limit: "16kb",
}));

app.get("/", (_, res) => {
    return res.status(200).json({
        message: "Hello",
    });
});

import userRouter from "./router/user.router.js";

app.use("/api/users", userRouter);

export default app;