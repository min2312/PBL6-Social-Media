import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, MessageCircle, MoreHorizontal, Phone, Video, Info, Send, Smile, Paperclip } from 'lucide-react';
import { UserContext } from '../../Context/UserProvider';
import { getAllFriendships } from '../../services/socialService';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useContext(UserContext);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Load friends from API
  useEffect(() => {
    const loadFriends = async () => {
      if (!user?.account?.id) {
        console.log('No user account id found:', user);
        return;
      }
      
      console.log('Loading friends for user ID:', user.account.id);
      setLoading(true);
      setError(null);
      try {
        const response = await getAllFriendships(user.account.id);
        console.log('API Response:', response);
        
        if (response && response.errCode === 0) {
          const friends = response.friendships || [];
          console.log('Friends data:', friends);
          
          // Chỉ lấy những người bạn đã kết bạn thành công
          const acceptedFriends = friends.filter(friend => friend.friendshipStatus === 'friends');
          console.log('Accepted friends:', acceptedFriends);
          
          // Chuyển đổi format dữ liệu phù hợp với component
          const formattedConversations = acceptedFriends.map((friend, index) => ({
            id: friend.id,
            name: friend.fullName || 'Unknown User',
            username: `@${friend.email?.split('@')[0] || 'unknown'}`,
            avatar: friend.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName || 'User')}&background=4f46e5&color=fff`,
            lastMessage: 'Start a conversation...',
            lastMessageTime: 'now',
            userId: friend.id,
            isOnline: false // Có thể thêm logic kiểm tra online status sau
          }));
          
          console.log('Formatted conversations:', formattedConversations);
          setConversations(formattedConversations);
        } else {
          console.log('API returned error or no data:', response);
          setError(response?.errMessage || 'Failed to load friends');
        }
      } catch (err) {
        console.error('Error loading friends:', err);
        setError('Error loading friends: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [user?.account?.id]);

  // Mock messages data (sẽ được thay thế bằng API thực trong tương lai)
  const [messagesData] = useState({});

  const [messages, setMessages] = useState([]);

  // Scroll to bottom functions
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  const scrollToBottomImmediate = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when conversation is selected
  useEffect(() => {
    if (activeConversation) {
      const conversationMessages = messagesData[activeConversation.id] || [];
      setMessages(conversationMessages);
      setTimeout(() => {
        scrollToBottomImmediate();
      }, 50);
    }
  }, [activeConversation, messagesData]);

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeConversation) {
      const message = {
        id: messages.length + 1,
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        sender: user?.account?.fullName || 'You',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (!user || !user.isAuthenticated) {
    return (
      <div className="content-wrapper">
        <div className="auth-required">
          <MessageCircle size={64} />
          <h2>Please log in to access messages</h2>
          <p>You need to be logged in to view your conversations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Chat Sidebar */}
      <div className="chat-sidebar">
        {/* Header */}
        <div className="chat-header">
          <h1 className="chat-title">Messages</h1>
          <div className="chat-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="conversations-list">
          {loading ? (
            <div className="loading-state">
              <p>Loading friends...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Error: {error}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="empty-friends-state">
              <p>No friends found</p>
              <p>Add some friends to start chatting!</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className="conversation-info">
                  <div className="conversation-avatar">
                    <img src={conversation.avatar} alt={conversation.name} />
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <h4 className="conversation-name">{conversation.name}</h4>
                      <span className="conversation-time">{conversation.lastMessageTime}</span>
                    </div>
                    <p className="conversation-preview">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {!activeConversation ? (
          <div className="chat-empty-state">
            <MessageCircle size={80} className="empty-icon" />
            <h2 className="empty-title">Select a conversation</h2>
            <p className="empty-description">
              Choose from your existing conversations to start messaging.
            </p>
          </div>
        ) : (
          <div className="chat-conversation">
            {/* Conversation Header */}
            <div className="chat-conversation-header">
              <div className="conversation-avatar">
                <img src={activeConversation.avatar} alt={activeConversation.name} />
                {activeConversation.isOnline && <div className="online-indicator" />}
              </div>
              <div className="conversation-info-main">
                <h3 className="conversation-name-main">{activeConversation.name}</h3>
                <p className="conversation-status">
                  {activeConversation.isOnline ? 'Active now' : `Last seen ${activeConversation.lastMessageTime} ago`}
                </p>
              </div>
              <div className="chat-options">
                <button className="chat-option-btn" title="Voice call">
                  <Phone size={20} />
                </button>
                <button className="chat-option-btn" title="Video call">
                  <Video size={20} />
                </button>
                <button className="chat-option-btn" title="Conversation information">
                  <Info size={20} />
                </button>
                <button className="chat-option-btn" title="More options">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="messages-container" 
              ref={messagesContainerRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-group ${message.isOwn ? 'sent' : 'received'}`}
                >
                  {!message.isOwn && (
                    <div className="message-avatar">
                      <img src={message.avatar} alt={message.sender} />
                    </div>
                  )}
                  <div className={`message-bubble ${message.isOwn ? 'sent' : 'received'}`}>
                    <p className="message-text">{message.text}</p>
                    <span className="message-time">{message.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              <form onSubmit={handleSendMessage}>
                <div className="message-input-wrapper">
                  <button type="button" className="input-action-btn">
                    <Paperclip size={20} />
                  </button>
                  <textarea
                    className="message-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={1}
                  />
                  <button type="button" className="input-action-btn">
                    <Smile size={20} />
                  </button>
                  <button 
                    type="submit" 
                    className="send-btn"
                    disabled={!newMessage.trim()}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;