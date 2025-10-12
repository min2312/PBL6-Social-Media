import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageCircle, MoreHorizontal, Phone, Video, Info } from 'lucide-react';
import ConversationList from '../../components/Chat/ConversationList';
import MessageBubble from '../../components/Chat/MessageBubble';
import MessageInput from '../../components/Chat/MessageInput';
import './ChatPage.css';

const ChatPage = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Sample conversations data
  const [conversations] = useState([
    {
      id: 1,
      name: 'Federico Vittucci',
      username: '@viticci',
      lastMessage: 'Just wanted to say I always appreciate the links to MacStories on iDB. Thanks!',
      lastMessageTime: '2h',
      isOnline: true,
      unread: false
    },
    {
      id: 2,
      name: 'Andrew Green',
      username: '@andrewgreen',
      lastMessage: 'Hey man, sure thing! I always enjoy reading your insightful reviews.',
      lastMessageTime: '1d',
      isOnline: false,
      unread: true
    },
    {
      id: 3,
      name: 'Dave Mark',
      username: '@davemark',
      lastMessage: 'Apple Frames shortcut throwing an error on my devices.',
      lastMessageTime: '3d',
      isOnline: true,
      unread: false
    },
    {
      id: 4,
      name: 'Julia Petryk',
      username: '@julia_petryk',
      lastMessage: 'I hope you had a fantastic day!',
      lastMessageTime: '1w',
      isOnline: false,
      unread: false
    },
    {
      id: 5,
      name: 'Sarah Wilson',
      username: '@sarahw',
      lastMessage: 'Can you help me with the project?',
      lastMessageTime: '2w',
      isOnline: true,
      unread: false
    },
    {
      id: 6,
      name: 'Mike Johnson',
      username: '@mikej',
      lastMessage: 'Thanks for the review!',
      lastMessageTime: '3w',
      isOnline: false,
      unread: true
    },
    {
      id: 7,
      name: 'Emma Davis',
      username: '@emmad',
      lastMessage: 'See you tomorrow!',
      lastMessageTime: '1m',
      isOnline: true,
      unread: false
    },
    {
      id: 8,
      name: 'Tom Brown',
      username: '@tomb',
      lastMessage: 'Great work on the presentation',
      lastMessageTime: '2m',
      isOnline: false,
      unread: false
    }
  ]);

  // Sample messages for active conversation
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Just wanted to say I always appreciate the links to MacStories on iDB. Thanks!',
      time: '2:08 PM',
      isOwn: false
    },
    {
      id: 2,
      text: 'Hey man, sure thing! I always enjoy reading your insightful reviews.',
      time: '2:10 PM',
      isOwn: true
    },
    {
      id: 3,
      text: 'Apple Frames shortcut throwing an error on my devices. I\'m on iOS 14.2 and have downloaded it via macstories.net/ios/shortcuts/...',
      time: '4:39 PM',
      isOwn: false
    },
    {
      id: 4,
      text: 'Hey! If you\'re trying on 12 Pro Max or 12 mini, it doesn\'t currently support those devices yet',
      time: '5:00 PM',
      isOwn: false
    },
    {
      id: 5,
      text: 'Yeah, that\'s what I was doing (Pro Max). Thanks for clarifying! 👍',
      time: '5:26 PM',
      isOwn: true
    },
    {
      id: 6,
      text: 'This is another test message to see if the container fills properly',
      time: '6:00 PM',
      isOwn: false
    },
    {
      id: 7,
      text: 'And another one to fill up more space',
      time: '6:15 PM',
      isOwn: true
    },
    {
      id: 8,
      text: 'Let me add more messages to test the scrolling and full height',
      time: '6:30 PM',
      isOwn: false
    },
    {
      id: 9,
      text: 'This should help us see if the background extends to the bottom',
      time: '6:45 PM',
      isOwn: true
    },
    {
      id: 10,
      text: 'Final test message',
      time: '7:00 PM',
      isOwn: false
    },
    {
      id: 11,
      text: 'Adding more messages to test scroll behavior',
      time: '7:15 PM',
      isOwn: true
    },
    {
      id: 12,
      text: 'This message should be visible when opening the chat',
      time: '7:30 PM',
      isOwn: false
    },
    {
      id: 13,
      text: 'Last message in the conversation',
      time: '7:45 PM',
      isOwn: true
    }
  ]);

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Scroll to bottom immediately (without animation) for initial load
  const scrollToBottomImmediate = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when conversation is selected (immediate)
  useEffect(() => {
    if (activeConversation) {
      // Use timeout to ensure DOM is updated
      setTimeout(() => {
        scrollToBottomImmediate();
      }, 50);
    }
  }, [activeConversation]);

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  const handleSendMessage = (messageText) => {
    const newMessage = {
      id: messages.length + 1,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              placeholder="Search for people and groups"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Message Requests */}
        <div className="message-requests">
          <div className="requests-header">
            <h3 className="requests-title">Message requests</h3>
            <span className="requests-badge">13</span>
          </div>
        </div>

        {/* Conversations List */}
        <ConversationList
          conversations={filteredConversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {!activeConversation ? (
          <div className="chat-empty-state">
            <MessageCircle size={80} className="empty-icon" />
            <h2 className="empty-title">Select a message</h2>
            <p className="empty-description">
              Choose from your existing conversations, start a new one, or just keep swimming.
            </p>
            <button className="new-message-btn">New message</button>
          </div>
        ) : (
          <div className="chat-conversation">
            {/* Conversation Header */}
            <div className="chat-conversation-header">
              <div className="conversation-avatar">
                {activeConversation.isOnline && <div className="online-indicator" />}
              </div>
              <div className="conversation-info-main">
                <h3 className="conversation-name-main">{activeConversation.name}</h3>
                <p className="conversation-status">
                  {activeConversation.isOnline ? 'Active now' : activeConversation.username}
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
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.isOwn}
                />
              ))}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;