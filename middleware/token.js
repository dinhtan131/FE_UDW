const jwt = require("jsonwebtoken");
const User = require("../models/userModels"); // Import User model
require("dotenv").config(); // Đảm bảo bạn đã cấu hình biến môi trường trong .env

const authenticateToken = async (req, res, next) => {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    console.log("Token missing, redirecting to /login");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("User not found, redirecting to /login");
      return res.redirect("/login");
    }

    req.user = user;
    console.log("User authenticated:", user.username);
    next();
  } catch (error) {
    console.error("Error in authenticateToken:", error);
    return res.redirect("/login");
  }
};

module.exports = { authenticateToken };
