import express from "express";
import { login } from "../controllers/auth.controller.js";
import { loginValidator } from "../middlewares/login.validation.middleware.js";
const router = express.Router();

//........user login and log out...........//
router.post('/auth/login', loginValidator, login);

export default router;
