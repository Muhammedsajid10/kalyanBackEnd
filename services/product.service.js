// import productModel from "../models/productModel.js";
// import { HttpException } from "../exceptions/exceptions.js";
// import lodash from "lodash";
// import franchiseModel from "../models/franchiseModel.js";
// import categoryModel from "../models/categoryModel.js";

// import mongoose from "mongoose";
// const { toNumber } = lodash;

// //----------- add new product----------------

// export async function saveProduct(productData) {
//   const findProduct = await productModel.findOne({
//     name: { $regex: new RegExp("^" + productData.name + "$", "i") },
//   });

//   if (findProduct) throw new HttpException(400, "Product already exist ");

//   // Check if a product with the same product code already exists
//   if (productData.productCode) {
//     const findProductByCode = await productModel.findOne({
//       productCode: {
//         $regex: new RegExp("^" + productData.productCode + "$", "i"),
//       },
//     });

//     if (findProductByCode)
//       throw new HttpException(
//         400,
//         "Product with this product code already exists"
//       );
//   }

//   // Remove duplicate subproducts
//   const uniqueSubProducts = [];
//   const subProductMap = new Map();

//   for (const subProduct of productData.subProducts) {
//     if (!subProductMap.has(subProduct.subproduct.toString())) {
//       subProductMap.set(subProduct.subproduct.toString(), true);
//       uniqueSubProducts.push(subProduct);
//     }
//   }

//   productData.subProducts = uniqueSubProducts;

//   // update the product total prise
//   if (!productData.quantity) {
//     productData.totalPrice = productData.price;
//   } else {
//     productData.totalPrice = productData.price * productData.quantity;
//   }

//   // Find the category by ID and update the products array
//   const category = await categoryModel.findById(
//     productData.category.categoryId
//   );
//   if (!category) throw new HttpException(404, "Category not found");

//   const product = await productModel.create({
//     ...productData,
//     quantity: 0,
//     stock: [],
//   });

//   category.products.push(product._id);
//   await category.save();

//   return { product };
// }

// //---------------------------

// //--------- update product --------

// export async function productUpdate(productId, productData) {
//   try {
//     if (productData.name) {
//       const findProduct = await productModel.findOne({
//         name: { $regex: new RegExp("^" + productData.name + "$", "i") },
//       });
//       if (findProduct && findProduct._id.toString() !== productId) {
//         throw new HttpException(400, "Product with this name already exists");
//       }
//     }
//     if (productData.productCode) {
//       const findProductByCode = await productModel.findOne({
//         productCode: {
//           $regex: new RegExp("^" + productData.productCode + "$", "i"),
//         },
//       });

//       if (findProductByCode && findProductByCode._id.toString() !== productId)
//         throw new HttpException(
//           400,
//           "Product with this product code already exists"
//         );
//     }

//     // Remove duplicate subproducts
//     if (productData.subProducts) {
//       const uniqueSubProducts = [];
//       const subProductMap = new Map();

//       for (const subProduct of productData.subProducts) {
//         if (subProduct && subProduct.subproduct) {
//           const subproductId = subProduct.subproduct.toString();
//           if (!subProductMap.has(subproductId)) {
//             subProductMap.set(subproductId, true);
//             uniqueSubProducts.push(subProduct);
//           }
//         }
//       }

//       productData.subProducts = uniqueSubProducts;
//     }

//     const product = await productModel.findByIdAndUpdate(
//       productId,
//       productData,
//       { new: true }
//     );
//     if (!product) {
//       throw new HttpException(404, "Product not found");
//     }

//     // Update the franchise stock details
//     const franchises = await franchiseModel.find({
//       "stock.productId": productId,
//     });

//     for (const franchise of franchises) {
//       for (const stockItem of franchise.stock) {
//         if (stockItem.productId.toString() === productId) {
//           if (productData.name) stockItem.productName = productData.name;
//           if (productData.productCode)
//             stockItem.productCode = productData.productCode;
//           if (productData.price) stockItem.price = productData.price;
//           if (productData.category && productData.category.categoryName) {
//             stockItem.categoryName = productData.category.categoryName;
//           }
//         }
//       }
//       await franchise.save();
//     }

//     return { product };
//   } catch (error) {
//     throw error;
//   }
// }
// // ----------------------------

// //----------- get all products -------------

// export async function getAll(page, limit, query) {
//   let queryData = {};
//   if (query?.search) {
//     queryData["$or"] = [
//       { name: { $regex: query?.search ? query?.search : "", $options: "i" } },
//       {
//         productCode: {
//           $regex: query?.search ? query?.search : "",
//           $options: "i",
//         },
//       },
//       // {
//       //   "category.categoryName": {
//       //     $regex: query?.search ? query?.search : "",
//       //     $options: "i",
//       //   },
//       // },
//     ];
//   }

//   const products = await productModel
//     .find(queryData)
//     .populate([
//       { path: "stock.franchiseId" },
//       { path: "category" },
//       { path: "subProducts.subproduct", select: "name quantity rackNumber" },
//     ])
//     .skip((toNumber(page) - 1) * toNumber(limit))
//     .limit(toNumber(limit))
//     .sort({ createdAt: -1 });

//   const total = await productModel.find(queryData).countDocuments();
//   const totalPages = await Math.ceil(total / limit);
//   return { products, totalPages, total };
// }
// // ------------------------------------

// // ------- get filtered product by franchise

// export async function findAllProductByFranchise(page, limit, franchiseId) {
//   try {
//     const products = await productModel.find({
//       stock: {
//         $elemMatch: { franchiseId: franchiseId },
//       },
//     });
//     if (!products) throw new HttpException(404, "franchise not found");

//     return { products: products };
//   } catch (error) {
//     throw error;
//   }
// }

// //-------- find single product -----------

// export async function findSingleProduct(productId) {
//   const product = await productModel.findById(productId);
//   if (!product) throw new HttpException(404, "product not found");
//   return { product };
// }

// //-------- delete a product -----------

// export async function deleteProduct(productId) {
//   if (!mongoose.Types.ObjectId.isValid(productId)) {
//     throw new HttpException(400, "Invalid product ID");
//   }

//   const product = await productModel.findById(productId);
//   if (!product) throw new HttpException(404, "Product not found");

//   const categoryId = product.category.categoryId;
//   const category = await categoryModel.findById(categoryId);
//   if (!category) throw new HttpException(404, "Category not found");

//   // Remove the product ID from the category's products array
//   category.products = category.products.filter(
//     (id) => id.toString() !== productId
//   );
//   await category.save();

//   await productModel.findByIdAndDelete(productId);
//   return { product };
// }













import productModel from "../models/productModel.js";
import { HttpException } from "../exceptions/exceptions.js";
import lodash from "lodash";
import franchiseModel from "../models/franchiseModel.js";
import categoryModel from "../models/categoryModel.js";
import mongoose from "mongoose";

const { toNumber } = lodash;

//----------- add new product ----------------
export async function saveProduct(productData) {
  const nameToCheck = productData.name?.trim().toLowerCase();
  const codeToCheck = productData.productCode?.trim().toLowerCase();

  const findProduct = await productModel.findOne({
    name: { $regex: new RegExp("^" + nameToCheck + "$", "i") },
  });

  if (findProduct) throw new HttpException(400, "Product already exists");

  if (productData.productCode) {
    const findProductByCode = await productModel.findOne({
      productCode: { $regex: new RegExp("^" + codeToCheck + "$", "i") },
    });

    if (findProductByCode) {
      throw new HttpException(400, "Product with this product code already exists");
    }
  }

  // Remove duplicate subproducts
  const uniqueSubProducts = [];
  const subProductMap = new Map();

  for (const subProduct of productData.subProducts || []) {
    const id = subProduct?.subproduct?.toString();
    if (id && !subProductMap.has(id)) {
      subProductMap.set(id, true);
      uniqueSubProducts.push(subProduct);
    }
  }

  productData.subProducts = uniqueSubProducts;

  productData.totalPrice = productData.quantity
    ? productData.price * productData.quantity
    : productData.price;

  const category = await categoryModel.findById(productData.category?.categoryId);
  if (!category) throw new HttpException(404, "Category not found");

  const product = await productModel.create({
    ...productData,
   // quantity: 0,
    quantity: productData.quantity ?? 0,
    stock: [],
  });

  category.products.push(product._id);
  await category.save();

  return { product };
}

// --------- update product --------
export async function productUpdate(productId, productData) {
  try {
    const nameToCheck = productData.name?.trim().toLowerCase();
    const codeToCheck = productData.productCode?.trim().toLowerCase();

    if (productData.name) {
      const existingProduct = await productModel.findOne({
        name: { $regex: new RegExp("^" + nameToCheck + "$", "i") },
      });

      if (existingProduct && existingProduct._id.toString() !== productId) {
        throw new HttpException(400, "Product with this name already exists");
      }
    }

    if (productData.productCode) {
      const existingCode = await productModel.findOne({
        productCode: { $regex: new RegExp("^" + codeToCheck + "$", "i") },
      });

      if (existingCode && existingCode._id.toString() !== productId) {
        throw new HttpException(400, "Product with this product code already exists");
      }
    }

    // Remove duplicate subproducts
    if (productData.subProducts) {
      const uniqueSubProducts = [];
      const subProductMap = new Map();

      for (const subProduct of productData.subProducts) {
        const id = subProduct?.subproduct?.toString();
        if (id && !subProductMap.has(id)) {
          subProductMap.set(id, true);
          uniqueSubProducts.push(subProduct);
        }
      }

      productData.subProducts = uniqueSubProducts;
    }

    const product = await productModel.findByIdAndUpdate(productId, productData, {
      new: true,
    });

    if (!product) throw new HttpException(404, "Product not found");

    // Update franchise stock details
    const franchises = await franchiseModel.find({ "stock.productId": productId });

    for (const franchise of franchises) {
      for (const stockItem of franchise.stock) {
        if (stockItem.productId.toString() === productId) {
          if (productData.name) stockItem.productName = productData.name;
          if (productData.productCode) stockItem.productCode = productData.productCode;
          if (productData.price) stockItem.price = productData.price;
          if (productData.category?.categoryName) {
            stockItem.categoryName = productData.category.categoryName;
          }
        }
      }
      await franchise.save();
    }

    return { product };
  } catch (error) {
    throw error;
  }
}

// ----------- get all products -------------
export async function getAll(page, limit, query) {
  const queryData = {};

  if (query?.search) {
    const search = query.search.trim();
    queryData["$or"] = [
      { name: { $regex: search, $options: "i" } },
      { productCode: { $regex: search, $options: "i" } },
    ];
  }

  const [products, total] = await Promise.all([
    productModel
      .find(queryData)
      .populate([
        { path: "stock.franchiseId" },
        { path: "category" },
        { path: "subProducts.subproduct", select: "name quantity rackNumber" },
      ])
      .skip((toNumber(page) - 1) * toNumber(limit))
      .limit(toNumber(limit))
      .sort({ createdAt: -1 }),
    productModel.countDocuments(queryData),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { products, totalPages, total };
}

// ------- get filtered products by franchise -------
export async function findAllProductByFranchise(page, limit, franchiseId) {
  try {
    const products = await productModel.find({
      stock: { $elemMatch: { franchiseId } },
    });

    if (!products) throw new HttpException(404, "Franchise not found");

    return { products };
  } catch (error) {
    throw error;
  }
}

// -------- find single product -----------
export async function findSingleProduct(productId) {
  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, "Product not found");
  return { product };
}

// -------- delete a product -----------
export async function deleteProduct(productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new HttpException(400, "Invalid product ID");
  }

  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, "Product not found");

  const categoryId = product.category?.categoryId;
  const category = await categoryModel.findById(categoryId);
  if (!category) throw new HttpException(404, "Category not found");

  // Remove product from category
  category.products = category.products.filter(
    (id) => id.toString() !== productId
  );
  await category.save();

  await productModel.findByIdAndDelete(productId);
  return { product };
}
