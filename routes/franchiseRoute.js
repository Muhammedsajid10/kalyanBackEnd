import express from "express";
import { addFranchise, deleteFranchise, getAll, getSingleFranchise, updateFranchise } from "../controllers/franchise.controller.js";
import { franchiseValidator } from "../middlewares/franchise.middleware.js";
import { authorizeRoles } from "../middlewares/auth.middleware.js";
const router = express.Router();

//........user login and log out...........//
router.post("/franchise/add",authorizeRoles, franchiseValidator, addFranchise);
router.get("/franchise/all", getAll);
router.get("/franchise/single/:id", getSingleFranchise);
router.put("/franchise/update/:id",authorizeRoles, franchiseValidator, updateFranchise);
router.delete("/franchise/delete/:id", authorizeRoles, deleteFranchise);

export default router;
