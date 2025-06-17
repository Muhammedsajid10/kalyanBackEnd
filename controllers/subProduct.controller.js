//------ add new product ------

import {deleteSubProduct, findAllSubProductByFranchise, findSingleSubProduct, getAll, saveSubProduct, subProductUpdate} from '../services/subProduct.service.js'
export async function  createSubProduct(req, res, next) {
  try {
    const subproductData = req.body;
    const subproduct = await saveSubProduct(subproductData);
    res
      .status(200)
      .send({ message: "SubProduct added successfully", subproduct });
  } catch (err) {
    next(err);
  }
}


//----- update a subproduct ------

export async function updateSubProduct(req, res, next) {
  try {
    const productData = req.body;
    const productId = req.params.id;
    // const files = req.files;
    const subProduct = await subProductUpdate(productId, productData);

    res
      .status(200)
      .send({ message: "Product updated successfully", subProduct });
  } catch (err) {
    next(err);
  }
}

//---- get all subProducts ----

export async function getAllSubProduct(req, res, next) {
  try {
    const query = req.query;
    const page = req.query.page;
    const limit = req.query.limit;
    const result = await getAll(page, limit, query);

    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}


//------ get single subproduct -------

export async function getSingleSubProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const result = await findSingleSubProduct(productId);

    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}

//-------- get filtered subproduct by franchise --------

export async function  getAllSubProductByFranchise(req, res, next) {
  try {
    const franchiseId = req.query.franchise; 
    const page = req.query.page || 1;
    const limit = req.query.limit || 10; 

    if (!franchiseId) {
      return res
        .status(400)
        .send({ error: "Missing required parameter: franchise" });
    }

    const result = await findAllSubProductByFranchise(page, limit, franchiseId);

    res.status(200).send(result);
  } catch (err) {
    console.error(err); // Log the error for debugging
    next(err);
  }
}

// delete a subproduct

export async function removeSubProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const result = await deleteSubProduct(productId);
    res.status(200).send({ message: "Product Removed successfully", result });
  } catch (err) {
    next(err);
  }
}