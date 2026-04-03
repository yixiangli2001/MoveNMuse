// Shirley
import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
  {
    cartId: {
      type: Number,
      required: true,
      unique: true,
    },
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
    cartItems: [
      {
        itemId: { type: Number},
        productId: { type: Number},
        productType: { type: String},
        occurrenceId: { type: Number},
        title: { type: String},
        price: { type: Number},
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cart", cartSchema);
