import express from "express";
import { acceptEmployer, adminLogin, getUnverifiedEmployerList, logout, rejectEmployer } from "../controller/admin.controller.js";
import { verifyToken } from "../middlewares/authAdmin.middleware.js";

const router = express.Router();

router.post("/login", adminLogin);

router.post("/logout", verifyToken, logout);
router.get("/getUnverifiedEmployerList", verifyToken, getUnverifiedEmployerList);
router.patch("/acceptEmployer", verifyToken, acceptEmployer);
router.delete("/rejectEmployer", verifyToken, rejectEmployer);

export default router;