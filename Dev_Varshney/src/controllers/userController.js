import User from '../models/User.js';
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-googleId -createdAt -__v'); 
        
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic
            });
        } else {
            res.status(404).json({ message: 'User not found in database.' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ message: 'Server error while fetching profile.' });
    }
};
