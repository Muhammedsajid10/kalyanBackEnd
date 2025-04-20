import mongoose from "mongoose";
import { HttpException } from "../exceptions/exceptions.js";
import franchiseModel from "../models/franchiseModel.js";

//----------------add new Franchise ------------

export async function saveFranchise(data) {
  const findFranchise = await franchiseModel.findOne({
    franchiseName: {
      $regex: new RegExp("^" + data.franchiseName + "$", "i"),
    },
  });
  if (findFranchise) throw new HttpException(400, "franchise already exist");
  const franchise = await franchiseModel.create({ ...data });
  return { franchise };
}

//--------------get all Franchise ----------

export async function getAllFranchise() {
  const franchise = await franchiseModel.find().sort({ createdAt: -1 });
  const total = await franchiseModel.find().countDocuments();
  return { franchise, total };
}

//---------------- update Franchise ---------------

export async function updFranchise(franchiseData, franchiseId) {
  if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
    throw new HttpException(400, "Invalid franchise ID");
  }

  if (franchiseData.franchiseName) {
    const findFranchise = await franchiseModel.findOne({
      franchiseName: {
        $regex: new RegExp("^" + franchiseData.franchiseName + "$", "i"),
      },
    });
    if (findFranchise && findFranchise._id.toString() !== franchiseId) {
      throw new HttpException(400, "Franchise with this name already exists");
    }
  }

  const franchise = await franchiseModel.findByIdAndUpdate(
    franchiseId,
    franchiseData,
    { new: true }
  );

  if (!franchise) {
    throw new HttpException(404, "Franchise not found");
  }
  return { franchise };
}

//----------- delete Franchise -----------

export async function dltFranchise(franchiseId) {
  if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
    throw new HttpException(400, "Invalid franchise ID");
  }

  const franchise = await franchiseModel.findByIdAndDelete(franchiseId);
  if (!franchise) throw new HttpException(404, "franchise not found");
  return { franchise };
}

//------- find single franchise ------------

export async function findFranchise(franchiseId) {
  const franchise = await franchiseModel.findById(franchiseId);
  if (!franchise) throw new HttpException(404, "franchise not found");
  return franchise;
}
