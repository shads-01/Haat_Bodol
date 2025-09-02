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
    enum: ["clothes", "books", "electronics", "furnitures", "toys", "utensils", "appliances", "others"],
    required: true,
    default: "others",
  },
  condition: {
    type: String,
    enum: ["like-new", "good", "used", "broken"],
    required: true,
    default: "used",
  },
  //photos: [String], //Image urls
  address: {
    type: String,
    required: true,
  },
  //createdBy --> user id
  reserved: {
    type: Boolean,
    default: false,
  }
},
  {timestamps: true},
);

const Item = mongoose.model("Item", itemSchema);
export default Item;


