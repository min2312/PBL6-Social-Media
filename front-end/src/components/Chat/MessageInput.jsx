/* filepath: d:\Code\PBL6-Social-Media\front-end\src\components\Chat\MessageInput.jsx */
import React, { useState } from 'react';
import { Send, Image, Smile } from 'lucide-react';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit}>
        <div className="message-input-wrapper">
          <textarea
            className="message-input"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <div className="input-actions">
            <button type="button" className="input-action-btn" title="Add image">
              <Image size={18} />
            </button>
            <button type="button" className="input-action-btn" title="Add emoji">
              <Smile size={18} />
            </button>
            <button 
              type="submit" 
              className="send-btn"
              disabled={!message.trim()}
              title="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;