import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import { HttpException } from "../exceptions/exceptions.js";

//--------- add new category ----------
export async function saveCategory(data) {
  const findCategory = await categoryModel.findOne({
      categoryName: { $regex: new RegExp("^" + data.categoryName + "$", "i") }
  });
  if(findCategory) throw new HttpException(400, "Category already exist");
  const category = await categoryModel.create({ ...data });
  return { category };
}

//---------- get all categories --------------
export async function getAll() {
  const category = await categoryModel.find().sort({ createdAt: -1 });;
  const total = await categoryModel.find().countDocuments();
  return { category, total };
}

//--------- update category ---------------
export async function updCategory(categoryData, categoryId) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new HttpException(400, "Invalid category ID");
  }

  if (categoryData.categoryName) {
    const findCategory = await categoryModel.findOne({
      categoryName: {
        $regex: new RegExp("^" + categoryData.categoryName + "$", "i"),
      },
    });
    if (findCategory && findCategory._id.toString() !== categoryId) {
      throw new HttpException(400, "Product with this name already exists");
    }
  }

  const category = await categoryModel.findByIdAndUpdate(
    categoryId,
    categoryData,
    { new: true }
  );
  if (!category) {
    throw new HttpException(404, "Category not found");
  }

  // Update the products that belong to this category
  const products = await productModel.find({
    "category.categoryId": categoryId,
  });

  for (const product of products) {
    if (categoryData.categoryName) {
      product.category.categoryName = categoryData.categoryName;
    }
    await product.save();
  }

  return { category };
}

//--------- delete category ---------

export async function dltCategory(categoryId) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new HttpException(400, "Invalid category ID");
  }

  const category = await categoryModel.findByIdAndDelete(categoryId);
  if (!category) throw new HttpException(404, "category not found");
  return { category };
}

//--------------- find single category ---------

export async function findcategoryData(categoryId) {
  const category = await categoryModel.findOne({ _id: categoryId });
  if (!category) throw new HttpException(404, "category not found");

  return category;
}