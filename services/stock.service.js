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
    // Find the product by ID
    let product = await productModel
      .findById(data.product)
      .populate("stock.franchiseId");
    if (!product){
       product = await subProductModel
        .findById(data.product)
        .populate("stock.franchiseId");
        if(!product) throw new HttpException(404, "Product not found");
    }

    // Ensure product.stock is an array
    if (!Array.isArray(product.stock)) {
      product.stock = [];
    }

    const totalQuantity = (product.quantity || 0) + data.quantity;
    product.totalPrice = product.price * totalQuantity;
    product.quantity = totalQuantity;
    product.rackNumber = data.rackNumber;

    // Find franchise
    const franchiseData = await franchiseModel.findById(data.franchise);
    if (!franchiseData) throw new HttpException(404, "Franchise not found");

    // Ensure franchiseData.stock is an array
    if (!Array.isArray(franchiseData.stock)) {
      franchiseData.stock = [];
    }
 
    const stockIndex = await product.stock.findIndex(
      (stock) => stock.franchiseId == data.franchise.toString()
    );

    if (stockIndex > -1) {
      product.stock[stockIndex].quantity += data.quantity;
            // product.stock[stockIndex].rackNumber = data.rackNumber;

    } else {
      product.stock.push({
        franchiseId: franchiseData._id,
        quantity: data.quantity,
        // rackNumber:data?.rackNumber
       
      });
    }
    const updatedProduct = await product.save();
    const productDetails = {
      productId: product._id,
      productName: product.name,
      productCode: product.productCode,
      categoryName: product.category.categoryName,
      quantity: data.quantity,
      minimumQuantity: product.minimumQuantity,
      price: product.price,
    };
    const franchiseIndex = await franchiseData.stock.findIndex(
      (stock) =>
        stock.productId &&
        stock.productId.toString() === data.product
    );

    if (franchiseIndex > -1) {
      if(!franchiseData.stock[franchiseIndex].minimumQuantity){
        franchiseData.stock[franchiseIndex].minimumQuantity =
          product.minimumQuantity;
      }
      franchiseData.stock[franchiseIndex].quantity += data.quantity;
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
    }
    const updatedFranchise = await franchiseData.save();
    const stock = new stockModel({
      product: productDetails,
      franchise: {
        franchiseId: franchiseData._id,
        franchiseName: franchiseData.franchiseName,
      },
      totalQuantity: product.quantity,
      quantity: data.quantity,
      type: "add",
    });
    await stock.save();

    return { stock };
  } catch (error) {
    console.error("Error in addStock function:", error);
    throw error;
  }
}

//-----------------------------

//------- out stock -------------

export async function updateStock(data) {
  let product = await productModel
    .findById(data.product)
    .populate("stock.franchiseId subProducts.subproduct");
  if (!product) {
    product = await subProductModel
      .findById(data.product)
      .populate("stock.franchiseId");
    if (!product) throw new HttpException(404, "Product not found");
  }
  const stockIndex = product.stock.findIndex(
    (stock) =>
      stock.franchiseId._id &&
      stock.franchiseId._id.toString() === data.franchise
  );

  //----- Find franchise -------
  
  const franchiseData = await franchiseModel.findById(data.franchise);
  if (!franchiseData) throw new HttpException(404, "Franchise not found");

  //----- Check for sub-product stock in the franchise -------

  if (product.subProducts && product.subProducts.length > 0) {
    for (const subProdInfo of product.subProducts) {
      const subProd = await subProductModel.findById(subProdInfo.subproduct);
      if (subProd) {
        const subProdStockIndex = subProd.stock.findIndex(
          (stock) =>
            stock.franchiseId._id &&
            stock.franchiseId._id.toString() === data.franchise
        );

        if (subProdStockIndex > -1) {
          if (
            subProd.stock[subProdStockIndex].quantity <
            subProdInfo.quantity * data.quantity
          ) {
            throw new HttpException(
              400,
              `Insufficient stock for sub-product: ${subProd.name}`
            );
          }
        } else {
          throw new HttpException(
            404,
            `Sub-product stock not found in specified store for sub-product: ${subProd.name}`
          );
        }
      }
    }
  }

  if (stockIndex > -1) {
    if (product.stock[stockIndex].quantity < data.quantity) {
      throw new HttpException(400, "Insufficient stock");
    }
    const totalQuantity = product.quantity - data.quantity;
    product.totalPrice = product.price * totalQuantity;

    product.stock[stockIndex].quantity -= data.quantity;
    product.quantity -= data.quantity;

    if (product.subProducts && product.subProducts.length > 0) {
      for (const subProdInfo of product.subProducts) {
        const subProd = await subProductModel.findById(subProdInfo.subproduct);
        if (subProd) {
          subProd.quantity -= subProdInfo.quantity * data.quantity;
          await subProd.save();
        }
      }
    }
  } else {
    throw new HttpException(404, "Stock not found in specified store");
  }

  const updatedProduct = await product.save();

  const franchiseDetails = {
    franchiseId: franchiseData._id,
    franchiseName: franchiseData.franchiseName,
  };
  const franchiseIndex = franchiseData.stock.findIndex(
    (stock) => stock.productId && stock.productId.toString() === data.product
  );

  if (franchiseIndex > -1) {
    franchiseData.stock[franchiseIndex].quantity -= data.quantity;
  }
  const updatedFranchise = await franchiseData.save();

  const productDetails = {
    productId: product._id,
    productName: product.name,
    productCode: product.productCode,
    categoryName: product.category.categoryName,
    price: product.price,
  };

  const stock = new stockModel({
    product: productDetails,
    franchise: franchiseDetails,
    totalQuantity: product.quantity,
    quantity: data.quantity,
    type: "remove",
  });
  await stock.save();
  return { stock };
}

//---------- get all stock transactions --------------

export async function getAllStock(page, limit, query) {
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
      {
        "franchise.franchiseName": {
          $regex: query?.search ? query?.search : "",
          $options: "i",
        },
      },
    ];
  }
  const totalDocs = await stockModel.find().countDocuments();
   const totalPages =await Math.ceil(totalDocs / limit);
  const stock = await stockModel
    .find(queryData)
    .skip((toNumber(page) - 1) * toNumber(limit))
    .limit(toNumber(limit))
    .sort({ createdAt: -1 });
  return { stock, totalPages, totalDocs };
}
