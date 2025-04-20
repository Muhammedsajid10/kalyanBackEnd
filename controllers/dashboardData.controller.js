import { getDashbordDatas } from "../services/dashboard.service.js";

// get all category
export async function getDashboardData(req, res, next) {
  try {
    const result = await getDashbordDatas();
    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}
