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






// // GET /api/low-stock-count
// router.get('/api/low-stock-count', async (req, res) => {
//   try {
//     // Query products where quantity <= minimumQuantity
//     const count = await SubProduct.countDocuments({
//       $expr: { $lte: ["$quantity", "$minimumQuantity"] }
//     });
    
//     res.json({
//       status: 'success',
//       count: count
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch low stock count'
//     });
//   }
// });



// // GET /api/low-stock-products
// router.get('/api/low-stock-products', async (req, res) => {
//   try {
//     const { page = 1, limit = 20, franchise, search } = req.query;

//     let query = {
//       $expr: { $lte: ["$quantity", "$minimumQuantity"] }
//     };

//     // Optional: filter by franchiseId inside the stock array
//     if (franchise) {
//       query["stock.franchiseId"] = franchise;
//     }

//     // Optional: search by fields
//     if (search) {
//       query.$or = [
//         { productCode: { $regex: search, $options: 'i' } },
//         { name: { $regex: search, $options: 'i' } },
//         { productName: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Fetch paginated low stock products
//     const lowStockProducts = await SubProduct.find(query)
//       .populate('stock.franchiseId') // ✅ Correct populate path
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .sort({ quantity: 1 }); // most critical first

//     const totalCount = await SubProduct.countDocuments(query);
//     const totalPages = Math.ceil(totalCount / limit);

//     res.json({
//       status: 'success',
//       count: totalCount,
//       products: lowStockProducts,
//       totalPages,
//       currentPage: parseInt(page)
//     });
//   } catch (error) {
//     console.error("API error:", error); // Log full error
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch low stock products'
//     });
//   }
// });






export default router;
