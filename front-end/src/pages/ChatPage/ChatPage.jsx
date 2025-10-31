import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, MessageCircle, MoreHorizontal, Phone, Video, Info, Send, Smile, Paperclip } from 'lucide-react';
import { UserContext } from '../../Context/UserProvider';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useContext(UserContext);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Mock conversations data
  const [conversations] = useState([
    {
      id: 1,
      name: 'John Doe',
      username: '@johndoe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff',
      lastMessage: 'Hey! How are you doing today?',
      lastMessageTime: '2m',
      isOnline: true,
      unread: 2,
      userId: 2
    },
    {
      id: 2,
      name: 'Jane Smith',
      username: '@janesmith',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff',
      lastMessage: 'Thanks for the help yesterday!',
      lastMessageTime: '1h',
      isOnline: false,
      unread: 0,
      userId: 3
    },
    {
      id: 3,
      name: 'Mike Johnson',
      username: '@mikej',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=f59e0b&color=fff',
      lastMessage: 'Let\'s meet up tomorrow',
      lastMessageTime: '3h',
      isOnline: true,
      unread: 1,
      userId: 4
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      username: '@sarahw',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=ef4444&color=fff',
      lastMessage: 'Great work on the project!',
      lastMessageTime: '1d',
      isOnline: false,
      unread: 0,
      userId: 5
    },
    {
      id: 5,
      name: 'Alex Brown',
      username: '@alexb',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Brown&background=8b5cf6&color=fff',
      lastMessage: 'Can you review this document?',
      lastMessageTime: '2d',
      isOnline: true,
      unread: 0,
      userId: 6
    },
    {
      id: 6,
      name: 'Emma Davis',
      username: '@emmad',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=06b6d4&color=fff',
      lastMessage: 'See you at the meeting!',
      lastMessageTime: '3d',
      isOnline: false,
      unread: 0,
      userId: 7
    }
  ]);

  // Mock messages data
  const [messagesData] = useState({
    1: [
      {
        id: 1,
        text: 'Hey! How are you doing today?',
        time: '10:30 AM',
        isOwn: false,
        sender: 'John Doe',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff',
        timestamp: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        id: 2,
        text: 'I\'m doing great! Just finished working on the new project.',
        time: '10:32 AM',
        isOwn: true,
        sender: user?.account?.fullName || 'You',
        timestamp: new Date(Date.now() - 1 * 60 * 1000)
      },
      {
        id: 3,
        text: 'That sounds awesome! What kind of project is it?',
        time: '10:33 AM',
        isOwn: false,
        sender: 'John Doe',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff',
        timestamp: new Date(Date.now() - 30 * 1000)
      }
    ],
    2: [
      {
        id: 1,
        text: 'Thanks for the help yesterday!',
        time: '9:15 AM',
        isOwn: false,
        sender: 'Jane Smith',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff',
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        id: 2,
        text: 'No problem! Happy to help anytime.',
        time: '9:20 AM',
        isOwn: true,
        sender: user?.account?.fullName || 'You',
        timestamp: new Date(Date.now() - 55 * 60 * 1000)
      }
    ],
    3: [
      {
        id: 1,
        text: 'Let\'s meet up tomorrow',
        time: '7:45 AM',
        isOwn: false,
        sender: 'Mike Johnson',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=f59e0b&color=fff',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ]
  });

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
          {filteredConversations.map((conversation) => (
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
          ))}
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