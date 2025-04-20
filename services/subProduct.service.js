import subProductModel from "../models/subProduct.js";
import { HttpException } from "../exceptions/exceptions.js";
import lodash from "lodash";
import franchiseModel from "../models/franchiseModel.js";
import categoryModel from "../models/categoryModel.js";

import mongoose from "mongoose";
const { toNumber } = lodash;

//----------- add new subproduct----------------

export async function saveSubProduct(productData) {
  const findProduct = await subProductModel.findOne({
    name: { $regex: new RegExp("^" + productData.name + "$", "i") },
  });

  if (findProduct) throw new HttpException(400, "Product already exist ");

  // Check if a product with the same product code already exists
  // if (productData.productCode) {
  //   const findProductByCode = await subProductModel.findOne({
  //     productCode: {
  //       $regex: new RegExp("^" + productData.productCode + "$", "i"),
  //     },
  //   });

  //   if (findProductByCode)
  //     throw new HttpException(
  //       400,
  //       "Product with this product code already exists"
  //     );
  // }

  // update the product total prise
//   if (!productData.quantity) {
//     productData.totalPrice = productData.price;
//   } else {
//     productData.totalPrice = productData.price * productData.quantity;
//   }

  const subproduct = await subProductModel.create({
    ...productData,
    quantity: 0,
    stock: [],
  });

  // Find the category by ID and update the products array
//   const category = await categoryModel.findById(
//     productData.category.categoryId
//   );
//   if (!category) throw new HttpException(404, "Category not found");

//   category.products.push(product._id);
//   await category.save();

  return  subproduct ;
}

//---------------------------

//--------- update subproduct --------

export async function subProductUpdate(productId, productData) {
  try {
    if (productData.name) {
      const findProduct = await subProductModel.findOne({
        name: { $regex: new RegExp("^" + productData.name + "$", "i") },
      });
      if (findProduct && findProduct._id.toString() !== productId) {
        throw new HttpException(400, "Product with this name already exists");
      }
    }
      // if (productData.productCode) {
      //   const findProductByCode = await subProductModel.findOne({
      //     productCode: {
      //       $regex: new RegExp("^" + productData.productCode + "$", "i"),
      //     },
      //   });

      //   if (findProductByCode && findProductByCode._id.toString() !== productId)
      //     throw new HttpException(
      //       400,
      //       "Product with this product code already exists"
      //     );
      // }
    const subproduct = await subProductModel.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    );
    if (!subproduct) {
      throw new HttpException(404, "Product not found");
    }

    // Update the franchise stock details
    const franchises = await franchiseModel.find({
      "stock.productId": productId,
    });

    for (const franchise of franchises) {
      for (const stockItem of franchise.stock) {
        if (stockItem.productId.toString() === productId) {
          if (productData.name)
            stockItem.productName = productData.name;
          if (productData.productCode)
            stockItem.productCode = productData.productCode;
          if (productData.price) stockItem.price = productData.price;
          // if (productData.category && productData.category.categoryName) {
          //   stockItem.categoryName = productData.category.categoryName;
          // }
        }
      }
      await franchise.save();
    }

    return subproduct;
  } catch (error) {
    throw error;
  }
}
// ----------------------------

//----------- get all subproducts -------------

export async function getAll(page, limit, query) {
  let queryData = {};
  if (query?.search) {
    queryData["$or"] = [
      { name: { $regex: query?.search ? query?.search : "", $options: "i" } },
      {
        productCode: {
          $regex: query?.search ? query?.search : "",
          $options: "i",
        },
      },
    ];
  }

  const products = await subProductModel
    .find(queryData)
    // .populate([{ path: "stock.franchiseId" }])
    .skip((toNumber(page) - 1) * toNumber(limit))
    .limit(toNumber(limit))
    .sort({ createdAt: -1 });

  const total = await subProductModel.find(queryData).countDocuments();
    const totalPages = await Math.ceil(total / limit);
  return { products,totalPages, total };
}
// ------------------------------------

//-------- find single subproduct -----------

export async function findSingleSubProduct(productId) {
  const subProduct = await subProductModel.findById(productId);
  if (!subProduct) throw new HttpException(404, "product not found");
  return  subProduct ;
}

// ------- get filtered subproduct by franchise 

export async function findAllSubProductByFranchise(page, limit, franchiseId) {
  try {
   const subProducts = await subProductModel.find({
     stock: {
       $elemMatch: { franchiseId: franchiseId },
     },
   });
    return { products: subProducts};
  } catch (error) {
    throw error;
  }
}

//-------- delete a subproduct -----------

export async function deleteSubProduct(productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new HttpException(400, "Invalid product ID");
  }

  const product = await subProductModel.findById(productId);
  if (!product) throw new HttpException(404, "Product not found");

  // const categoryId = product.category.categoryId;
  // const category = await categoryModel.findById(categoryId);
  // if (!category) throw new HttpException(404, "Category not found");

  // // Remove the product ID from the category's products array
  // category.products = category.products.filter(
  //   (id) => id.toString() !== productId
  // );
  // await category.save();

  await subProductModel.findByIdAndDelete(productId);
  return  product ;
}
