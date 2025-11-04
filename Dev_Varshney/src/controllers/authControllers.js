import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerTeacher = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "All fields required" });

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "teacher",
    });

    const token = generateToken(user._id, user.role);
    const data = user.toObject();
    delete data.password;
    res.status(201).json({ success: true, user: data, token });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginTeacher = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "All fields required" });

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || user.role !== "teacher")
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (user.googleId)
      return res.status(401).json({ success: false, message: "Use Google login" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);
    const data = user.toObject();
    delete data.password;
    res.status(200).json({ success: true, user: data, token });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const googleLoginTeacher = async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!GOOGLE_CLIENT_ID)
      return res.status(500).json({ success: false, message: "Server config error" });

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId, role: "teacher" });
    } else if (user.role !== "teacher") {
      return res.status(403).json({ success: false, message: "This email is registered as student" });
    }

    const token = generateToken(user._id, user.role);
    res.status(200).json({ success: true, user, token });
  } catch (e) {
    res.status(400).json({ success: false, message: "Google login failed" });
  }
};


export const registerStudent = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "All fields required" });

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "student",
    });

    const token = generateToken(user._id, user.role);
    const data = user.toObject();
    delete data.password;
    res.status(201).json({ success: true, user: data, token });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginStudent = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "All fields required" });

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || user.role !== "student")
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (user.googleId)
      return res.status(401).json({ success: false, message: "Use Google login" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);
    const data = user.toObject();
    delete data.password;
    res.status(200).json({ success: true, user: data, token });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const googleLoginStudent = async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!GOOGLE_CLIENT_ID)
      return res.status(500).json({ success: false, message: "Server config error" });

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId, role: "student" });
    } else if (user.role !== "student") {
      return res.status(403).json({ success: false, message: "This email is registered as teacher" });
    }

    const token = generateToken(user._id, user.role);
    res.status(200).json({ success: true, user, token });
  } catch (e) {
    res.status(400).json({ success: false, message: "Google login failed" });
  }
};
