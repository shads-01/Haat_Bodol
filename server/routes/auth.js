import express from 'express';
import authController from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import { upload } from '../config/multerConfig.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/profile/picture', auth, upload.single('profilePhoto'), authController.uploadProfilePicture);

export default router;