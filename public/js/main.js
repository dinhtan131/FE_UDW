console.log("main.js loaded")

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



$('.like-button').click(function(e) {
    e.preventDefault();
    const button = $(this);
    const card = button.closest('.card');
    const postId = card.data('post-id');

    $.ajax({
        url: `/post/${postId}/like`,
        method: 'POST',
        success: function(response) {
            // Cập nhật số lượng like
            card.find('.like-count').text(response.likesCount);

            // Toggle class 'liked' và màu icon heart
            if (button.hasClass('liked')) {
                button.removeClass('liked');
                button.find('i.bi-heart').removeClass('text-danger');
            } else {
                button.addClass('liked');
                button.find('i.bi-heart').addClass('text-danger');
            }
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error || 'An error occurred while liking the post.');
        }
    });
});

$(document).ready(function() {
  $('.view-activity').click(function(e) {
    e.preventDefault();
    const postId = $(this).data('post-id');

    // Đoạn AJAX của bạn đặt ở đây
    $.ajax({
      url: `/post/${postId}/like`,
      method: 'GET',
      success: function(response) {
        const modalBody = $('#postActivityModal .modal-body');
        modalBody.empty();

        const headerHtml = `
          <div>
            <p>Views: ???</p>
            <p>Likes: ${response.likesCount}</p>
          </div>
        `;
        modalBody.append(headerHtml);

        response.likes.forEach(user => {
          const userHtml = `
            <div class="d-flex align-items-center mb-2">
              <img src="${'/icons/profile.svg'}" alt="Avatar" class="rounded-circle mr-3" style="width: 40px; height: 40px;">
              <div>
                <h6 class="mb-0">${user.username}</h6>
                <button class="btn btn-sm btn-outline-primary">Follow</button>
              </div>
            </div>
          `;
          modalBody.append(userHtml);
        });

        $('#postActivityModal').modal('show');
      },
      error: function(xhr) {
        alert(xhr.responseJSON.error || 'Error loading activity');
      }
    });
  });
});


$('#commentModal').on('show.bs.modal', function (event) {
    console.log('Modal is shown');
    const button = $(event.relatedTarget); // Nút nhấn mở modal
    const postId = button.data('post-id');
    console.log('Post ID:', postId);
  
    const modal = $(this);
    const originalCommentContainer = modal.find('.original-comment');
    const replyInput = modal.find('.reply-input');
  
    // Xóa nội dung cũ mỗi khi mở modal
    originalCommentContainer.empty();
    replyInput.val('');
  
    // Gửi AJAX lấy nội dung bài viết gốc
    $.ajax({
      url: `/api/post/${postId}`,
      method: 'GET',
      success: function(response) {
        const post = response.post;
        const originalCommentHtml = `
          <div class="media mb-2">
            <img src="${'icons/profile.svg'}" class="mr-3 rounded-circle" alt="Avatar" style="width: 30px; height: 30px;">
            <div class="media-body">
              <h6 class="mt-0">${post.author.username}</h6>
              <p>${post.content}</p>
              <small class="text-muted">${new Date(post.createdAt).toLocaleString()}</small>
            </div>
          </div>
        `;
        originalCommentContainer.append(originalCommentHtml);
      },
      error: function(err) {
        console.error(err);
        originalCommentContainer.html('<p class="text-muted">Không tìm thấy bài viết gốc.</p>');
      }
    });
  
    // Xử lý sự kiện gửi form comment
    modal.find('.reply-form').off('submit').on('submit', function(e) {
      e.preventDefault();
      const form = $(this);
      const content = replyInput.val().trim();
  
      if (!content) {
        alert('Reply cannot be empty.');
        return;
      }
  
      // Gửi request thêm comment
      $.ajax({
        url: `/post/${postId}/comments`,
        method: 'POST',
        data: { content },
        success: function(response) {
          const comment = response.comment;
          // Tạo HTML cho comment mới
          const newCommentHtml = `
            <div class="media mb-2">
              <img src="${ 'icons/profile.svg'}" class="mr-3 rounded-circle" alt="Avatar" style="width: 30px; height: 30px;">
              <div class="media-body">
                <h6 class="mt-0">${comment.author.username}</h6>
                <p>${comment.content}</p>
                <small class="text-muted">${new Date(comment.createdAt).toLocaleString()}</small>
              </div>
            </div>
          `;
  
          // Thêm comment mới vào cuối phần original-comment hoặc tạo 1 khu vực riêng để comment
          originalCommentContainer.append(newCommentHtml);
          // Xóa nội dung input
          replyInput.val('');
        },
        error: function(xhr) {
          alert(xhr.responseJSON.error || 'An error occurred while adding the comment.');
        }
      });
    });
  }
);
  
$(document).on('click', '.follow-button', function (e) {
  e.preventDefault();
  const button = $(this);
  const userId = button.data('user-id'); // ID của người cần follow/unfollow
  const isFollowing = button.hasClass('following');
  const action = isFollowing ? 'unfollow' : 'follow';

  $.ajax({
    url: `/user/${userId}/${action}`,
    method: 'POST',
    success: function (response) {
      if (response.success) {
        // Cập nhật trạng thái nút
        if (action === 'follow') {
          button.addClass('following').text('Unfollow');
        } else {
          button.removeClass('following').text('Follow');
        }
      } else {
        alert(response.message || 'Action failed.');
      }
    },
    error: function (xhr) {
      alert(xhr.responseJSON?.message || 'Error performing the action');
    },
  });
});



document.addEventListener('DOMContentLoaded', function() {
  const cardInfoElements = document.querySelectorAll('.card-info');
  cardInfoElements.forEach(el => {
    const postId = el.getAttribute('data-post-id');
    el.style.cursor = 'pointer'; // Cho người dùng biết vùng này có thể click
    el.addEventListener('click', () => {
      window.location.href = '/post/' + postId;
    });
  });
});

