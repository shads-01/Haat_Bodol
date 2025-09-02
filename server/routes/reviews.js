import express from 'express';
import {
    getUserReviews,
    createReview,
    getMyReviews
} from '../controllers/reviewsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/user/:userId', getUserReviews);

router.get('/me', auth, getMyReviews);

router.post('/', auth, createReview);

export default router;