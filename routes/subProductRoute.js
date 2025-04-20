import express from "express";
import { authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  createSubProduct,
  getAllSubProduct,
  getAllSubProductByFranchise,
  getSingleSubProduct,
  removeSubProduct,
  updateSubProduct,
} from "../controllers/subProduct.controller.js";
import { subProductValidator } from "../middlewares/subProduct.middleware.js";

const router = express.Router();
const path = "/subproduct";

router.get(`${path}/all`, getAllSubProduct);
router.get(`${path}/all_franchise`, getAllSubProductByFranchise);
router.post(
  `${path}/create`,
  authorizeRoles,
  subProductValidator,
  createSubProduct
);
router.put(`${path}/update/:id`, authorizeRoles, updateSubProduct);
router.get(`${path}/single/:id`, getSingleSubProduct);
router.delete(`${path}/delete/:id`, authorizeRoles, removeSubProduct);

export default router;
