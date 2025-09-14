import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
        joinDate: user.joinDate,
        donations: user.donations,
        claims: user.claims,
        level: user.level,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

//Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Upload profile pic
export const uploadProfilePicture = async (req, res) => {
  try {
    console.log("File:", req.file);
    console.log("User:", req.user);

    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const imageUrl = req.file.path;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: { url: imageUrl } },
      { new: true }
    );

    res.json({ message: "Uploaded!", user: updatedUser });
  } catch (err) {
    console.error("Profile picture upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address, dob },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  uploadProfilePicture,
};