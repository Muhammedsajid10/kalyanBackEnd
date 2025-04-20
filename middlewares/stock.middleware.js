export function stockValidator(req, res, next) {
  if (req.body) {
    let { product, quantity, franchise } = req.body;

    if (!product) {
      res.status(400).send({ message: "product is required" });
      return;
    }
    if (!franchise) {
      res.status(400).send({ message: "franchise is required" });
      return;
    }
    if (!quantity) {
      res.status(400).send({ message: "quantity is required" });
      return;
    }
  }
  next();
}
