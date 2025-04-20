import { initialize } from "./config/dbConnection.js";
import admin from "./data/admin.data.js";
import { franchise } from "./data/admin.data.js";
import User from "./models/userModel.js";
import Franchise from "./models/franchiseModel.js";
import Category from "./models/categoryModel.js";
import Product from "./models/productModel.js";
import SubProduct from "./models/subProduct.js";
import Stock from "./models/stockModel.js";
await initialize();
const importData = async () => {
  try {
    await User.deleteMany();
    await Franchise.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await SubProduct.deleteMany();
    await Stock.deleteMany();
    const createdAdmin = await User.insertMany(admin);
    const createFranchise = await Franchise.insertMany(franchise);
    console.log("Data cleared and Imported");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};
if (process.argv[2] === "-id") {
  destroyData();
} else {
  importData();
}
