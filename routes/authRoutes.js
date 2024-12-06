const express = require('express');
const router = express.Router();
const User = require('../models/userModels');  // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressSession = require('express-session');
require('dotenv').config();  // Đảm bảo bạn đã cấu hình biến môi trường trong .env
const { authenticateToken } = require('../middleware/token');  // Import middleware





router.get('/', async (req, res) => {
    try {
        // Kiểm tra token trong cookies hoặc session
        let token = req.cookies.token || req.session.token;  // Kiểm tra token trong cookies hoặc session

        // Nếu không có token, chuyển hướng đến trang đăng nhập
        if (!token) {
            return res.redirect('/login');
        }

        // Nếu có token, kiểm tra tính hợp lệ của token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
               
                console.log('Token không hợp lệ hoặc đã hết hạn');
                return res.redirect('/login');
            }

            
            console.log('Thông tin người dùng đã được giải mã:', decoded);

            
            return res.redirect('/home');  
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi hệ thống khi kiểm tra token.');
    }
});


// Route login
router.get('/login', (req, res) => {
    res.render('login');
});

// Route forgot password
router.get('/forgotPassWord', (req, res) => {
    res.render('forgotPassWord');
});

// Route register
router.get('/register', (req, res) => {
    res.render('register');
});

// Đăng nhập
router.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).send('Vui lòng nhập tên người dùng hoặc email và mật khẩu.');
    }

    try {
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });

        if (!user) {
            return res.status(400).send('Tên người dùng hoặc email không tồn tại.');
        }
        console.log('Entered Password:', password);
        console.log('Stored Password (hashed):', user.password);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch); 
        if (!isMatch) {
            return res.status(400).send('Mật khẩu không đúng.');
        }

        // Tạo JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Lưu token vào cookie hoặc session
        res.cookie('token', token, { httpOnly: false, maxAge: 3600000 }); // Cookie sẽ hết hạn sau 1 giờ
        // Hoặc nếu dùng session:
        // req.session.token = token;

        // Chuyển hướng tới trang home
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi hệ thống khi đăng nhập.');
    }
});


// Đăng ký
router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Kiểm tra nếu thiếu trường dữ liệu
    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).send('Vui lòng điền đầy đủ thông tin.');
    }

    // Kiểm tra nếu mật khẩu và xác thực mật khẩu không trùng nhau
    if (password !== confirmPassword) {
        return res.status(400).send('Mật khẩu và xác thực mật khẩu không trùng khớp.');
    }

    try {
        // Kiểm tra xem email hoặc username đã tồn tại chưa
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            return res.status(400).send('Email hoặc tên người dùng đã được sử dụng.');
        }

        // Tạo tài khoản mới, không cần mã hóa mật khẩu nữa
        const newUser = new User({
            username,
            email,
            password  // Mật khẩu thô, sẽ được mã hóa trong pre-save hook của schema
        });

        await newUser.save();  // Lưu người dùng vào cơ sở dữ liệu

        // Sau khi tạo tài khoản thành công, tự động đăng nhập (tạo token)
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username },
            process.env.JWT_SECRET, // Lưu trong .env
            { expiresIn: '1h' }
        );

        // Gửi token cho client
        res.status(201).json({
            message: 'Đăng ký thành công!',
            token: token  // Gửi JWT token cho client
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi hệ thống khi đăng ký.');
    }
});



router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

module.exports = router;
