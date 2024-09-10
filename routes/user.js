const express = require("express");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt'); // Add this line at the top


const router = express.Router();

// Forget Password Endpoint
router.post("/forgetpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Save token to the user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Send reset email (simplified for this example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      // secure: 'true',
      // port: 465,
      auth: {
        user: 'taman5258@gmail.com', // Your Gmail address
        pass: 'msqhrnglkgrhuwgb', // Use the generated app password
      },
    });


    const mailOptions = {
      to: user.email,
      from: 'taman5258@gmail.com',
      subject: 'Password Reset Link',
      text: `You requested a password reset. 
      Click here to reset: http://localhost:5173/resetpassword/${resetToken}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    res.status(500).json({ message: "Error sending reset email", error: err.message });
  }
});



// Password Reset Route
router.post("/resetpassword/:token", async (req, res) => {
  const { password } = req.body;
  const resetToken = req.params.token;

  try {
    // Check if the token exists and is not expired
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is valid and not expired
    });

    if (!user) {
      console.log("Token is invalid or has expired");
      return res.status(400).json({ message: "Token is invalid or has expired" });
    }

    // Check if the password is provided
    if (!password) {
      console.log("No password provided");
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and remove the reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error); // Log the error details
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
});

module.exports = router;
