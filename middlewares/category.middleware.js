export function categoryValidator(req, res, next) {
  if (req.body) {
    let { categoryName } = req.body;

    if (!categoryName) {
      res
        .status(400)
        .send({ message: "category name is required" });
      return;
    }
  }
  next();
}
