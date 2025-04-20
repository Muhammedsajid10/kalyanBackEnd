import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const authorizeRoles = async (req, res, next) => {
  const token =
    (req.header("Authorization") &&
      req.header("Authorization").split("Bearer ")[1]) ||
    null;

  if (!token) {
    return res
      .status(401)
      .send({ message: "Access denied. No token provided" });
  }

  try {
    const decoded = jwt.verify(token, 'stock_management');
    const user = await userModel.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(400).send({ message: "Invalid user" });
    }

    req.body.user = user;
  next();
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Invalid token" });
  }
};

