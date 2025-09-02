import Review from '../models/review.js';
import User from '../models/user.js';

// Get reviews for a user
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const reviewerId = req.userId;
    
    // Get reviewer's name
    const reviewer = await User.findById(reviewerId).select('name');
    if (!reviewer) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }
    
    const review = new Review({
      userId,
      reviewerId,
      reviewerName: reviewer.name,
      rating,
      comment
    });
    
    await review.save();
    
    // Update user's average rating
    await updateUserRating(userId);
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

// Update user's average rating
const updateUserRating = async (userId) => {
  try {
    const reviews = await Review.find({ userId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await User.findByIdAndUpdate(userId, { 
        rating: Math.round(averageRating * 10) / 10 
      });
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};

// Get current user's reviews (reviews written by the authenticated user)
export const getMyReviews = async (req, res) => {
  try {
    const reviewerId = req.userId;
    
    const reviews = await Review.find({ reviewerId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};