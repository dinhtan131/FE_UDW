function handleResize() {
    const sidebar = document.querySelector('.sidebar');
    const bottomBar = document.querySelector('.bottom-bar');
    
    // Kiểm tra kích thước màn hình
    if (window.innerWidth < 768) {
        sidebar.style.display = 'none';
        bottomBar.style.display = 'flex';
    } else {
        sidebar.style.display = 'flex';
        bottomBar.style.display = 'none';
    }
}

// Gọi hàm khi tải trang và khi thay đổi kích thước
window.addEventListener('resize', handleResize);
window.addEventListener('DOMContentLoaded', handleResize);

let lastScrollPosition = 0; // Lưu trữ vị trí cuộn cuối cùng
const threshold = 30; // Ngưỡng cuộn để bắt đầu ẩn (có thể tùy chỉnh)
const halfScreenHeight = window.innerHeight / 2; // Một nửa chiều cao màn hình

function handleScroll() {
    const bottomBar = document.querySelector('.bottom-bar');

    // Lấy vị trí cuộn hiện tại
    const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;

    // Điều kiện ẩn/hiện
    if (currentScrollPosition > lastScrollPosition + threshold) {
        // Nếu cuộn xuống và đã vượt quá ngưỡng, ẩn thanh
        bottomBar.classList.add('hidden');
    } else if (currentScrollPosition < lastScrollPosition - threshold || currentScrollPosition < halfScreenHeight) {
        // Nếu cuộn lên hoặc ở gần đầu trang, hiển thị lại
        bottomBar.classList.remove('hidden');
    }

    // Cập nhật vị trí cuộn cuối cùng
    lastScrollPosition = currentScrollPosition;
}

// Gắn sự kiện scroll
window.addEventListener('scroll', handleScroll);

