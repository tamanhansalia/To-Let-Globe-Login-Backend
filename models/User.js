const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone_number: { type: String },
  role: {
    type: String,
    enum: ['Buyer', 'Tenant', 'Owner', 'Content Creator', 'Admin', 'User'], // Add 'User' here
    required: true
  },  
  first_school: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
