import express from "express";
import { stockValidator } from "../middlewares/stock.middleware.js";
import { getAllStockReport, stockIn, stockOut } from "../controllers/stock.controller.js";
import { authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();
const path = "/stock";

router.post(`${path}/add`,authorizeRoles, stockValidator, stockIn);
router.post(`${path}/out`,authorizeRoles, stockValidator, stockOut);
router.get(`${path}/all`, getAllStockReport);

export default router;
