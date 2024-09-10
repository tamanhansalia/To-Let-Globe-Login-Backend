const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/User');
const authenticateToken = require("./middleware/authenticateToken"); // Add token-based auth logic here
const loginRoute = require('./routes/loginRoute');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const userRoutes = require('./routes/user'); // Import additional routes like user profile if needed

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));

// Registration Route
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone_number, role, first_school } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Hash the password before saving it (in production)
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Save the hashed password
      phone_number,
      role,
      first_school
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(400).json({ error: 'Error registering user', details: error.message }
      
    );
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the hashed password using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a token for session management
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Respond with success message and token
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Protected Route
app.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route" });
});

// Routes for additional user-related endpoints
app.use('/user', userRoutes);

// Home Route
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js and MongoDB app!');
});



// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
