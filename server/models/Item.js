import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
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
  meetingPref: {
    date: Date,
    time: String,
  },
  location: {
    type: String,
    required: true,
  },
  //createdBy --> user id
},
  {timestamps: true},
);
const Item = mongoose.model("Item", itemSchema);
export default Item;
