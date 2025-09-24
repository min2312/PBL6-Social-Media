import React, { useState } from 'react';
import { MoreHorizontal, ThumbsUp, MessageSquare, Share } from 'lucide-react';
import AddPost from '../../components/AddPost/AddPost';
import './Home.css';

const HomePage = () => {
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [newCuitText, setNewCuitText] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: 'Shadow',
        username: '@mattshadow',
        avatar: '/api/placeholder/40/40'
      },
      content: 'Hi All, This is my new Exploration, what do you think?',
      images: [
        '/api/placeholder/300/200',
        '/api/placeholder/300/200'
      ],
      likes: 4,
      comments: 2,
      shares: 1,
      timestamp: 'Just Now'
    },
    {
      id: 2,
      user: {
        name: 'Syn',
        username: '@synistergates',
        avatar: '/api/placeholder/40/40'
      },
      content: 'When I tell you I love you, I don\'t say it out of habit',
      images: [],
      likes: 12,
      comments: 5,
      shares: 2,
      timestamp: '27 Dec'
    }
  ]);

  const handleAddPost = (postData) => {
    const newPost = {
      id: Date.now(),
      user: {
        name: 'Esmeralda',
        username: '@esmeralda',
        avatar: '/api/placeholder/40/40'
      },
      content: postData.caption,
      images: postData.images.map(img => img.url),
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: 'Just now'
    };
    
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="content-wrapper">
      {/* New Post Input - Click to open modal */}
      <div className="new-post" onClick={() => setIsAddPostOpen(true)}>
        <div className="post-input-container">
          <div className="post-avatar"></div>
          <div className="post-input-wrapper">
            <div className="post-textarea-placeholder">
              What's on your mind?
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="posts-feed">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
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
                <button className="action-btn like-btn">
                  <ThumbsUp size={18} />
                  <span>{post.likes}</span>
                </button>
                <button className="action-btn comment-btn">
                  <MessageSquare size={18} />
                  <span>{post.comments}</span>
                </button>
                <button className="action-btn share-btn">
                  <Share size={18} />
                  <span>{post.shares}</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {post.id === 1 && (
              <div className="comments-section">
                <div className="comment">
                  <div className="comment-avatar"></div>
                  <div className="comment-content">
                    <div className="comment-bubble">
                      <p className="comment-user">Zakky <span className="comment-username">@vengeance</span></p>
                      <p className="comment-text">
                        <span className="mention">@mattshadow</span> Wow amazing work do you have 🔥!!!
                      </p>
                    </div>
                    <div className="comment-actions">
                      <button className="comment-btn">
                        Comment
                      </button>
                      <button className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Post Modal */}
      <AddPost
        isOpen={isAddPostOpen}
        onClose={() => setIsAddPostOpen(false)}
        onSubmit={handleAddPost}
      />
    </div>
  );
};

export default HomePage;