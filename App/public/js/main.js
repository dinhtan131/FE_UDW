document.addEventListener('DOMContentLoaded', () => {
    // Like button toggle
    const likeButtons = document.querySelectorAll('.btn-light');
    likeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.target.classList.toggle('btn-danger');
        });
    });

    // Modal handling for the "+" icon
    const plusIcon = document.querySelector('.plus-button'); // Icon dấu "+"
    const modal = document.getElementById('postModal'); // Modal element
    const closeBtn = document.querySelector('.close-btn'); // Nút đóng

    // Kiểm tra sự tồn tại của phần tử trước khi thêm sự kiện để tránh lỗi
    if (plusIcon && modal && closeBtn) {
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
    } else {
        console.warn("Các phần tử cần thiết để hiển thị modal không tồn tại.");
    }
});
