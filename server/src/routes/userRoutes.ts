import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile 
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Register user
router.post('/', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile
router.get('/profile', protect, getUserProfile);

export default router; 