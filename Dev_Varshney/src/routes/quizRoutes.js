import express from 'express';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { createQuiz, addQuestion, getQuizzesByClassroom, getQuizForUser, submitQuiz, getQuizResults } from '../controllers/quizController.js';

const router = express.Router();
router.post('/create', verifyJWT, requireRole('teacher'), createQuiz);
router.post('/add-question', verifyJWT, requireRole('teacher'), addQuestion);
router.get('/classroom/:classroomId', verifyJWT, getQuizzesByClassroom);
router.get('/:quizId', verifyJWT, getQuizForUser);
router.post('/:quizId/submit', verifyJWT, requireRole('student'), submitQuiz);
router.get('/:quizId/results', verifyJWT, requireRole('teacher'), getQuizResults);

export default router;
