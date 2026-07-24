import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import { kMaxLength } from 'node:buffer';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,'Name is required'],
        trim:true,
        maxlenght: [50,'Name cannot exceed 50 character']
    },
    email:{
        type: String,
        required:[true, 'Email is requireed'],
        unique:true,
        lowercase:true,
        trim:true,
        match:[/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password:{
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false        // Don't return password by default in queries
    },
    phoneNumber:{
      type: Number,
      required:[true,'Phone Number is rquired'],
      maxlenght :[10,'Phone Number must be 10 digit']
    },

    location: {
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        },
        address: {
            type: String,
            default: ""
        }
    },
    
    createdAt: {
    type: Date,
    default: Date.now    // Automatically set when user registers
  }
});

// --- MIDDLEWARE: Hash password before saving ---
// This runs automatically before every .save() call
userSchema.pre('save', async function () {

  // Only hash password if modified
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

// --- METHOD: Compare entered password with hashed password ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User;