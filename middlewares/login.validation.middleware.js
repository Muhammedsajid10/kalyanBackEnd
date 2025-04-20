export function loginValidator(req, res, next) {
  // check if the "user" collection is present in the request body
  if (req.body) {
    let { email, password } = req.body;
    if (!email) {
      res.status(400).send({ message: "email is required" });
      return;
    }
    if (!password) {
      res.status(400).send({ message: "password is required" });
      return;
    }
  }
  next();
}
