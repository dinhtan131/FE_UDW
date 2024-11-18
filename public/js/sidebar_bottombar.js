function handleResize() {
    const sidebar = document.querySelector('.sidebar');
    const bottomBar = document.querySelector('.bottom-bar');
    
    // Kiểm tra kích thước màn hình
    if (window.innerWidth <= 768) {
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

let lastScrollPosition = 0;

function handleScroll() {
    const bottomBar = document.querySelector('.bottom-bar');
    
    // Kiểm tra vị trí cuộn hiện tại
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Nếu cuộn xuống và `bottom bar` đang hiển thị, ẩn nó đi
    if (currentScrollPosition > lastScrollPosition) {
        bottomBar.classList.add('hidden');
    }
    // Nếu cuộn lên và `bottom bar` đang ẩn, hiển thị lại
    else {
        bottomBar.classList.remove('hidden');
    }

    // Cập nhật vị trí cuộn cuối cùng
    lastScrollPosition = currentScrollPosition;
}

// Gắn sự kiện scroll
window.addEventListener('scroll', handleScroll);
