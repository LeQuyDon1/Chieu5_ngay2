const API_URL = 'http://localhost:3000';

// ============== POSTS MANAGEMENT ==============
class PostManager {
    static async getPosts() {
        const response = await fetch(`${API_URL}/posts`);
        return await response.json();
    }

    static async createPost(title, views) {
        const posts = await this.getPosts();
        const maxId = posts.length > 0 ? Math.max(...posts.map(p => parseInt(p.id))) : 0;
        const newId = (maxId + 1).toString();

        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: newId,
                title,
                views: parseInt(views),
                isDeleted: false
            })
        });
        return await response.json();
    }

    static async updatePost(id, title, views) {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, views: parseInt(views) })
        });
        return await response.json();
    }

    static async softDeletePost(id) {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: true })
        });
        return await response.json();
    }

    static async restorePost(id) {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: false })
        });
        return await response.json();
    }
}

// ============== COMMENTS MANAGEMENT ==============
class CommentManager {
    static async getComments() {
        const response = await fetch(`${API_URL}/comments`);
        return await response.json();
    }

    static async createComment(text, postId) {
        const comments = await this.getComments();
        const maxId = comments.length > 0 ? Math.max(...comments.map(c => parseInt(c.id))) : 0;
        const newId = (maxId + 1).toString();

        const response = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: newId,
                text,
                postId: postId.toString(),
                isDeleted: false
            })
        });
        return await response.json();
    }

    static async updateComment(id, text) {
        const response = await fetch(`${API_URL}/comments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return await response.json();
    }

    static async softDeleteComment(id) {
        const response = await fetch(`${API_URL}/comments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: true })
        });
        return await response.json();
    }

    static async restoreComment(id) {
        const response = await fetch(`${API_URL}/comments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: false })
        });
        return await response.json();
    }
}

// ============== UI RENDERING ==============
async function renderPosts() {
    try {
        const posts = await PostManager.getPosts();
        const postsList = document.getElementById('postsList');

        if (posts.length === 0) {
            postsList.innerHTML = '<div class="no-data"><p>Chưa có bài viết nào</p></div>';
            updateStats([], []);
            return;
        }

        postsList.innerHTML = posts.map(post => `
            <div class="card card-custom ${post.isDeleted ? 'deleted' : ''}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h5 class="card-title">
                                ${post.title}
                                ${post.isDeleted ? '<span class="badge bg-danger ms-2">Đã xoá</span>' : '<span class="badge badge-custom">Hoạt động</span>'}
                            </h5>
                            <p class="card-text text-muted">
                                <small>ID: ${post.id} | Lượt xem: <strong>${post.views}</strong></small>
                            </p>
                        </div>
                    </div>
                    <div class="mt-3">
                        ${!post.isDeleted ? `
                            <button class="btn btn-action btn-edit" onclick="editPost(${post.id})">✏️ Sửa</button>
                            <button class="btn btn-action btn-delete" onclick="deletePost(${post.id})">🗑️ Xoá</button>
                        ` : `
                            <button class="btn btn-action btn-restore" onclick="restorePost(${post.id})">↩️ Khôi phục</button>
                        `}
                    </div>
                </div>
            </div>
        `).join('');

        const comments = await CommentManager.getComments();
        updateStats(posts, comments);
    } catch (error) {
        console.error('Error rendering posts:', error);
        showAlert('Lỗi khi tải bài viết', 'danger');
    }
}

async function renderComments() {
    try {
        const comments = await CommentManager.getComments();
        const posts = await PostManager.getPosts();
        const commentsList = document.getElementById('commentsList');
        if (comments.length === 0) {
            commentsList.innerHTML = '<div class="no-data"><p>Chưa có bình luận nào</p></div>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => {
            const post = posts.find(p => p.id === comment.postId);
            return `
                <div class="card card-custom ${comment.isDeleted ? 'deleted' : ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="card-title mb-2">
                                    <strong>Bài viết:</strong> ${post?.title || 'N/A'}
                                    ${comment.isDeleted ? '<span class="badge bg-danger ms-2">Đã xoá</span>' : '<span class="badge badge-custom">Hoạt động</span>'}
                                </h6>
                                <p class="comment-text card-text ${comment.isDeleted ? 'deleted' : ''}">
                                    ${comment.text}
                                </p>
                                <small class="text-muted">ID: ${comment.id} | Post ID: ${comment.postId}</small>
                            </div>
                        </div>
                        <div class="mt-3">
                            ${!comment.isDeleted ? `
                                <button class="btn btn-action btn-edit" onclick="editComment(${comment.id})">✏️ Sửa</button>
                                <button class="btn btn-action btn-delete" onclick="deleteComment(${comment.id})">🗑️ Xoá</button>
                            ` : `
                                <button class="btn btn-action btn-restore" onclick="restoreComment(${comment.id})">↩️ Khôi phục</button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error rendering comments:', error);
        showAlert('Lỗi khi tải bình luận', 'danger');
    }
}

async function updatePostSelectOptions() {
    try {
        const posts = await PostManager.getPosts();
        const select = document.getElementById('commentPostId');
        select.innerHTML = '<option value="">-- Chọn bài viết --</option>';
        posts.filter(p => !p.isDeleted).forEach(post => {
            const option = document.createElement('option');
            option.value = post.id;
            option.textContent = post.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error updating post options:', error);
    }
}

function updateStats(posts, comments) {
    const activePosts = posts.filter(p => !p.isDeleted).length;
    const deletedPosts = posts.filter(p => p.isDeleted).length;
    const activeComments = comments.filter(c => !c.isDeleted).length;

    document.getElementById('totalPosts').textContent = posts.length;
    document.getElementById('activePosts').textContent = activePosts;
    document.getElementById('deletedPosts').textContent = deletedPosts;
    document.getElementById('totalComments').textContent = activeComments;
}

// ============== POST OPERATIONS ==============
function openCreatePostModal() {
    document.getElementById('postId').value = '';
    document.getElementById('postTitle').value = '';
    document.getElementById('postViews').value = '0';
    document.getElementById('postModalTitle').textContent = 'Thêm bài viết mới';
}

async function editPost(id) {
    try {
        const response = await fetch(`${API_URL}/posts/${id}`);
        const post = await response.json();
        document.getElementById('postId').value = post.id;
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postViews').value = post.views;
        document.getElementById('postModalTitle').textContent = 'Chỉnh sửa bài viết';
        new bootstrap.Modal(document.getElementById('postModal')).show();
    } catch (error) {
        console.error('Error fetching post:', error);
        showAlert('Lỗi khi tải bài viết', 'danger');
    }
}

async function savePost() {
    const id = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value;
    const views = document.getElementById('postViews').value;

    if (!title.trim()) {
        showAlert('Vui lòng nhập tiêu đề', 'warning');
        return;
    }

    try {
        if (id) {
            await PostManager.updatePost(id, title, views);
            showAlert('Cập nhật bài viết thành công', 'success');
        } else {
            await PostManager.createPost(title, views);
            showAlert('Tạo bài viết thành công', 'success');
        }
        bootstrap.Modal.getInstance(document.getElementById('postModal')).hide();
        await renderPosts();
        await updatePostSelectOptions();
    } catch (error) {
        console.error('Error saving post:', error);
        showAlert('Lỗi khi lưu bài viết', 'danger');
    }
}

async function deletePost(id) {
    if (confirm('Bạn chắc chắn muốn xoá bài viết này?')) {
        try {
            await PostManager.softDeletePost(id);
            showAlert('Xoá bài viết thành công', 'success');
            await renderPosts();
            await updatePostSelectOptions();
        } catch (error) {
            console.error('Error deleting post:', error);
            showAlert('Lỗi khi xoá bài viết', 'danger');
        }
    }
}

async function restorePost(id) {
    if (confirm('Bạn chắc chắn muốn khôi phục bài viết này?')) {
        try {
            await PostManager.restorePost(id);
            showAlert('Khôi phục bài viết thành công', 'success');
            await renderPosts();
            await updatePostSelectOptions();
        } catch (error) {
            console.error('Error restoring post:', error);
            showAlert('Lỗi khi khôi phục bài viết', 'danger');
        }
    }
}

// ============== COMMENT OPERATIONS ==============
function openCreateCommentModal() {
    document.getElementById('commentId').value = '';
    document.getElementById('commentPostId').value = '';
    document.getElementById('commentText').value = '';
    document.getElementById('commentModalTitle').textContent = 'Thêm bình luận mới';
    updatePostSelectOptions();
}

async function editComment(id) {
    try {
        const response = await fetch(`${API_URL}/comments/${id}`);
        const comment = await response.json();
        document.getElementById('commentId').value = comment.id;
        document.getElementById('commentPostId').value = comment.postId;
        document.getElementById('commentText').value = comment.text;
        document.getElementById('commentModalTitle').textContent = 'Chỉnh sửa bình luận';
        new bootstrap.Modal(document.getElementById('commentModal')).show();
    } catch (error) {
        console.error('Error fetching comment:', error);
        showAlert('Lỗi khi tải bình luận', 'danger');
    }
}

async function saveComment() {
    const id = document.getElementById('commentId').value;
    const text = document.getElementById('commentText').value;
    const postId = document.getElementById('commentPostId').value;

    if (!text.trim()) {
        showAlert('Vui lòng nhập nội dung bình luận', 'warning');
        return;
    }

    if (!postId) {
        showAlert('Vui lòng chọn bài viết', 'warning');
        return;
    }

    try {
        if (id) {
            await CommentManager.updateComment(id, text);
            showAlert('Cập nhật bình luận thành công', 'success');
        } else {
            await CommentManager.createComment(text, postId);
            showAlert('Tạo bình luận thành công', 'success');
        }
        bootstrap.Modal.getInstance(document.getElementById('commentModal')).hide();
        await renderComments();
        await renderPosts();
    } catch (error) {
        console.error('Error saving comment:', error);
        showAlert('Lỗi khi lưu bình luận', 'danger');
    }
}

async function deleteComment(id) {
    if (confirm('Bạn chắc chắn muốn xoá bình luận này?')) {
        try {
            await CommentManager.softDeleteComment(id);
            showAlert('Xoá bình luận thành công', 'success');
            await renderComments();
            await renderPosts();
        } catch (error) {
            console.error('Error deleting comment:', error);
            showAlert('Lỗi khi xoá bình luận', 'danger');
        }
    }
}

async function restoreComment(id) {
    if (confirm('Bạn chắc chắn muốn khôi phục bình luận này?')) {
        try {
            await CommentManager.restoreComment(id);
            showAlert('Khôi phục bình luận thành công', 'success');
            await renderComments();
            await renderPosts();
        } catch (error) {
            console.error('Error restoring comment:', error);
            showAlert('Lỗi khi khôi phục bình luận', 'danger');
        }
    }
}

function showAlert(message, type) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show alert-custom" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    const alertContainer = document.createElement('div');
    alertContainer.innerHTML = alertHtml;
    document.querySelector('.container').prepend(alertContainer.querySelector('.alert'));

    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) alert.remove();
    }, 3000);
}

// ============== EVENT LISTENERS ==============
document.getElementById('savePostBtn').addEventListener('click', savePost);
document.getElementById('saveCommentBtn').addEventListener('click', saveComment);

document.getElementById('posts-tab').addEventListener('click', renderPosts);
document.getElementById('comments-tab').addEventListener('click', renderComments);

// ============== INITIAL LOAD ==============
window.addEventListener('load', async () => {
    try {
        await renderPosts();
        await updatePostSelectOptions();
    } catch (error) {
        console.error('Error initializing app:', error);
        showAlert('Lỗi khi khởi động ứng dụng. Vui lòng kiểm tra server.', 'danger');
    }
});
