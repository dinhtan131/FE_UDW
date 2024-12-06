const jwt = require('jsonwebtoken');
require('dotenv').config();  // Đảm bảo bạn đã cấu hình biến môi trường trong .env

// Middleware kiểm tra token
// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];  // Lấy token từ cookie hoặc header
    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // Kiểm tra xem token đã giải mã thành công chưa
        console.log("Decoded Token: ", decoded);
        req.userId = decoded.userId;  // Lưu userId vào req.userId
        next();
    });
};


module.exports = { authenticateToken };
