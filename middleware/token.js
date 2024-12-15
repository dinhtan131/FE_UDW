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

    // Tìm người dùng từ token
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("User not found, redirecting to /login");
      return res.redirect("/login");
    }

    // Gắn user vào req và res.locals
    req.user = user;
    res.locals.user = user; // Gắn vào res.locals để dùng trong EJS

    console.log("User authenticated:", user.username);
    next();
  } catch (error) {
    console.error("Error in authenticateToken:", error);
    return res.redirect("/login");
  }
};


module.exports = { authenticateToken };
