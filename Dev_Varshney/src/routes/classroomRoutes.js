import express from 'express';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { createClassroom, joinClassroom, getMyClassrooms, getClassStudents } from '../controllers/classroomController.js';

const router = express.Router();
router.post('/create', verifyJWT, requireRole('teacher'), createClassroom);
router.post('/join', verifyJWT, requireRole('student'), joinClassroom);
router.get('/my', verifyJWT, getMyClassrooms);
router.get('/:id/students', verifyJWT, requireRole('teacher'), getClassStudents);

export default router;
