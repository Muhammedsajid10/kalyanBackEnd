import mongoose from "mongoose";
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

    // Step 1: Fetch the product or subproduct WITHOUT populating stock.franchiseId for update
    let product = await productModel.findById(data.product);
    let model = productModel;
    if (!product) {
      product = await subProductModel.findById(data.product);
      model = subProductModel;
      if (!product) throw new HttpException(404, "Product not found");
    }

    console.log("updateStock: Product found:", product.name, "ID:", product._id);
    console.log("updateStock: Product stock array (unpopulated):");
    console.log(JSON.stringify(product.stock, null, 2));

    const stockIndex = product.stock.findIndex(
      (stock) => stock.franchiseId && stock.franchiseId.toString() === data.franchise
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

    // Step 2: Update the product's stock array and overall quantity using the correct model
    const updatedProduct = await model.findByIdAndUpdate(
      product._id,
      {
        $inc: { quantity: -requestedQuantity }, // Decrement overall product quantity
        $set: { "stock.$[elem].quantity": currentFranchiseQuantity - requestedQuantity } // Decrement specific franchise quantity
      },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ "elem.franchiseId": new mongoose.Types.ObjectId(data.franchise) }]
      }
    );

    if (!updatedProduct) {
      throw new HttpException(500, "Failed to update product stock after quantity check.");
    }

    console.log("updateStock: Product updated successfully. Updated product.stock:", JSON.stringify(updatedProduct.stock, null, 2));
    console.log("updateStock: Product overall quantity after save:", updatedProduct.quantity);

    // Step 3: Fetch the updated product with populated data for response
    let populatePaths = "stock.franchiseId";
    if (model.modelName === "Product") {
      populatePaths += " subProducts.subproduct";
    }
    const populatedProduct = await model.findById(product._id).populate(populatePaths);

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
        productId: populatedProduct._id,
        productName: populatedProduct.name,
        productCode: populatedProduct.productCode,
        categoryName: populatedProduct.category?.categoryName,
        quantity: requestedQuantity,
        minimumQuantity: populatedProduct.minimumQuantity,
        price: populatedProduct.price,
      },
      franchise: {
        franchiseId: updatedFranchise._id,
        franchiseName: updatedFranchise.franchiseName,
      },
      totalQuantity: populatedProduct.quantity,
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








