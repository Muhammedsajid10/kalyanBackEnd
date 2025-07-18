export function productValidator(req, res, next) {
  if (req.body) {
    let { name, price, productCode, quantity, category, minimumQuantity, subProducts } =
      req.body;

    if (!name) {
      res.status(400).send({ message: "product name is required" });
      return;
    }
    if (!productCode) {
      res.status(400).send({ message: "product code is required" });
      return;
    }
    if(!quantity) {
      res.status(400).send({message: "quantity name is required"})
    }

    if (!minimumQuantity) {
      res.status(400).send({ message: "minimum Quantity is required" });
      return;
    }
    if (!category) {
      res.status(400).send({ message: "category is required" });
      return;
    }
    if (!price) {
      res.status(400).send({ message: "price is required" });
      return;
    }
     if (
       !subProducts ||
       !Array.isArray(subProducts) ||
       subProducts.length === 0
     ) {
       res.status(400).send({ message: "SubProducts are required" });
       return;
     }
     for (let subProduct of subProducts) {
       if (!subProduct.subproduct) {
         res
           .status(400)
           .send({ message: "SubProduct is required" });
         return;
       }
       if (!subProduct.quantity || subProduct.quantity <= 0) {
         res
           .status(400)
           .send({ message: "Each subProduct must have a valid quantity" });
         return;
       }
     }
  }
  next();
}
