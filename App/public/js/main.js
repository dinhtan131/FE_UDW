// Thêm JavaScript tùy chỉnh trong public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const likeButtons = document.querySelectorAll('.btn-light');
    likeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.target.classList.toggle('btn-danger');
        });
    });
});

// Chờ khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Lấy phần tử icon dấu "+" và modal
    const plusIcon = document.querySelector('.plus-button'); // Icon dấu "+"
    const modal = document.getElementById('postModal');
    const closeBtn = document.querySelector('.close-btn');

    // Khi nhấn vào icon dấu "+", hiện popup
    plusIcon.addEventListener('click', () => {
        modal.classList.remove('d-none'); // Hiển thị popup
    });

    // Khi nhấn vào nút đóng, ẩn popup
    closeBtn.addEventListener('click', () => {
        modal.classList.add('d-none'); // Ẩn popup
    });

    // Ẩn popup khi nhấn bên ngoài nội dung popup
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('d-none'); // Ẩn popup
        }
    });
});
