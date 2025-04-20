Schema.Types.ObjectId;
import mongoose, { Schema, model } from "mongoose";

const subProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    productCode: {
      type: String,
      required: true,
      // unique: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    minimumQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      categoryId: {
        type: String,
        ref: "Category",
      },
      categoryName: {
        type: String,
      },
    },
    rackNumber: {
      type: Number,
    },
    stock: [
      {
        franchiseId: {
          type: Schema.Types.ObjectId,
          ref: "Franchise",
        },
        quantity: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

const SubProduct = model("SubProduct", subProductSchema);

export default SubProduct;
