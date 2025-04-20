import multer from "multer";
import fs from "fs";

// Define the destination folders
const userUploadsFolder = "uploads/users";
const productUploadsFolder = "uploads/products";

// Ensure the destination folders exist, create them if they don't
fs.mkdirSync(userUploadsFolder, { recursive: true });
fs.mkdirSync(productUploadsFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder;
    if (file.fieldname === "profile") {
      folder = userUploadsFolder;
    } else if (file.fieldname === "product") {
      folder = productUploadsFolder;
    } else {
      // Handle other field names or errors here
      return cb(new Error("Invalid field name"));
    }
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
});

export const upload = multer({ storage });
