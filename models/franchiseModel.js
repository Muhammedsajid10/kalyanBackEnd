import mongoose from "mongoose";

const Schema = mongoose.Schema;

const franchiseSchema = new Schema(
  {
    franchiseName: {
      type: String,
      required: true,
      unique: true,
    },
    stock: [
      {
         productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        productName: {
          type: String,
        },
        productCode: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        minimumQuantity:{
          type: Number,
        },
        price: {
          type: Number,
        },
        categoryName: {
          type: String,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);

const Franchise = mongoose.model("Franchise", franchiseSchema);
export default Franchise;
