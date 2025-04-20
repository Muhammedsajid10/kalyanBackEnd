import express from "express";
import { getDashboardData } from "../controllers/dashboardData.controller.js";
const router = express.Router();

//........dashboard datas...........//
router.get("/api/dashboard", getDashboardData);


export default router;
