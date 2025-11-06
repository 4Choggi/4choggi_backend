import express from "express";
import { register, login, logout, getSignedURLIDCard, addDetailsRegister, getEmployerProfile } from "../controller/employer.controller.js";
import { verifyToken } from "../middlewares/authEmployer.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/getSignedURLIDCard", verifyToken, getSignedURLIDCard);
router.post("/addDetailsRegister", verifyToken, addDetailsRegister);

router.post("/logout", verifyToken, logout);
router.get("/getEmployerProfile", verifyToken, getEmployerProfile);

export default router;