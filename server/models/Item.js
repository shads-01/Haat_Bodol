import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 400,
    },
    category: {
      type: String,
      enum: [
        "clothes",
        "books",
        "electronics",
        "furnitures",
        "toys",
        "utensils",
        "appliances",
        "others",
      ],
      required: true,
      default: "others",
    },
    condition: {
      type: String,
      enum: ["like-new", "good", "used", "broken"],
      required: true,
      default: "used",
    },
    photos: [
      {
        url: String,
        public_id: String,
      },
    ],
    address: {
      type: String,
      required: true,
    },
    donatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "donated"],
      default: "available",
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
