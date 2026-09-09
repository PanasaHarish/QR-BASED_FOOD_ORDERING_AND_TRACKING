import express from 'express';
import { registerOwner, loginOwner, getProfile, updateProfile, getPublicRestaurantProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerOwner);
router.post('/login', loginOwner);
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.get('/restaurant/:id', getPublicRestaurantProfile);

export default router;
