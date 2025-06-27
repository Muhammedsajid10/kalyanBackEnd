// import productModel from "../models/productModel.js";
// import subProductModel from "../models/subProduct.js";
// import { HttpException } from "../exceptions/exceptions.js";
// import stockModel from "../models/stockModel.js";
// import franchiseModel from "../models/franchiseModel.js";
// import lodash from "lodash";
// const { toNumber } = lodash;

// // add stock

// export async function addStock(data) {
//   try {
//     // Find the product by ID
//     let product = await productModel
//       .findById(data.product)
//       .populate("stock.franchiseId");
//     if (!product){
//        product = await subProductModel
//         .findById(data.product)
//         .populate("stock.franchiseId");
//         if(!product) throw new HttpException(404, "Product not found");
//     }

//     // Ensure product.stock is an array
//     if (!Array.isArray(product.stock)) {
//       product.stock = [];
//     }

//     const totalQuantity = (product.quantity || 0) + data.quantity;
//     product.totalPrice = product.price * totalQuantity;
//     product.quantity = totalQuantity;
//     product.rackNumber = data.rackNumber;

//     // Find franchise
//     const franchiseData = await franchiseModel.findById(data.franchise);
//     if (!franchiseData) throw new HttpException(404, "Franchise not found");

//     // Ensure franchiseData.stock is an array
//     if (!Array.isArray(franchiseData.stock)) {
//       franchiseData.stock = [];
//     }

//     const stockIndex = await product.stock.findIndex(
//       (stock) => stock.franchiseId == data.franchise.toString()
//     );

//     if (stockIndex > -1) {
//       product.stock[stockIndex].quantity += data.quantity;
//             // product.stock[stockIndex].rackNumber = data.rackNumber;

//     } else {
//       product.stock.push({
//         franchiseId: franchiseData._id,
//         quantity: data.quantity,
//         // rackNumber:data?.rackNumber

//       });
//     }
//     const updatedProduct = await product.save();
//     const productDetails = {
//       productId: product._id,
//       productName: product.name,
//       productCode: product.productCode,
//       categoryName: product.category.categoryName,
//       quantity: data.quantity,
//       minimumQuantity: product.minimumQuantity,
//       price: product.price,
//     };
//     const franchiseIndex = await franchiseData.stock.findIndex(
//       (stock) =>
//         stock.productId &&
//         stock.productId.toString() === data.product
//     );

//     if (franchiseIndex > -1) {
//       if(!franchiseData.stock[franchiseIndex].minimumQuantity){
//         franchiseData.stock[franchiseIndex].minimumQuantity =
//           product.minimumQuantity;
//       }
//       franchiseData.stock[franchiseIndex].quantity += data.quantity;
//     } else {
//       franchiseData.stock.push({
//         productId: product._id,
//         productName: product.name,
//         productCode: product.productCode,
//         categoryName: product.category.categoryName,
//         quantity: data.quantity,
//         minimumQuantity: product.minimumQuantity,
//         price: product.price,
//       });
//     }
//     const updatedFranchise = await franchiseData.save();
//     const stock = new stockModel({
//       product: productDetails,
//       franchise: {
//         franchiseId: franchiseData._id,
//         franchiseName: franchiseData.franchiseName,
//       },
//       totalQuantity: product.quantity,
//       quantity: data.quantity,
//       type: "add",
//     });
//     await stock.save();

//     return { stock };
//   } catch (error) {
//     console.error("Error in addStock function:", error);
//     throw error;
//   }
// }
// //-----------------------------

// //------- out stock -------------

// export async function updateStock(data) {
//   let product = await productModel
//     .findById(data.product)
//     .populate("stock.franchiseId subProducts.subproduct");
//   if (!product) {
//     product = await subProductModel
//       .findById(data.product)
//       .populate("stock.franchiseId");
//     if (!product) throw new HttpException(404, "Product not found");
//   }
//   const stockIndex = product.stock.findIndex(
//     (stock) =>
//       stock.franchiseId._id &&
//       stock.franchiseId._id.toString() === data.franchise
//   );

//   //----- Find franchise -------

//   const franchiseData = await franchiseModel.findById(data.franchise);
//   if (!franchiseData) throw new HttpException(404, "Franchise not found");

//   //----- Check for sub-product stock in the franchise -------

//   if (product.subProducts && product.subProducts.length > 0) {
//     for (const subProdInfo of product.subProducts) {
//       const subProd = await subProductModel.findById(subProdInfo.subproduct);
//       if (subProd) {
//         const subProdStockIndex = subProd.stock.findIndex(
//           (stock) =>
//             stock.franchiseId._id &&
//             stock.franchiseId._id.toString() === data.franchise
//         );

//         if (subProdStockIndex > -1) {
//           if (
//             subProd.stock[subProdStockIndex].quantity <
//             subProdInfo.quantity * data.quantity
//           ) {
//             throw new HttpException(
//               400,
//               `Insufficient stock for sub-product: ${subProd.name}`
//             );
//           }
//         } else {
//           throw new HttpException(
//             404,
//             `Sub-product stock not found in specified store for sub-product: ${subProd.name}`
//           );
//         }
//       }
//     }
//   }

//   if (stockIndex > -1) {
//      // --- ADD THESE CONSOLE.LOGS ---
//     console.log("--- Debugging Stock Out Quantities ---");
//     console.log("Product ID:", product._id);
//     console.log("Franchise ID being processed:", data.franchise);
//     console.log("Quantity requested for stock out (data.quantity):", data.quantity);
//     console.log("Product's overall quantity (product.quantity):", product.quantity);
//     console.log("Product's stock array (full):", JSON.stringify(product.stock, null, 2)); 
//     console.log("Quantity at selected franchise (product.stock[stockIndex].quantity):", product.stock[stockIndex].quantity);
//     console.log("------------------------------------");
//     // --- END CONSOLE.LOGS ---
//     if (product.stock[stockIndex].quantity < data.quantity) {
//       throw new HttpException(400, "Insufficient stock");
//     }
//     const totalQuantity = product.quantity - data.quantity;
//     product.totalPrice = product.price * totalQuantity;

//     product.stock[stockIndex].quantity -= data.quantity;
//     product.quantity -= data.quantity;

//     if (product.subProducts && product.subProducts.length > 0) {
//       for (const subProdInfo of product.subProducts) {
//         const subProd = await subProductModel.findById(subProdInfo.subproduct);
//         if (subProd) {
//           subProd.quantity -= subProdInfo.quantity * data.quantity;
//           await subProd.save();
//         }
//       }
//     }
//   } else {
//     throw new HttpException(404, "Stock not found in specified store");
//   }

//   const updatedProduct = await product.save();

//   const franchiseDetails = {
//     franchiseId: franchiseData._id,
//     franchiseName: franchiseData.franchiseName,
//   };
//   const franchiseIndex = franchiseData.stock.findIndex(
//     (stock) => stock.productId && stock.productId.toString() === data.product
//   );

//   if (franchiseIndex > -1) {
//     franchiseData.stock[franchiseIndex].quantity -= data.quantity;
//   }
//   const updatedFranchise = await franchiseData.save();

//   const productDetails = {
//     productId: product._id,
//     productName: product.name,
//     productCode: product.productCode,
//     categoryName: product.category.categoryName,
//     price: product.price,
//   };

//   const stock = new stockModel({
//     product: productDetails,
//     franchise: franchiseDetails,
//     totalQuantity: product.quantity,
//     quantity: data.quantity,
//     type: "remove",
//   });
//   await stock.save();
//   return { stock };
// }

// //---------- get all stock transactions --------------

// export async function getAllStock(page, limit, query) {
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
//       {
//         "franchise.franchiseName": {
//           $regex: query?.search ? query?.search : "",
//           $options: "i",
//         },
//       },
//     ];
//   }
//   const totalDocs = await stockModel.find().countDocuments();
//    const totalPages =await Math.ceil(totalDocs / limit);
//   const stock = await stockModel
//     .find(queryData)
//     .skip((toNumber(page) - 1) * toNumber(limit))
//     .limit(toNumber(limit))
//     .sort({ createdAt: -1 });
//   return { stock, totalPages, totalDocs };
// }








































// import productModel from "../models/productModel.js";
// import subProductModel from "../models/subProduct.js";
// import { HttpException } from "../exceptions/exceptions.js";
// import stockModel from "../models/stockModel.js";
// import franchiseModel from "../models/franchiseModel.js";
// import lodash from "lodash";
// const { toNumber } = lodash;

// // add stock

// export async function addStock(data) {
//   try {
//     // Find the product by ID
//     let product = await productModel
//       .findById(data.product)
//       .populate("stock.franchiseId");
//     if (!product) {
//       product = await subProductModel
//         .findById(data.product)
//         .populate("stock.franchiseId");
//       if (!product) throw new HttpException(404, "Product not found");
//     }

//     // Ensure product.stock is an array
//     if (!Array.isArray(product.stock)) {
//       product.stock = [];
//     }

//     const totalQuantity = (product.quantity || 0) + data.quantity;
//     product.totalPrice = product.price * totalQuantity;
//     product.quantity = totalQuantity;
//     product.rackNumber = data.rackNumber;

//     // Find franchise
//     const franchiseData = await franchiseModel.findById(data.franchise);
//     if (!franchiseData) throw new HttpException(404, "Franchise not found");

//     // Ensure franchiseData.stock is an array
//     if (!Array.isArray(franchiseData.stock)) {
//       franchiseData.stock = [];
//     }

//     const stockIndex = product.stock.findIndex(
//       (stock) => stock.franchiseId && stock.franchiseId.equals(data.franchise)
//     );

//     if (stockIndex > -1) {
//       product.stock[stockIndex].quantity += data.quantity;
//       console.log(`Updated existing stock for franchise ${data.franchise}. New quantity: ${product.stock[stockIndex].quantity}`);
//     } else {
//       product.stock.push({
//         franchiseId: franchiseData._id,
//         quantity: data.quantity,
//       });
//       console.log(`Added new stock entry for franchise ${data.franchise}. Quantity: ${data.quantity}`);
//     }

//     const updatedProduct = await product.save();
//     console.log("Product saved after addStock. Updated product.stock:", JSON.stringify(updatedProduct.stock, null, 2));


//     const productDetails = {
//       productId: product._id,
//       productName: product.name,
//       productCode: product.productCode,
//       categoryName: product.category.categoryName,
//       quantity: data.quantity,
//       minimumQuantity: product.minimumQuantity,
//       price: product.price,
//     };
//     const franchiseIndex = await franchiseData.stock.findIndex(
//       (stock) =>
//         stock.productId &&
//         stock.productId.toString() === data.product
//     );

//     if (franchiseIndex > -1) {
//       if (!franchiseData.stock[franchiseIndex].minimumQuantity) {
//         franchiseData.stock[franchiseIndex].minimumQuantity =
//           product.minimumQuantity;
//       }
//       franchiseData.stock[franchiseIndex].quantity += data.quantity;
//     } else {
//       franchiseData.stock.push({
//         productId: product._id,
//         productName: product.name,
//         productCode: product.productCode,
//         categoryName: product.category.categoryName,
//         quantity: data.quantity,
//         minimumQuantity: product.minimumQuantity,
//         price: product.price,
//       });
//     }
//     const updatedFranchise = await franchiseData.save();
//     const stock = new stockModel({
//       product: productDetails,
//       franchise: {
//         franchiseId: franchiseData._id,
//         franchiseName: franchiseData.franchiseName,
//       },
//       totalQuantity: product.quantity,
//       quantity: data.quantity,
//       type: "add",
//     });
//     await stock.save();

//     return { stock };
//   } catch (error) {
//     console.error("Error in addStock function:", error);
//     throw error;
//   }
// }

// //-----------------------------

// //------- out stock -------------

// export async function updateStock(data) {


//   console.log("--- Debugging updateStock Entry ---");
//   console.log("Received data:", JSON.stringify(data, null, 2));
//   console.log("data.product:", data.product);
//   console.log("data.franchise:", data.franchise); // CRITICAL: Check this value here
//   console.log("data.quantity:", data.quantity);
//   console.log("---------------------------------");


//   let product = await productModel
//     .findById(data.product)
//     .populate("stock.franchiseId subProducts.subproduct");
//   if (!product) {
//     product = await subProductModel
//       .findById(data.product)
//       .populate("stock.franchiseId");
//     if (!product) throw new HttpException(404, "Product not found");
//   }

//   console.log("Product found:", product.name, "ID:", product._id);
//   console.log("Product stock array after find:", JSON.stringify(product.stock, null, 2));

//  const stockIndex = product.stock.findIndex(
//     (stock) =>
//       stock.franchiseId && stock.franchiseId.equals(data.franchise) // Use .equals() here
//   );

//   //----- Find franchise -------

//   const franchiseData = await franchiseModel.findById(data.franchise);
//   if (!franchiseData) throw new HttpException(404, "Franchise not found");

//   //----- Check for sub-product stock in the franchise -------

//   if (product.subProducts && product.subProducts.length > 0) {
//     for (const subProdInfo of product.subProducts) {
//       const subProd = await subProductModel.findById(subProdInfo.subproduct);
//       if (subProd) {
//         console.log("Checking sub-product:", subProd.name);
//         console.log("Sub-product stock array:", JSON.stringify(subProd.stock, null, 2));
//         console.log("Franchise ID for sub-product check (data.franchise):", data.franchise); // CRITICAL: Check this value here again
//         const subProdStockIndex = subProd.stock.findIndex(
//           (stock) =>
//             stock.franchiseId && stock.franchiseId.equals(data.franchise) // Use .equals() here
//         );

//         if (subProdStockIndex > -1) {
//           if (
//             subProd.stock[subProdStockIndex].quantity <
//             subProdInfo.quantity * data.quantity
//           ) {
//             throw new HttpException(
//               400,
//               `Insufficient stock for sub-product: ${subProd.name}`
//             );
//           }
//         } else {
//           throw new HttpException(
//             404,
//             `Sub-product stock not found in specified store for sub-product: ${subProd.name}`
//           );
//         }
//       }
//     }
//   }

//   if (stockIndex > -1) {
//     // --- ADD THESE CONSOLE.LOGS ---
//     console.log("--- Debugging Stock Out Quantities ---");
//     console.log("Product ID:", product._id);
//     console.log("Franchise ID being processed:", data.franchise);
//     console.log("Quantity requested for stock out (data.quantity):", data.quantity);
//     console.log("Product's overall quantity (product.quantity):", product.quantity);
//     console.log("Product's stock array (full):", JSON.stringify(product.stock, null, 2)); // Stringify for better readability
//     console.log("Quantity at selected franchise (product.stock[stockIndex].quantity):", product.stock[stockIndex].quantity);
//     console.log("------------------------------------");
//     // --- END CONSOLE.LOGS ---
//     if (product.stock[stockIndex].quantity < data.quantity) {
//       throw new HttpException(400, "Insufficient stock");
//     }
//     const totalQuantity = product.quantity - data.quantity;
//     product.totalPrice = product.price * totalQuantity;

//     product.stock[stockIndex].quantity -= data.quantity;
//     product.quantity -= data.quantity;

//     if (product.subProducts && product.subProducts.length > 0) {
//       for (const subProdInfo of product.subProducts) {
//         const subProd = await subProductModel.findById(subProdInfo.subproduct);
//         if (subProd) {
//           subProd.quantity -= subProdInfo.quantity * data.quantity;
//           await subProd.save();
//         }
//       }
//     }
//   } else {
//     throw new HttpException(404, "Stock not found in specified store");
//   }

//   const updatedProduct = await product.save();

//   const franchiseDetails = {
//     franchiseId: franchiseData._id,
//     franchiseName: franchiseData.franchiseName,
//   };
//   const franchiseIndex = franchiseData.stock.findIndex(
//     (stock) => stock.productId && stock.productId.toString() === data.product
//   );

//   if (franchiseIndex > -1) {
//     franchiseData.stock[franchiseIndex].quantity -= data.quantity;
//   }
//   const updatedFranchise = await franchiseData.save();

//   const productDetails = {
//     productId: product._id,
//     productName: product.name,
//     productCode: product.productCode,
//     categoryName: product.category.categoryName,
//     price: product.price,
//   };

//   const stock = new stockModel({
//     product: productDetails,
//     franchise: franchiseDetails,
//     totalQuantity: product.quantity,
//     quantity: data.quantity,
//     type: "remove",
//   });
//   await stock.save();
//   return { stock };
// }

// //---------- get all stock transactions --------------

// export async function getAllStock(page, limit, query) {
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
//       {
//         "franchise.franchiseName": {
//           $regex: query?.search ? query?.search : "",
//           $options: "i",
//         },
//       },
//     ];
//   }
//   const totalDocs = await stockModel.find().countDocuments();
//   const totalPages = await Math.ceil(totalDocs / limit);
//   const stock = await stockModel
//     .find(queryData)
//     .skip((toNumber(page) - 1) * toNumber(limit))
//     .limit(toNumber(limit))
//     .sort({ createdAt: -1 });
//   return { stock, totalPages, totalDocs };
// }













































import productModel from "../models/productModel.js";
import subProductModel from "../models/subProduct.js";
import { HttpException } from "../exceptions/exceptions.js";
import stockModel from "../models/stockModel.js";
import franchiseModel from "../models/franchiseModel.js";
import lodash from "lodash";
const { toNumber } = lodash;

// add stock

export async function addStock(data) {
  try {
    console.log("--- addStock: Received data ---");
    console.log("data:", JSON.stringify(data));
    console.log("data.product:", data.product);
    console.log("data.franchise:", data.franchise);
    console.log("data.quantity:", data.quantity);
    console.log("-------------------------------");

    let product = await productModel
      .findById(data.product)
      .populate("stock.franchiseId");
    if (!product) {
      product = await subProductModel
        .findById(data.product)
        .populate("stock.franchiseId");
      if (!product) throw new HttpException(404, "Product not found");
    }
    console.log("addStock: Product found:", product.name, "ID:", product._id);
    console.log("addStock: Product stock array before update:", JSON.stringify(product.stock, null, 2));

    if (!Array.isArray(product.stock)) {
      product.stock = [];
      console.log("addStock: product.stock was not an array, initialized to empty array.");
    }

    const franchiseData = await franchiseModel.findById(data.franchise);
    if (!franchiseData) throw new HttpException(404, "Franchise not found");
    console.log("addStock: Franchise data found:", franchiseData.franchiseName, "ID:", franchiseData._id);

    console.log("addStock: Before findIndex comparison:");
    console.log("  Type of data.franchise:", typeof data.franchise, "Value:", data.franchise);
    if (product.stock.length > 0) {
        product.stock.forEach((s, i) => {
            console.log(`  stock[${i}].franchiseId:`, s.franchiseId, `Type:`, typeof s.franchiseId, `Is Mongoose ObjectId?`, s.franchiseId && s.franchiseId._bsontype === 'ObjectId');
            if (s.franchiseId) {
                console.log(`  stock[${i}].franchiseId.toString():`, s.franchiseId.toString());
            }
        });
    } else {
        console.log("  Product stock array is empty, will push new entry.");
    }

    const stockIndex = product.stock.findIndex(
      (stock) => stock.franchiseId && stock.franchiseId._id.equals(data.franchise)
    );

    console.log("addStock: stockIndex found:", stockIndex);

    if (stockIndex > -1) {
      product.stock[stockIndex].quantity += data.quantity;
      console.log(`addStock: Updated existing stock for franchise ${data.franchise}. New quantity: ${product.stock[stockIndex].quantity}`);
    } else {
      product.stock.push({
        franchiseId: franchiseData._id,
        quantity: data.quantity,
      });
      console.log(`addStock: Added new stock entry for franchise ${franchiseData._id}. Quantity: ${data.quantity}`);
    }

    // Update overall product quantity
    product.quantity = (product.quantity || 0) + data.quantity;
    product.totalPrice = product.price * product.quantity; // Update totalPrice based on new overall quantity
    product.rackNumber = data.rackNumber; // Update rack number if provided

    const updatedProduct = await product.save();
    console.log("addStock: Product saved. Updated product.stock:", JSON.stringify(updatedProduct.stock, null, 2));
    console.log("addStock: Product overall quantity after save:", updatedProduct.quantity);

    // Update franchise's stock array (this is separate from product's stock array)
    if (!Array.isArray(franchiseData.stock)) {
      franchiseData.stock = [];
      console.log("addStock: franchiseData.stock was not an array, initialized to empty array.");
    }
 
    const franchiseIndex = franchiseData.stock.findIndex(
      (stock) =>
        stock.productId &&
        stock.productId.equals(product._id) // Use .equals() for ObjectId comparison
    );

    if (franchiseIndex > -1) {
      if(!franchiseData.stock[franchiseIndex].minimumQuantity){
        franchiseData.stock[franchiseIndex].minimumQuantity =
          product.minimumQuantity;
      }
      franchiseData.stock[franchiseIndex].quantity += data.quantity;
      console.log(`addStock: Updated existing franchise stock for product ${product._id}. New quantity: ${franchiseData.stock[franchiseIndex].quantity}`);
    } else {
      franchiseData.stock.push({
        productId: product._id,
        productName: product.name,
        productCode: product.productCode,
        categoryName: product.category.categoryName,
        quantity: data.quantity,
        minimumQuantity: product.minimumQuantity,
        price: product.price,
      });
      console.log(`addStock: Added new franchise stock entry for product ${product._id}. Quantity: ${data.quantity}`);
    }
    const updatedFranchise = await franchiseData.save();
    console.log("addStock: Franchise saved. Updated franchise.stock:", JSON.stringify(updatedFranchise.stock, null, 2));

    // Create and save stock transaction record
    const stock = new stockModel({
      product: {
        productId: product._id,
        productName: product.name,
        productCode: product.productCode,
        categoryName: product.category.categoryName,
        quantity: data.quantity,
        minimumQuantity: product.minimumQuantity,
        price: product.price,
      },
      franchise: {
        franchiseId: franchiseData._id,
        franchiseName: franchiseData.franchiseName,
      },
      totalQuantity: updatedProduct.quantity, // Use updated overall product quantity
      quantity: data.quantity,
      type: "add",
    });
    await stock.save();
    console.log("addStock: Stock transaction record saved.");

    return { stock };
  } catch (error) {
    console.error("Error in addStock function:", error);
    throw error;
  }
}

// get all stock reports

export async function getAllStock(page, limit, query) {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const results = {};

  let stockQuery = {};
  if (query.franchise) {
    stockQuery["franchise.franchiseId"] = query.franchise;
  }
  if (query.type) {
    stockQuery.type = query.type;
  }
  if (query.search) {
    stockQuery["product.productName"] = { $regex: query.search, $options: "i" };
  }

  const totalCount = await stockModel.countDocuments(stockQuery);
  results.totalPages = Math.ceil(totalCount / limit);
  results.totalCount = totalCount;

  results.results = await stockModel
    .find(stockQuery)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  return results;
}

// update stock (used for stock out)

export async function updateStock(data) {
  try {
    console.log("--- updateStock: Received data ---");
    console.log("data:", JSON.stringify(data));
    console.log("data.product:", data.product);
    console.log("data.franchise:", data.franchise);
    console.log("data.quantity:", data.quantity);
    console.log("----------------------------------");

    // Step 1: Fetch the product to get the latest data
    let product = await productModel
      .findById(data.product)
      .populate("stock.franchiseId subProducts.subproduct");
    if (!product) {
      product = await subProductModel
        .findById(data.product)
        .populate("stock.franchiseId");
      if (!product) throw new HttpException(404, "Product not found");
    }

    console.log("updateStock: Product found:", product.name, "ID:", product._id);
    console.log("updateStock: Product stock array after re-fetch (before check):");
    console.log(JSON.stringify(product.stock, null, 2));

    const stockIndex = product.stock.findIndex(
      (stock) => stock.franchiseId && stock.franchiseId._id.equals(data.franchise)
    );

    console.log("updateStock: stockIndex found:", stockIndex);

    if (stockIndex === -1) {
      throw new HttpException(404, "Stock not found in specified store");
    }

    // Perform quantity check using the fetched product's stock
    const currentFranchiseQuantity = toNumber(product.stock[stockIndex].quantity);
    const requestedQuantity = toNumber(data.quantity);

    console.log(`updateStock: Comparing currentFranchiseQuantity (${currentFranchiseQuantity}, type: ${typeof currentFranchiseQuantity}) with requestedQuantity (${requestedQuantity}, type: ${typeof requestedQuantity})`);

    if (currentFranchiseQuantity < requestedQuantity) {
      throw new HttpException(400, "Insufficient stock");
    }

    // Step 2: Update the product's stock array and overall quantity
    // Use findByIdAndUpdate with $set for the specific array element and $inc for overall quantity
    const updatedProduct = await productModel.findByIdAndUpdate(
      product._id,
      {
        $inc: { quantity: -requestedQuantity }, // Decrement overall product quantity
        $set: { [`stock.${stockIndex}.quantity`]: currentFranchiseQuantity - requestedQuantity } // Decrement specific franchise quantity
      },
      { new: true, runValidators: true }
    ).populate("stock.franchiseId subProducts.subproduct");

    if (!updatedProduct) {
      throw new HttpException(500, "Failed to update product stock after quantity check.");
    }

    console.log("updateStock: Product saved. Updated product.stock:", JSON.stringify(updatedProduct.stock, null, 2));
    console.log("updateStock: Product overall quantity after save:", updatedProduct.quantity);

    // Update franchise's stock array (this is separate from product's stock array)
    const updatedFranchise = await franchiseModel.findOneAndUpdate(
      {
        _id: data.franchise,
        "stock.productId": product._id, // Match the product within the franchise's stock array
      },
      {
        $inc: { "stock.$.quantity": -requestedQuantity }
      },
      { new: true, runValidators: true }
    );

    if (!updatedFranchise) {
      // This should ideally not happen if the product was found in the franchise's stock initially
      throw new HttpException(500, "Failed to update franchise stock after quantity check.");
    }

    console.log("updateStock: Franchise saved. Updated franchise.stock:", JSON.stringify(updatedFranchise.stock, null, 2));

    // Create and save stock transaction record
    const stock = new stockModel({
      product: {
        productId: updatedProduct._id,
        productName: updatedProduct.name,
        productCode: updatedProduct.productCode,
        categoryName: updatedProduct.category.categoryName,
        quantity: requestedQuantity,
        minimumQuantity: updatedProduct.minimumQuantity,
        price: updatedProduct.price,
      },
      franchise: {
        franchiseId: updatedFranchise._id,
        franchiseName: updatedFranchise.franchiseName,
      },
      totalQuantity: updatedProduct.quantity,
      quantity: requestedQuantity,
      type: "out",
    });
    await stock.save();
    console.log("updateStock: Stock transaction record saved.");

    return { stock };
  } catch (error) {
    console.error("Error in updateStock function:", error);
    throw error;
  }
}








