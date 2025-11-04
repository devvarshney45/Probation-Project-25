import express from 'express';
import { verifyJWT } from '../middleware/authMiddleware.js'; 
import { getUserProfile } from '../controllers/userController.js';
const router = express.Router();
router.get('/profile', verifyJWT, getUserProfile);
export default router;
