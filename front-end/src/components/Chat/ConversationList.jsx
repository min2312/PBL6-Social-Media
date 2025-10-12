/* filepath: d:\Code\PBL6-Social-Media\front-end\src\components\Chat\ConversationList.jsx */
import React from 'react';

const ConversationList = ({ conversations, activeConversation, onSelectConversation }) => {
  return (
    <div className="conversations-list">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="conversation-info">
            <div className="conversation-avatar">
              {conversation.isOnline && <div className="online-indicator" />}
            </div>
            <div className="conversation-details">
              <div className="conversation-header">
                <h4 className="conversation-name">{conversation.name}</h4>
                <span className="conversation-time">{conversation.lastMessageTime}</span>
              </div>
              <p className="conversation-preview">{conversation.lastMessage}</p>
            </div>
          </div>
          {conversation.unread && <div className="unread-indicator" />}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;