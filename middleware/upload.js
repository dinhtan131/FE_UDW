// const multer = require('multer');
// const path = require('path'); // Import thư viện path

// // Middleware cho ảnh avatar
// const avatarStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = path.join(__dirname, '..', 'public', 'avatars');
//         cb(null, uploadPath); // Thư mục lưu ảnh avatar
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // Tên file duy nhất
//     }
// });

// const avatarUpload = multer({
//     storage: avatarStorage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Only image files are allowed!'), false);
//         }
//     },
//     limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB cho ảnh avatar
// });

// // Middleware cho ảnh postImage
// const postImageStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = path.join(__dirname, '..', 'public', 'postImage');
//         cb(null, uploadPath); // Thư mục lưu ảnh bài viết
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // Tên file duy nhất
//     }
// });

// const postImageUpload = multer({
//     storage: postImageStorage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Only image files are allowed!'), false);
//         }
//     },
//     limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB cho ảnh bài viết
// });

// module.exports = {
//     avatarUpload,
//     postImageUpload
// };


const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary với thông tin từ môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Storage cho avatar
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars', // Thư mục lưu trữ trên Cloudinary
    format: async (req, file) => 'png', // Định dạng file
    public_id: (req, file) => `avatar_${Date.now()}`, // Tên file duy nhất
  },
});

// Storage cho ảnh bài viết
const postImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'postImages',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => `postImage_${Date.now()}`,
  },
});

const avatarUpload = multer({ storage: avatarStorage });
const postImageUpload = multer({ storage: postImageStorage });

module.exports = {
  avatarUpload,
  postImageUpload,
};

