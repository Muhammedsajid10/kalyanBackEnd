import {
  deleteProduct,
  findAllProductByFranchise,
  findSingleProduct,
  getAll,
  productUpdate,
  saveProduct,
} from "../services/product.service.js";

//------ add new product -------

export async function createProduct(req, res, next) {
  try {
    const productData = req.body;
    const product = await saveProduct(productData);
    res.status(200).send({ message: "Product added successfully" ,product});
  } catch (err) {
    next(err);
  }
}

//------- update a product --------

export async function updateProduct(req, res, next) {
  try {
    const productData = req.body;
    const productId = req.params.id;
    // const files = req.files;
    const product = await productUpdate(productId, productData);

    res.status(200).send({ message: "Product updated successfully" ,product});
  } catch (err) {
    console.log(err);
    next(err);
  }
}

//-------- get all products ---------

export async function getAllProduct(req, res, next) {
  try {
    const query = req.query;
    const page = req.query.page;
    const limit = req.query.limit || "10";
    const result = await getAll(page, limit, query);

    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}

//-------- get filtered product by category ---------

export async function getAllProductByFranchise(req, res, next) {
  try {
    const franchiseId = req.query.franchise; 
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    
    if (!franchiseId) {
      return res
        .status(400)
        .send({ error: "Missing required parameter: franchise" });
    }

    const result = await findAllProductByFranchise(page, limit, franchiseId);

    res.status(200).send(result);
  } catch (err) {
    console.error(err); // Log the error for debugging
    next(err);
  }
}

//-------- get single product -----------

export async function getSingleProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const result = await findSingleProduct(productId);

    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}

// delete a product

export async function removeProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const result = await deleteProduct(productId);
    res.status(200).send({ message: "Product Removed successfully", result });
  } catch (err) {
    next(err);
  }
}
