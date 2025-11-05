import express from "express";
import { login, logout, register, getSignedURLResume, addDetailsRegister, getUserProfile } from "../controller/user.controller.js";
import { verifyToken } from "../middlewares/auth.middlware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/getSignedUrlResume", getSignedURLResume);
router.post("/addDetailsRegister", addDetailsRegister);

router.post("/logout", verifyToken, logout);
router.get("/getUserProfile", verifyToken, getUserProfile);

export default router;