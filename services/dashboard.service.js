// import categoryModel from "../models/categoryModel.js";
// import franchiseModel from "../models/franchiseModel.js";
// import productModel from "../models/productModel.js";


// // get all categories
// export async function getDashbordDatas() {
//   const totalCategories= await categoryModel.find().countDocuments();
//   const totalfranchise= await franchiseModel.find().countDocuments();
//   const totalProducts = await productModel.find().countDocuments()
//   return { totalCategories, totalfranchise, totalProducts };
// }






import categoryModel from "../models/categoryModel.js";
import franchiseModel from "../models/franchiseModel.js";
import productModel from "../models/productModel.js";
import subProductModel from "../models/subProduct.js"; // Assuming you have a subProductModel


// get all categories
export async function getDashbordDatas() {
  const totalCategories= await categoryModel.find().countDocuments();
  const totalfranchise= await franchiseModel.find().countDocuments();
  const totalProducts = await productModel.find().countDocuments();
  
  // Get low stock count
  const lowStockCount = await subProductModel.countDocuments({
    $expr: { $lte: ["$quantity", "$minimumQuantity"] }
  });

  return { totalCategories, totalfranchise, totalProducts, lowStockCount };
}
