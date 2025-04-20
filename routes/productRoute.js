import {
  getAllProduct,
  getSingleProduct,
  createProduct,
  updateProduct,
  removeProduct,
  getAllProductByFranchise,
} from "../controllers/product.controller.js";
import express from "express";
// import { upload } from "../utils/multer.util.js";
import { productValidator } from "../middlewares/product.middleware.js";
import { authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();
const path = "/product";

router.get(`${path}/all`, getAllProduct);
router.get(`${path}/all_franchise`, getAllProductByFranchise);
router.post(
  `${path}/create`,authorizeRoles,
  productValidator,
  createProduct
);
router.put(`${path}/update/:id`,authorizeRoles, updateProduct);
router.get(`${path}/single/:id`, getSingleProduct);
router.delete(`${path}/delete/:id`,authorizeRoles, removeProduct);

export default router;
