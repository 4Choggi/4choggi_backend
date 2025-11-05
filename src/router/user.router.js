import express from "express";
import { login, logout, register } from "../controller/user.controller.js";
import { verifyToken } from "../middlewares/auth.middlware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/logout", verifyToken, logout);

export default router;