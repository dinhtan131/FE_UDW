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


// Lấy phần tử activity-list
const activityList = document.querySelector('.activity-list');

// Dữ liệu mẫu cho các phần tử activity
const activities = [
    { username: "min.baee06", time: "9h ago", action: "Started a thread", likes: "3.4K", comments: "54", shares: "10" },
    { username: "user1", time: "1d ago", action: "Liked a post", likes: "1.2K", comments: "30", shares: "5" },
    { username: "user2", time: "2d ago", action: "Shared a thread", likes: "500", comments: "15", shares: "2" },
    // Thêm các mục khác vào đây nếu muốn hoặc lặp lại mục đầu để đủ 10 phần tử
];

// Lặp qua danh sách dữ liệu và tạo thẻ HTML cho mỗi phần tử
for (let i = 0; i < 10; i++) {
    const activity = activities[i % activities.length]; // Lặp lại các phần tử nếu ít hơn 10
    const cardHTML = `
        <div class="card mb-2 bg-dark text-light">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <img src="icons/profile.svg" alt="Avatar" class="rounded-circle mr-3" style="width: 40px; height: 40px;">
                    <div>
                        <h6 class="mb-0 text-white">${activity.username}</h6>
                        <small class="text-muted">${activity.time}</small><br>
                        <small class="text-muted">${activity.action}</small>
                    </div>
                </div>
                <div>
                    <i class="bi bi-heart mr-2"></i><span>${activity.likes}</span>
                    <i class="bi bi-chat mr-2"></i><span>${activity.comments}</span>
                    <i class="bi bi-share"></i><span>${activity.shares}</span>
                </div>
            </div>
        </div>
    `;
    // Thêm card vào activityList
    activityList.innerHTML += cardHTML;
}
