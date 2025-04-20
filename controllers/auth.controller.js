import { userLogin } from "../services/auth.service.js";


//...........login...............//
export async function login(req, res, next) {
  const loginData = req.body;
  try {
    const response = await userLogin(loginData);
    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
}
