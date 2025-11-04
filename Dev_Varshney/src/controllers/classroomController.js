import Classroom from '../models/Classroom.js';
import { nanoid } from 'nanoid';

export const createClassroom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });


    let code = nanoid(6);
    while (await Classroom.findOne({ code })) code = nanoid(6);

    const classroom = await Classroom.create({
      name,
      code,
      teacher: req.user.id
    });

    res.status(201).json({ success: true, classroom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinClassroom = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code required' });

    const classroom = await Classroom.findOne({ code });
    if (!classroom) return res.status(404).json({ message: 'Invalid classroom code' });

    await Classroom.findByIdAndUpdate(classroom._id, { $addToSet: { students: req.user.id } });

    res.json({ success: true, classroomId: classroom._id, message: 'Joined classroom' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyClassrooms = async (req, res) => {
  try {
    const asTeacher = await Classroom.find({ teacher: req.user.id }).populate('quizzes');
    const asStudent = await Classroom.find({ students: req.user.id }).populate('quizzes');
    res.json({ teacher: asTeacher, student: asStudent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findById(id).populate('students', 'name email profilePic role');
    if (!classroom) return res.status(404).json({ message: 'Class not found' });
    res.json({ students: classroom.students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
