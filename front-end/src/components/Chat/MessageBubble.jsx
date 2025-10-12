/* filepath: d:\Code\PBL6-Social-Media\front-end\src\components\Chat\MessageBubble.jsx */
import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`message-group ${isOwn ? 'sent' : 'received'}`}>
      <div className={`message-bubble ${isOwn ? 'sent' : 'received'}`}>
        {message.text}
      </div>
      {message.time && <div className="message-time">{message.time}</div>}
    </div>
  );
};

export default MessageBubble;