import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { HttpException } from "../exceptions/exceptions.js";

//------- login --------

export async function userLogin(loginData) {
  const findUser = await userModel.findOne({ email: loginData.email });
  if (!findUser)
    throw new HttpException(404, "user not found");

  const validpassword = await bcrypt.compare(
    loginData.password,
    findUser.password
  );
  if (!validpassword)
    throw new HttpException(404, "Invalid password ");
  const token = jwt.sign({ _id: findUser._id }, 'stock_management');
  return { token };
}
