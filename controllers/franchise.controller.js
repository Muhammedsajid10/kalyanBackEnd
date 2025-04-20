import { dltFranchise, findFranchise, getAllFranchise, saveFranchise, updFranchise } from "../services/franchise.service.js";

// add new franchise
export async function addFranchise(req, res, next) {
  try {
    const franchiseData = req.body;
    const result = await saveFranchise(franchiseData);
    res.status(200).send({ message: "Franchise added Successfully " });
  } catch (err) {
    next(err);
  
}
}
// get all franchise
export async function getAll(req, res, next) {
  try {
    const result = await getAllFranchise();
    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}

// get single franchise


export async function getSingleFranchise(req, res, next) {
  try {
    const franchiseId = req.params.id;
    const result = await findFranchise(franchiseId);
    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}


// update a franchise
export async function updateFranchise(req, res, next) {
  try {
    const franchiseData = req.body;
    const franchiseId = req.params.id;
    const result = await updFranchise(franchiseData, franchiseId);
    res.status(200).send({ result, message: "franchise updated successfully" });
  } catch (err) {
    next(err);
  }
}

// delete a franchise
export async function deleteFranchise(req, res, next) {
  try {
    const franchiseId = req.params.id;
    const result = await dltFranchise(franchiseId);
    res.status(200).send({result, message: "Franchise deleted successfully" });
  } catch (err) {
    next(err);
  }
}
