import React, { useState } from 'react';
import AddPost from '../../components/AddPost/AddPost';
import Post from '../../components/Post/Post';
import './Home.css';

const HomePage = () => {
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
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
      comments: [
        {
          id: 1,
          user: {
            name: 'Zakky',
            username: '@vengeance',
            avatar: '/api/placeholder/32/32'
          },
          content: '@mattshadow Wow amazing work do you have 🔥!!!',
          likes: 2,
          timestamp: '5m ago',
          isLiked: false
        }
      ],
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
      comments: [],
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
      comments: [],
      shares: 0,
      timestamp: 'Just now'
    };
    
    setPosts(prev => [newPost, ...prev]);
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
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
          <Post 
            key={post.id} 
            post={post} 
            onUpdatePost={handleUpdatePost}
          />
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