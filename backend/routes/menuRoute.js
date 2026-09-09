import express from 'express';
import { getMenuItems, getOwnerMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getMenuItems)
    .post(protect, addMenuItem);

router.route('/owner').get(protect, getOwnerMenuItems);

router.route('/:id')
    .put(protect, updateMenuItem)
    .delete(protect, deleteMenuItem);

export default router;
