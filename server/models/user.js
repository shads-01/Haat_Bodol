import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  dob: {
    type: String,
    default: "",
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  donations: {
    type: Number,
    default: 0,
  },
  claims: {
    type: Number,
    default: 0,
  },
  level: {
    type: String,
    default: "Bronze",
  },
  profilePic: {
    url: String,
  },
});

export default mongoose.model("User", userSchema);