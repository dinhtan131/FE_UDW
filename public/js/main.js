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


$('.like-button').click(function (e) {
  e.preventDefault();
  const button = $(this);
  const postId = button.data('post-id'); // Lấy ID bài post
  const likeIcon = button.find("img.like-icon");

  $.ajax({
    url: `/post/${postId}/like`,
    method: "POST",
    success: function (response) {
      // Cập nhật số lượng like
      button.find(".like-count").text(response.likesCount);

      // Thay đổi icon dựa trên trạng thái isLiked
      if (response.isLiked) {
        button.addClass("liked");
        likeIcon.attr("src", "/icons/heart_active.svg");
      } else {
        button.removeClass("liked");
        likeIcon.attr("src", "/icons/heart.svg");
      }
    },
    error: function (xhr) {
      alert(xhr.responseJSON.error || "An error occurred while liking the post.");
    },
  });
});





// $(document).ready(function() {
//   $('.view-activity').click(function(e) {
//     e.preventDefault();
//     const postId = $(this).data('post-id');

//     // Đoạn AJAX của bạn đặt ở đây
//     $.ajax({
//       url: `/post/${postId}/like`,
//       method: 'GET',
//       success: function(response) {
//         const modalBody = $('#postActivityModal .modal-body');
//         modalBody.empty();

//         const headerHtml = `
//           <div>
//             <p>Views: ???</p>
//             <p>Likes: ${response.likesCount}</p>
//           </div>
//         `;
//         modalBody.append(headerHtml);

//         response.likes.forEach(user => {
//           const userHtml = `
//             <div class="d-flex align-items-center mb-2">
//               <img src="${'/icons/profile.svg'}" alt="Avatar" class="rounded-circle mr-3" style="width: 40px; height: 40px;">
//               <div>
//                 <h6 class="mb-0">${user.username}</h6>
//                 <button class="btn btn-sm btn-outline-primary">Follow</button>
//               </div>
//             </div>
//           `;
//           modalBody.append(userHtml);
//         });

//         $('#postActivityModal').modal('show');
//       },
//       error: function(xhr) {
//         alert(xhr.responseJSON.error || 'Error loading activity');
//       }
//     });
//   });
// });


$(document).ready(function () {
  $('.view-activity').click(function (e) {
    e.preventDefault();
    const postId = $(this).data('post-id');

    $.ajax({
      url: `/post/${postId}/activity`,
      method: 'GET',
      success: function (response) {
        const modalBody = $('#postActivityModal .modal-body');
        modalBody.empty();

        // Header thống kê Views, Likes, Reposts
        const headerHtml = `
          <div class="activity-stats">
            <p><strong>Views:</strong> ${response.viewsCount}</p>
            <p><strong>Likes:</strong> ${response.likesCount}</p>
            <p><strong>Reposts:</strong> ${response.repostsCount}</p>
          </div>
        `;
        modalBody.append(headerHtml);

        // Danh sách người dùng Likes
        modalBody.append('<h6>Likes</h6>');
        response.likes.forEach(user => {
          const userHtml = `
            <div class="d-flex align-items-center mb-2">
              <img src="${user.avatar}" alt="Avatar" class="rounded-circle me-3" style="width: 40px; height: 40px;">
              <div class="me-auto">
                <h6 class="mb-0">${user.username}</h6>
              </div>
              <button class="btn btn-sm btn-outline-primary">Follow</button>
            </div>
          `;
          modalBody.append(userHtml);
        });

        // Danh sách người dùng Reposts
        modalBody.append('<h6>Reposts</h6>');
        response.reposts.forEach(user => {
          const userHtml = `
            <div class="d-flex align-items-center mb-2">
              <img src="${user.avatar}" alt="Avatar" class="rounded-circle me-3" style="width: 40px; height: 40px;">
              <div class="me-auto">
                <h6 class="mb-0">${user.username}</h6>
              </div>
              <button class="btn btn-sm btn-outline-primary">Follow</button>
            </div>
          `;
          modalBody.append(userHtml);
        });

        $('#postActivityModal').modal('show');
      },
      error: function (xhr) {
        alert(xhr.responseJSON.error || 'Error loading activity');
      }
    });
  });
});




$(document).on("click", ".comment-button", function () {
  const button = $(this);
  const postId = button.data("post-id");
  console.log(postId);
  const commentId = button.data("comment-id"); // Nếu là trả lời comment, lấy ID comment

  const modal = $("#commentModal");
  const originalCommentContainer = modal.find(".original-comment");
  const replyInput = modal.find(".reply-input");
  modal.data("post-id", postId);
  // Xóa nội dung cũ mỗi khi mở modal
  originalCommentContainer.empty();
  replyInput.val("");

  // Nếu commentId tồn tại, lấy thông tin comment cha, ngược lại lấy thông tin bài viết
  const url = commentId ? `/api/comment/${commentId}` : `/api/post/${postId}`;

  // Gửi AJAX để lấy nội dung gốc
  $.ajax({
    url: url,
    method: "GET",
    success: function (response) {
      const data = response.comment || response.post;

      const html = `
        <div class="media">
          <img src="${data.author.avatar || '/icons/profile.svg'}" class="mr-3 rounded-circle" alt="Avatar" style="width: 40px; height: 40px;">
          <div class="media-body">
            <h6 class="mt-0">${data.author.username}</h6>
            <p>${data.content}</p>
            <small class="text-muted">${new Date(data.createdAt).toLocaleString()}</small>
          </div>
        </div>
      `;
      originalCommentContainer.html(html);
    },
    error: function (err) {
      console.error("Error fetching comment/post:", err);
      originalCommentContainer.html('<p class="text-muted">Error loading content.</p>');
    },
  });

  modal.modal("show");
});


$(document).on("submit", ".reply-form", function (e) {
  e.preventDefault();

  const modal = $("#commentModal");
  const postId = modal.data("post-id");
  console.log("Submit Post ID:", postId);

  if (!postId) {
    alert("Post ID is missing.");
    return;
  }

  const content = modal.find(".reply-input").val().trim();
  if (!content) {
    alert("Reply cannot be empty.");
    return;
  }

  const url = `/post/${postId}/comments`;
  $.ajax({
    url: url,
    method: "POST",
    data: { content },
    success: function (response) {
      alert("Comment added successfully!");
      modal.modal("hide");
      location.reload();
    },
    error: function (xhr) {
      alert(xhr.responseJSON.error || "An error occurred while adding comment.");
    },
  });
});




$(document).on('click', '.follow-button', function (e) {
  e.preventDefault();
  const button = $(this);
  const userId = button.data('user-id'); // ID của người cần follow/unfollow
  const isFollowing = button.hasClass('following');
  const action = isFollowing ? 'unfollow' : 'follow';
  button.prop('disabled', true);
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
    complete: function () {
      // Kích hoạt lại nút sau khi quá trình hoàn tất
      button.prop('disabled', false);
    }
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


// Lắng nghe sự kiện thay đổi dropdown
document.querySelectorAll('.dropdown-item').forEach((item) => {
  item.addEventListener('click', function (event) {
      const type = this.getAttribute('data-type');
      if (type) {
          console.log('Selected Type:', type);
          if (window.location.pathname === '/notifications') {
              fetchNotifications(type);
          }
      }
  });
});

// Gửi yêu cầu AJAX để lấy thông báo
function fetchNotifications(type) {
  $.ajax({
      url: `/notifications/${type || 'all'}`,
      method: 'GET',
      success: function (response) {
          console.log('Notifications:', response);
          renderNotifications(response.notifications);
      },
      error: function (xhr) {
          console.error('Error loading notifications:', xhr);
      }
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".nav-link-profile");
  const tabContent = document.getElementById("tab-content");
  const profileContainer = document.getElementById("profile-container");
  const userId = profileContainer.getAttribute("data-user-id");

  if (!tabContent) {
    console.error("Tab content container (#tab-content) not found in DOM.");
    return;
  }


  async function loadTabData(tab) {
    tabContent.innerHTML = "<p>Loading...</p>";
    try {
      const response = await fetch(`/profile/${userId}/${tab}`, {
        headers: { Accept: "application/json" },
      });
  
      const result = await response.json();
  
      if (response.ok) {
        if (result.data.length > 0) {
          // Tạo nội dung dựa trên tab
          const contentHTML = result.data
            .map((item) => {
              const author = item.author || { username: "Unknown", avatar: "/default-avatar.png" };
              const likesCount = item.likes ? item.likes.length : 0;
              const commentsCount = item.comments ? item.comments.length : 0;
  
              if (tab === "threads") {
                return `
                  <div class="post-item mb-3 border rounded p-3">
                    <div class="d-flex align-items-center mb-2">
                      <img src="${author.avatar}" alt="Avatar" class="rounded-circle" style="width: 40px; height: 40px;">
                      <div class="ml-2">
                        <h6 class="mb-0">${author.username}</h6>
                        <small class="text-muted">${new Date(item.createdAt).toLocaleString()}</small>
                      </div>
                    </div>
                    <p>${item.content}</p>
                    ${
                      item.postImage && item.postImage.length > 0
                        ? `<div class="post-images mt-2">
                             ${item.postImage
                               .map(
                                 (image) =>
                                   `<img src="${image}" alt="Post Image" class="img-fluid mb-2 rounded" style="max-width: 100%;">`
                               )
                               .join("")}
                           </div>`
                        : ""
                    }
                    <div class="d-flex justify-content-between mt-2">
                      <div>
                        <span class="mr-3"><i class="bi bi-heart"></i> ${likesCount}</span>
                        <span class="mr-3"><i class="bi bi-chat"></i> ${commentsCount}</span>
                        <span class="mr-3"><i class="bi bi-repeat"></i> ${item.reposts ? item.reposts.length : 0}</span>
                      </div>
                      <div><i class="bi bi-three-dots"></i></div>
                    </div>
                  </div>
                `;
              }
              
  
              if (tab === "replies") {
                const post = item.post || {};
                const parentComment = item.parentComment || {};
  
                return `
                  <div class="post-item mb-3 border rounded p-3">
                    <div class="text-muted mb-1">
                      <i class="bi bi-reply"></i>
                      ${
                        parentComment.content
                          ? `Replying to <strong>@${parentComment.author.username}</strong> in comment: "${parentComment.content}"`
                          : `Commented on <strong>@${post.author.username}</strong>'s post: "${post.content}"`
                      }
                    </div>
                    <p>${item.content}</p>
                    <div class="d-flex align-items-center">
                      <img src="${author.avatar}" alt="Avatar" class="rounded-circle" style="width: 30px; height: 30px;">
                      <small class="ml-2 text-muted">${author.username} · ${new Date(item.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                `;
              }
  
              if (tab === "reposts") {
                const originalPost = item.originalPost;
                if (!originalPost) {
                  return `<div class="post-item"><p class="text-danger">Original post not found.</p></div>`;
                }
  
                return `
                  <div class="post-item mb-3 border rounded p-3">
                    <p class="text-muted mb-1">
                      <i class="bi bi-repeat"></i> Reposted by <strong>${author.username}</strong> at ${new Date(item.createdAt).toLocaleString()}
                    </p>
                    <div class="original-post bg-light p-2 rounded">
                      <div class="d-flex align-items-center mb-2">
                        <img src="${originalPost.author.avatar}" alt="Avatar" class="rounded-circle" style="width: 40px; height: 40px;">
                        <div class="ml-2">
                          <h6 class="mb-0">${originalPost.author.username}</h6>
                          <small class="text-muted">${new Date(originalPost.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                      <p>${originalPost.content}</p>
                    </div>
                  </div>
                `;
              }
            })
            .join("");
  
          tabContent.innerHTML = contentHTML;
        } else {
          tabContent.innerHTML = `<p>You don't have any ${tab} yet.</p>`;
        }
      } else {
        tabContent.innerHTML = `<p>Error: ${result.message}</p>`;
      }
    } catch (error) {
      console.error("Error loading tab data:", error);
      tabContent.innerHTML = "<p>Error loading data.</p>";
    }
  }
  
  loadTabData("threads");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const selectedTab = tab.getAttribute("data-tab");
      loadTabData(selectedTab);
    });
  });
});


