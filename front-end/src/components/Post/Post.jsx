import React, { useState } from 'react';
import { MoreHorizontal, ThumbsUp, MessageSquare, Share, Send } from 'lucide-react';
import './Post.css';

const Post = ({ post, onUpdatePost }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(post.comments.length > 0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
    onUpdatePost({ ...post, likes: newLikes });
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now(),
        user: {
          name: 'Current User',
          username: '@currentuser',
          avatar: '/api/placeholder/32/32'
        },
        content: commentText,
        likes: 0,
        timestamp: 'Just now',
        isLiked: false
      };
      
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      onUpdatePost({ ...post, comments: comments.length + 1 });
    }
  };

  const handleCommentLike = (commentId) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  };

  const handleShare = () => {
    onUpdatePost({ ...post, shares: post.shares + 1 });
  };

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-user-info">
          <div className="post-user-avatar"></div>
          <div className="post-user-details">
            <p className="user-name">{post.user.name}</p>
            <p className="user-username">{post.user.username}</p>
          </div>
        </div>
        <div className="post-meta">
          <span className="post-timestamp">{post.timestamp}</span>
          <button className="post-menu-btn">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <p className="post-content">{post.content}</p>

      {/* Post Images */}
      {post.images.length > 0 && (
        <div className="post-images">
          {post.images.map((image, index) => (
            <div key={index} className="post-image">
              <div className="image-placeholder">🎨</div>
            </div>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="post-actions-bar">
        <div className="post-actions-left">
          <button 
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <ThumbsUp size={18} />
            <span>{post.likes}</span>
          </button>
          <button 
            className="action-btn comment-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare size={18} />
            <span>{comments.length}</span>
          </button>
          <button className="action-btn share-btn" onClick={handleShare}>
            <Share size={18} />
            <span>{post.shares}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-avatar"></div>
              <div className="comment-content">
                <div className="comment-bubble">
                  <div className="comment-header">
                    <span className="comment-user">{comment.user.name}</span>
                    <span className="comment-username">{comment.user.username}</span>
                    <span className="comment-timestamp">{comment.timestamp}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                  <div className="comment-actions">
                    <button 
                      className={`comment-like-btn ${comment.isLiked ? 'liked' : ''}`}
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      <ThumbsUp size={14} />
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Comment Input */}
          <div className="add-comment">
            <div className="comment-avatar"></div>
            <div className="comment-input-wrapper">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className="comment-input"
              />
              <button 
                className="comment-send-btn"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
