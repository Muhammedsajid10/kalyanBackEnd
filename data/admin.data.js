import bcrypt from "bcryptjs";
const admin = {
  name: "Admin",
  email: "admin@gmail.com",
  password: bcrypt.hashSync("admin123", 10),
};
export default admin;

export const franchise = {
  franchiseName: "kalyan main hub",
  stock: [],
};