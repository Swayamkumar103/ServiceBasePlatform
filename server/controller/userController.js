import User from '../module/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId)=>{
    return jwt.sign(
        {id: userId},
        process.env.JWT_SECRET || 'your_super_secret_key_here',
        {expiresIn:'7d'},
    );
};

export const registerUser = async(req,res)=>{
    try{
        const {name,email,password,phone,phoneNumber} = req.body;
        if(!name|| !email || !password || (!phoneNumber && !phone)){
            return res.status(400).json({message: 'Please provide all required fields' });
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exist"})
        }
        // Create new user (password gets hashed automatically via model middleware)
        const user = await User.create({ name, email, password, phoneNumber: phoneNumber || phone });

        // Generate token for the new user
        const token = generateToken(user._id);

        // Send back user info and token
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        });
    } catch(error){
        console.log('Register error: ',error);
        res.status(500).json({message:'Server error during registration'})
    }
}

export const loginUser = async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: "Please provide email and password"});
        }
        const user = await User.findOne({email}).select('+password');
        if(!user){
            return res.status(401).json({message:'Invalid email or password'});
        }

        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid email or password'});
        }
        const token = generateToken(user._id);

        res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        });
    } catch(error){
        console.log("Login error: ",error);
        res.status(500).json({message:'Server error during login'});
    }
};

// --- Get user location ---

export const updateUserLocation = async (req, res) => {
    try {

        const { latitude, longitude, address } = req.body;

        await User.findByIdAndUpdate(req.user._id, {
            location: {
                latitude,
                longitude,
                address: address || ''
            }
        });

        res.status(200).json({
            success: true,
            message: "Location updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// --- GET current logged-in user profile ---
// GET /api/users/profile
export const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

