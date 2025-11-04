import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";
import classroomRoutes from "./src/routes/classroomRoutes.js";

dotenv.config();


connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Base route
app.get("/", (req, res) => res.send("DEV Server Running..."));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/classroom", classroomRoutes);

// Start the server
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
