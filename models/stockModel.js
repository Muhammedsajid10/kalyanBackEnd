import mongoose from "mongoose";

const Schema = mongoose.Schema;

const stockSchema = new Schema(
  {
    product: {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: {
        type: String,
      },
      productCode: {
        type: String,
      },
      price: {
        type: Number,
      },
      categoryName:{
        type:String
      },
    },
    franchise: {
      franchiseId: {
        type: Schema.Types.ObjectId,
        ref: "Franchise",
      },
      franchiseName: {
        type: String,
      },
    },
    totalQuantity: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["add", "remove"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;
