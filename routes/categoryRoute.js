import express from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { categoryValidator } from "../middlewares/category.middleware.js";
import { authorizeRoles } from "../middlewares/auth.middleware.js";
const router = express.Router();

//........user login and log out...........//
router.post("/category/add", authorizeRoles, categoryValidator, addCategory);
router.get("/category/all", getAllCategory);
router.put(
  "/category/update/:id",
  authorizeRoles,
  categoryValidator,
  updateCategory
);
router.delete("/category/delete/:id", authorizeRoles, deleteCategory);

export default router;
