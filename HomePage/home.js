document.addEventListener('DOMContentLoaded', () => {
    // Like button toggle
    const likeButtons = document.querySelectorAll('.btn-light');
    likeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.target.classList.toggle('btn-danger');
        });
    });

    // Modal handling for elements with class 'plus-button'
    const plusIcons = document.querySelectorAll('.plus-button'); // Tất cả các phần tử có class plus-button
    const modal = document.getElementById('postModal'); // Modal element
    const closeBtns = document.querySelectorAll('.close-btn, .btn-close-icon'); // Các nút đóng
    const postButton = document.querySelector('.post-btn');
    const threadInput = document.querySelector('.thread-input');

    // Kiểm tra sự tồn tại của modal trước khi thêm sự kiện để tránh lỗi
    if (modal && closeBtns) {
        // Khi nhấn vào bất kỳ phần tử nào có class "plus-button", hiện popup
        plusIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                modal.classList.remove('d-none'); // Hiển thị popup
            });
        });

        // Sự kiện đóng modal
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('d-none'); // Ẩn modal
            });
        });

        // Ẩn popup khi nhấn bên ngoài nội dung popup
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.add('d-none'); // Ẩn popup
            }
        });

        // Kích hoạt nút "Post" nếu có nội dung nhập
        threadInput.addEventListener('input', () => {
            if (threadInput.value.trim() !== '') {
                postButton.classList.add('active');
                postButton.removeAttribute('disabled');
            } else {
                postButton.classList.remove('active');
                postButton.setAttribute('disabled', 'true');
            }
        });
    } else {
        console.warn("Các phần tử cần thiết để hiển thị modal không tồn tại.");
    }
});

// Lấy phần tử post-feed
const postFeed = document.querySelector('.post-feed');

// Tạo nội dung thẻ card mẫu
const cardTemplate = `
    <div class="card">
        <div class="card-body">
            <div class="d-flex align-items-center mb-2">
                <div class="avatar">
                    <i class="bi bi-person-circle" style="font-size: 2rem; color: #333;"></i>
                </div>
                <div class="ml-2">
                    <h5 class="card-title mb-0" style="color: #333;">Nguyễn Đình Thuận</h5>
                    <small class="text-muted">3h ago</small>
                </div>
            </div>
            <p class="card-text">First Threads</p>
            <div class="d-flex justify-content-between">
                <div>
                    <i class="bi bi-heart mr-2"></i><span>7</span>
                    <i class="bi bi-chat mr-2"></i><span>3</span>
                    <i class="bi bi-share"></i>
                </div>
                <i class="bi bi-three-dots"></i>
            </div>
        </div>
    </div>
`;

// Lặp để tạo 5 thẻ card và thêm vào post-feed
for (let i = 0; i < 10; i++) {
    postFeed.innerHTML += cardTemplate;
}
