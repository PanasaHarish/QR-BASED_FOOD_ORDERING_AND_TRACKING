import Review from '../models/Review.js';

export const createReview = async (req, res) => {
    try {
        const { rating, comment, customerPhone, restaurant, order } = req.body;
        const review = await Review.create({
            rating, comment, customerPhone, restaurant, order
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ restaurant: req.user._id }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
