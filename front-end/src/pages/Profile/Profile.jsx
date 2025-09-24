import React, { useState } from 'react';
import { Calendar, MapPin, Link as LinkIcon, X, MessageSquare } from 'lucide-react';
import { MoreHorizontal, ThumbsUp, MessageSquare as MessageSquareIcon, Share } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Esmeralda Rodriguez',
    username: '@esmeralda',
    bio: 'Frontend Developer | React Enthusiast | Coffee Lover ☕\nBuilding amazing user experiences one component at a time.',
    location: 'San Francisco, CA',
    website: 'https://esmeralda.dev',
    joinDate: 'March 2020',
    posts: 245,
    followers: 1240,
    following: 320
  });

  const [editForm, setEditForm] = useState({
    name: profileData.name,
    bio: profileData.bio,
    location: profileData.location,
    website: profileData.website
  });

  const userPosts = [
    {
      id: 1,
      content: 'Just finished implementing a new feature using React hooks! The component lifecycle is so much cleaner now 🚀',
      images: [],
      likes: 24,
      comments: 5,
      shares: 2,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      content: 'Beautiful sunset from my office window. Sometimes you need to pause and appreciate the simple things in life 🌅',
      images: ['/api/placeholder/400/300'],
      likes: 89,
      comments: 12,
      shares: 7,
      timestamp: '1 day ago'
    }
  ];

  const handleEditProfile = () => {
    setEditForm({
      name: profileData.name,
      bio: profileData.bio,
      location: profileData.location,
      website: profileData.website
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    setProfileData(prev => ({
      ...prev,
      ...editForm
    }));
    setIsEditModalOpen(false);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setProfileData(prev => ({
      ...prev,
      followers: isFollowing ? prev.followers - 1 : prev.followers + 1
    }));
  };

  const renderPosts = () => {
    if (userPosts.length === 0) {
      return (
        <div className="no-posts">
          <MessageSquare size={48} className="no-posts-icon" />
          <h3>No posts yet</h3>
          <p>When you share posts, they'll appear here.</p>
        </div>
      );
    }

    return (
      <div className="profile-posts">
        {userPosts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-user-info">
                <div className="post-user-avatar"></div>
                <div className="post-user-details">
                  <p className="user-name">{profileData.name}</p>
                  <p className="user-username">{profileData.username}</p>
                </div>
              </div>
              <div className="post-meta">
                <span className="post-timestamp">{post.timestamp}</span>
                <button className="post-menu-btn">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            <p className="post-content">{post.content}</p>

            {post.images.length > 0 && (
              <div className="post-images">
                {post.images.map((image, index) => (
                  <div key={index} className="post-image">
                    <div className="image-placeholder">🖼️</div>
                  </div>
                ))}
              </div>
            )}

            <div className="post-actions-bar">
              <div className="post-actions-left">
                <button className="action-btn like-btn">
                  <ThumbsUp size={18} />
                  <span>{post.likes}</span>
                </button>
                <button className="action-btn comment-btn">
                  <MessageSquareIcon size={18} />
                  <span>{post.comments}</span>
                </button>
                <button className="action-btn share-btn">
                  <Share size={18} />
                  <span>{post.shares}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return renderPosts();
      case 'media':
        return (
          <div className="no-posts">
            <MessageSquare size={48} className="no-posts-icon" />
            <h3>No media yet</h3>
            <p>Photos and videos shared will appear here.</p>
          </div>
        );
      case 'likes':
        return (
          <div className="no-posts">
            <MessageSquare size={48} className="no-posts-icon" />
            <h3>No liked posts</h3>
            <p>Liked posts will appear here.</p>
          </div>
        );
      default:
        return renderPosts();
    }
  };

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="cover-photo"></div>
        <div className="profile-info">
          <div className="profile-avatar"></div>
          <div className="profile-details">
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-username">{profileData.username}</p>
            <p className="profile-bio">{profileData.bio}</p>
            
            <div className="profile-meta">
              <div className="meta-item">
                <MapPin size={16} className="meta-icon" />
                <span>{profileData.location}</span>
              </div>
              <div className="meta-item">
                <LinkIcon size={16} className="meta-icon" />
                <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                  {profileData.website}
                </a>
              </div>
              <div className="meta-item">
                <Calendar size={16} className="meta-icon" />
                <span>Joined {profileData.joinDate}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={handleEditProfile}>
                Edit Profile
              </button>
              <button 
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="profile-stats">
        <div className="stat-item">
          <p className="stat-number">{profileData.posts}</p>
          <p className="stat-label">Posts</p>
        </div>
        <div className="stat-item">
          <p className="stat-number">{profileData.followers}</p>
          <p className="stat-label">Followers</p>
        </div>
        <div className="stat-item">
          <p className="stat-number">{profileData.following}</p>
          <p className="stat-label">Following</p>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={`tab-button ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          Media
        </button>
        <button
          className={`tab-button ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          Likes
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="edit-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2 className="edit-modal-title">Edit Profile</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="edit-modal-body">
              <form className="edit-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="Your name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-textarea"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({...prev, bio: e.target.value}))}
                    placeholder="Tell us about yourself"
                    maxLength={160}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({...prev, location: e.target.value}))}
                    placeholder="Where are you located?"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    className="form-input"
                    value={editForm.website}
                    onChange={(e) => setEditForm(prev => ({...prev, website: e.target.value}))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </form>
            </div>

            <div className="edit-modal-footer">
              <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
