const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json({ message: "Token required" });

  jwt.verify(token, "YOUR_SECRET_KEY", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user; // Attach user info to request object
    next();
  });
};

module.exports = authenticateToken;
