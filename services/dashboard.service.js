import categoryModel from "../models/categoryModel.js";
import franchiseModel from "../models/franchiseModel.js";
import productModel from "../models/productModel.js";


// get all categories
export async function getDashbordDatas() {
  const totalCategories= await categoryModel.find().countDocuments();
  const totalfranchise= await franchiseModel.find().countDocuments();
  const totalProducts = await productModel.find().countDocuments()
  return { totalCategories, totalfranchise, totalProducts };
}
