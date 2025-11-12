import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, MessageCircle, MoreHorizontal, Phone, Video, Info, Send, Smile, Paperclip, Edit2, Check, X } from 'lucide-react';
import { UserContext } from '../../Context/UserProvider';
import { getAllFriendships, getMessages, editMessage } from '../../services/socialService';
import './ChatPage.css';
import { io } from 'socket.io-client';

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
  const [socket, setSocket] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
		if (!user || !user.token) {
			return;
		}

		const newSocket = io(`${process.env.REACT_APP_API_URL}`, {
			extraHeaders: {
				Authorization: `Bearer ${user.token}`,
			},
		});

		setSocket(newSocket);

		newSocket.on("connect", () => {
			console.log("Socket connected for chat:", newSocket.id);
		});

		newSocket.on("receiveMessage", (message) => {
			const receivedMessage = {
				id: message.messageId || Date.now(),
				text: message.text,
				time: new Date().toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
				isOwn: false,
				sender: activeConversation?.name,
				timestamp: new Date(),
				avatar: activeConversation?.avatar,
			};
			
			// Update messages if the conversation is active
			if (activeConversation && message.senderId === activeConversation.userId) {
				setMessages((prev) => [...prev, receivedMessage]);
			}
			
			// Update conversation preview
			setConversations((prev) => 
				prev.map((conv) => 
					conv.userId === message.senderId
						? {
								...conv,
								lastMessage: message.text,
								lastMessageTime: 'now',
							}
						: conv
				)
			);
		});

		// Listen for message saved confirmation with real ID
		newSocket.on("messageSaved", ({ tempId, realId, message }) => {
			console.log('Message saved with real ID:', realId, 'replacing temp ID:', tempId);
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === tempId
						? { ...msg, id: realId }
						: msg
				)
			);
		});

		newSocket.on("messageEdited", (data) => {
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === data.messageId
						? { ...msg, text: data.newContent, isEdited: true }
						: msg
				)
			);
			
			// Update conversation preview if needed
			setConversations((prev) =>
				prev.map((conv) =>
					conv.userId === data.senderId
						? { ...conv, lastMessage: data.newContent }
						: conv
				)
			);
		});

		newSocket.on("connect_error", (err) => {
			console.error("Chat socket connection error:", err.message);
		});

		newSocket.on("disconnect", (reason) => {
			console.warn("Chat socket disconnected:", reason);
		});

		return () => {
			newSocket.disconnect();
		};
	}, [user, activeConversation]);

  // Load friends from API
  useEffect(() => {
    const loadFriends = async () => {
      if (!user?.account?.id) {
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const response = await getAllFriendships(user.account.id);
        
        if (response && response.errCode === 0) {
          const friends = response.friendships || [];
          
          // Chỉ lấy những người bạn đã kết bạn thành công
          const acceptedFriends = friends.filter(friend => friend.friendshipStatus === 'friends');
          
          // Chuyển đổi format dữ liệu phù hợp với component và lấy tin nhắn mới nhất
          const formattedConversationsPromises = acceptedFriends.map(async (friend) => {
            let lastMessage = 'Start a conversation...';
            let lastMessageTime = 'now';
            
            // Fetch latest message for this friend
            try {
              const messagesResponse = await getMessages(user.account.id, friend.id);
              if (messagesResponse && messagesResponse.errCode === 0 && messagesResponse.messages.length > 0) {
                const latestMsg = messagesResponse.messages[messagesResponse.messages.length - 1];
                lastMessage = latestMsg.content;
                lastMessageTime = formatTime(new Date(latestMsg.createdAt));
              }
            } catch (err) {
              console.error(`Error loading messages for friend ${friend.id}:`, err);
            }
            
            return {
              id: friend.id,
              name: friend.fullName || 'Unknown User',
              username: `@${friend.email?.split('@')[0] || 'unknown'}`,
              avatar: friend.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName || 'User')}&background=4f46e5&color=fff`,
              lastMessage,
              lastMessageTime,
              userId: friend.id,
              isOnline: false
            };
          });
          
          const formattedConversations = await Promise.all(formattedConversationsPromises);
          setConversations(formattedConversations);
        } else {
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

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (activeConversation && user?.account?.id) {
        try {
          const response = await getMessages(user.account.id, activeConversation.userId);
          
          if (response && response.errCode === 0) {
            const formattedMessages = response.messages.map((msg) => ({
              id: msg.id,
              text: msg.content,
              time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              isOwn: msg.senderId === user.account.id,
              sender: msg.User?.fullName || 'Unknown',
              timestamp: new Date(msg.createdAt),
              avatar: msg.User?.profilePicture || activeConversation.avatar,
              isEdited: msg.isEdited || false,
            }));
            setMessages(formattedMessages);
            setTimeout(() => {
              scrollToBottomImmediate();
            }, 50);
          }
        } catch (err) {
          console.error('Error loading messages:', err);
        }
      }
    };

    loadMessages();
  }, [activeConversation, user?.account?.id]);

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  const handleSendMessage = (e) => {
		e.preventDefault();
		
		if (newMessage.trim() && activeConversation && socket) {
			const tempId = `temp-${Date.now()}`;
			const message = {
				id: tempId,
				text: newMessage.trim(),
				time: new Date().toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
				isOwn: true,
				sender: user?.account?.fullName || "You",
				timestamp: new Date(),
			};

			socket.emit("sendMessage", {
				recipientId: activeConversation.userId,
				message: {
					text: newMessage.trim(),
					tempId: tempId,
				},
			});

			setMessages((prev) => [...prev, message]);
			
			// Update conversation preview
			setConversations((prev) =>
				prev.map((conv) =>
					conv.userId === activeConversation.userId
						? {
								...conv,
								lastMessage: newMessage.trim(),
								lastMessageTime: 'now',
							}
						: conv
				)
			);
			
			setNewMessage("");
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

  const formatDateDivider = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare only dates
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      // Format as "Monday, January 1, 2025"
      return messageDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const shouldShowDateDivider = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);
    
    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);
    
    return currentDate.getTime() !== previousDate.getTime();
  };

  const handleEditMessage = async (messageId) => {
    if (!editingText.trim()) {
      console.log('Edit message: empty text, canceling');
      cancelEditing();
      return;
    }
    
    console.log('Editing message:', messageId, 'New content:', editingText.trim());
    
    try {
      const response = await editMessage(messageId, editingText.trim(), user.account.id);
      
      console.log('Edit message response:', response);
      
      if (response && response.errCode === 0) {
        // Update local message state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, text: editingText.trim(), isEdited: true }
              : msg
          )
        );
        
        // Emit socket event to update for other user
        if (socket && socket.connected) {
          console.log('Emitting editMessage socket event to recipient:', activeConversation.userId);
          socket.emit('editMessage', {
            messageId,
            newContent: editingText.trim(),
            recipientId: activeConversation.userId,
          });
        } else {
          console.warn('Socket not connected, cannot emit editMessage event');
        }
        
        // Update conversation preview if it's the latest message
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex === messages.length - 1) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.userId === activeConversation.userId
                ? { ...conv, lastMessage: editingText.trim() }
                : conv
            )
          );
        }
        
        setEditingMessageId(null);
        setEditingText('');
      } else {
        console.error('Edit failed:', response?.errMessage);
        alert(response?.errMessage || 'Failed to edit message');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message. Please try again.');
    }
  };

  const startEditingMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingText(message.text);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText('');
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
              {messages.map((message, index) => (
                <React.Fragment key={message.id}>
                  {shouldShowDateDivider(message, messages[index - 1]) && (
                    <div className="date-divider">
                      <span className="date-divider-text">
                        {formatDateDivider(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`message-group ${message.isOwn ? 'sent' : 'received'}`}
                  >
                    {!message.isOwn && (
                      <div className="message-avatar">
                        <img src={message.avatar} alt={message.sender} />
                      </div>
                    )}
                    <div className={`message-bubble ${message.isOwn ? 'sent' : 'received'}`}>
                      {editingMessageId === message.id ? (
                        <div className="message-edit-container">
                          <input
                            type="text"
                            className="message-edit-input"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleEditMessage(message.id);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                cancelEditing();
                              }
                            }}
                            autoFocus
                          />
                          <div className="message-edit-actions">
                            <button
                              className="edit-action-btn confirm"
                              onClick={() => handleEditMessage(message.id)}
                              title="Save"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="edit-action-btn cancel"
                              onClick={cancelEditing}
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="message-text">
                            {message.text}
                            {message.isEdited && <span className="edited-indicator"> (edited)</span>}
                          </p>
                          <div className="message-footer">
                            <span className="message-time">{message.time}</span>
                            {message.isOwn && (
                              <button
                                className="edit-message-btn"
                                onClick={() => startEditingMessage(message)}
                                title="Edit message"
                              >
                                <Edit2 size={12} />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </React.Fragment>
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