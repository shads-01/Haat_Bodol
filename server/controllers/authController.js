import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { sendVerificationEmail, welcomeEmail } from "../middleware/email.js";

// Temporary storage for unverified users
const unverifiedUsers = new Map();

// Validation functions
const validateName = (name) => {
  const nameRegex = /^[A-Za-zÀ-ÿ\s\u0980-\u09FF]+$/;
  return nameRegex.test(name.trim());
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePhone = (phone) => {
  const phoneRegex = /^01[3-9]\d{8}$/;
  return phoneRegex.test(phone.trim());
};

const validateAddress = (address) => {
  const trimmedAddress = address.trim();
  return trimmedAddress.length >= 5 && /[A-Za-zÀ-ÿ\u0980-\u09FF]/.test(trimmedAddress);
};

const validatePassword = (password) => {
  return password.length >= 6; // Minimum password length
};

const validateDOB = (dob) => {
  // Validate dd/mm/yyyy format
  const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!dobRegex.test(dob)) {
    return false;
  }

  // Parse the date to check if it's a valid date
  const parts = dob.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Check if the date is valid
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false;
  }

  return true;
};

// Register a new user (but don't save to DB until verification)
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, dob } = req.body;

    // Check all required fields
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    // Validate name
    if (!validateName(name)) {
      return res.status(400).json({ message: "Name should only contain letters and spaces." });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    // Validate phone
    if (!validatePhone(phone)) {
      return res.status(400).json({ message: "Please enter a valid Bangladeshi phone number (e.g., 017XXXXXXXX)." });
    }

    // Validate address
    if (!validateAddress(address)) {
      return res.status(400).json({ message: "Please enter a valid address." });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Validate DOB if provided
    if (dob && !validateDOB(dob)) {
      return res.status(400).json({ message: "Please enter a valid date of birth in dd/mm/yyyy format." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login" });
    }

    // Check if there's already a pending verification
    if (unverifiedUsers.has(email)) {
      // Instead of returning error, allow resending verification
      const userData = unverifiedUsers.get(email);

      // Generate new verification code
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      userData.verificationCode = newVerificationCode;
      userData.createdAt = new Date();

      // Send verification email
      await sendVerificationEmail(email, newVerificationCode);

      return res.status(200).json({
        message: 'Verification code sent to your email',
        email: email
      });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Store user data temporarily
    const userData = {
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      phone: phone.trim(),
      address: address.trim(),
      dob: dob ? dob.trim() : '',
      verificationCode,
      createdAt: new Date()
    };

    // Store in temporary storage
    unverifiedUsers.set(email, userData);

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      message: 'Verification code sent to your email',
      email: email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Verify email and create user
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Get user data from temporary storage
    const userData = unverifiedUsers.get(email);
    if (!userData) {
      return res.status(400).json({ message: 'No pending verification for this email or code expired' });
    }

    // Check if verification code matches
    if (userData.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check if code is expired (10 minutes)
    if (Date.now() - userData.createdAt > 10 * 60 * 1000) {
      unverifiedUsers.delete(email);
      return res.status(400).json({ message: 'Verification code expired' });
    }

    // Create the user in database
    const user = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      address: userData.address,
      dob: userData.dob,
      isVerified: true
    });

    await user.save();

    // Remove from temporary storage
    unverifiedUsers.delete(email);

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send welcome email
    await welcomeEmail(user.email, user.name);

    res.status(201).json({
      message: 'Email verified and account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Login user (only verified users can login)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find user - only verified users can login
    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials or email not verified" });
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

    // Set token as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
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
        isVerified: user.isVerified
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Resend verification code
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user exists in temporary storage
    const userData = unverifiedUsers.get(email);
    if (!userData) {
      return res.status(400).json({ message: 'No pending verification for this email' });
    }

    // Generate new verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update the verification code
    userData.verificationCode = newVerificationCode;
    userData.createdAt = new Date();
    unverifiedUsers.set(email, userData);

    // Send email
    await sendVerificationEmail(email, newVerificationCode);

    res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error while resending verification' });
  }
};

// Clean up expired unverified users periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, userData] of unverifiedUsers.entries()) {
    if (now - userData.createdAt > 10 * 60 * 1000) {
      unverifiedUsers.delete(email);
      console.log(`Cleaned up expired registration for: ${email}`);
    }
  }
}, 60 * 1000);

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Upload profile pic
const uploadProfilePicture = async (req, res) => {
  try {
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

    // Validate inputs if provided
    if (name && !validateName(name)) {
      return res.status(400).json({ message: "Name should only contain letters and spaces." });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ message: "Please enter a valid Bangladeshi phone number." });
    }

    if (address && !validateAddress(address)) {
      return res.status(400).json({ message: "Please enter a valid address." });
    }

    if (dob && !validateDOB(dob)) {
      return res.status(400).json({ message: "Please enter a valid date of birth in dd/mm/yyyy format." });
    }

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

const getProfileByID = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Received ID:', id); // Debug log

    // Validate if ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    console.log('Looking for user with ID:', id); // Debug log

    const user = await User.findById(id).select('-password -__v');
    
    console.log('User found:', user ? 'Yes' : 'No'); // Debug log

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format join date using the joinDate field from your schema
    const formatJoinDate = (date) => {
      try {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      } catch (error) {
        return 'Unknown';
      }
    };

    console.log('Preparing response data...'); // Debug log

    // Prepare response data matching your schema fields
    const profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      address: user.address || null,
      dob: user.dob || null,
      profilePic: user.profilePic || null, // This matches your schema structure
      joinDate: formatJoinDate(user.joinDate), // Using joinDate from schema
      level: user.level || 'Bronze', // Using level from schema
      donations: user.donations || 0, // Using donations from schema
      claims: user.claims || 0, // Using claims from schema
      verified: user.isVerified || false,
    };

    console.log('Profile data prepared:', profileData); 

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profileData
    });

  } catch (error) {
    console.error('Error in getProfileByID:', error);
    console.error('Error stack:', error.stack);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  verifyEmail,
  resendVerification,
  getProfileByID
};