/*import express from 'express';
//import { googleLogin } from '../controllers/authControllers.js'; 
import { register, login, googleLogin } from '../controllers/authControllers.js'; 
const router = express.Router();
router.post('/google', googleLogin);
router.post('/register', register);
router.post('/login', login);


export default router;
*/
import express from "express";
import {
  registerTeacher,
  loginTeacher,
  googleLoginTeacher,
  registerStudent,
  loginStudent,
  googleLoginStudent,
} from "../controllers/authControllers.js";
//teacher api
const router = express.Router();
router.post("/teacher/register", registerTeacher);
router.post("/teacher/login", loginTeacher);
router.post("/teacher/google-login", googleLoginTeacher);

//  Student API
router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent);
router.post("/student/google-login", googleLoginStudent);
export default router;
