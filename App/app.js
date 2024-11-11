const express = require('express');
const app = express();
const path = require('path');

// Thiết lập EJS làm view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Thiết lập thư mục chứa các file tĩnh (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route chính
app.get('/', (req, res) => {
    const posts = [
        { username: "user1", content: "Hello Threads!" },
        { username: "user2", content: "Another day, another post!" },
        { username: "user3", content: "Love this app!" },
        { username: "user1", content: "Hello Threads!" },
        { username: "user2", content: "Another day, another post!" },
        { username: "user1", content: "Hello Threads!" },
        { username: "user2", content: "Another day, another post!" },
        { username: "user1", content: "Hello Threads!" },
        { username: "user2", content: "Another day, another post!" },
        { username: "user1", content: "Hello Threads!" },
        { username: "user2", content: "Another day, another post!" },
        { username: "user1", content: "Hello Threads!" },
        { username: "user2", content: "Another day, another post!" },
        { username: "user1", content: "Hello Threads!" },
        { username: "user2", content: "Another day, another post!" },
        { username: "user1", content: "Hello Threads!" },
        { username: "user2", content: "Another day, another post!" },
        { username: "user1", content: "Hello Threads!" },
        { username: "user2", content: "Another day, another post!" }
    ];
    res.render('index', { posts });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
