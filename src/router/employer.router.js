import express from "express";
import { register, login, logout, getSignedURLIDCard, addDetailsRegister, getEmployerProfile } from "../controller/employer.controller.js";
import { verifyToken } from "../middlewares/authEmployer.middleware.js";
import { createJob, getJobs } from "../controller/job.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/getSignedURLIDCard", getSignedURLIDCard);
router.post("/addDetailsRegister", addDetailsRegister);

router.post("/logout", verifyToken, logout);
router.get("/getEmployerProfile", verifyToken, getEmployerProfile);

router.post("/jobs/createJob", verifyToken, createJob);
router.get("/jobs/getJobs", verifyToken, getJobs);

export default router;