import React, { useState, useRef } from 'react';
import { X, ImagePlus, Trash2 } from 'lucide-react';
import './AddPost.css';

const AddPost = ({ isOpen, onClose, onSubmit }) => {
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const maxLength = 280;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = () => {
    if (caption.trim() || images.length > 0) {
      onSubmit({
        caption: caption.trim(),
        images: images
      });
      
      // Reset form
      setCaption('');
      setImages([]);
      onClose();
    }
  };

  const handleClose = () => {
    setCaption('');
    setImages([]);
    onClose();
  };

  if (!isOpen) return null;

  const remainingChars = maxLength - caption.length;
  const canPost = (caption.trim() || images.length > 0) && remainingChars >= 0;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Post</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="user-info">
            <div className="user-avatar"></div>
            <div className="user-details">
              <h4>Esmeralda</h4>
              <p>Public</p>
            </div>
          </div>

          <form className="post-form">
            <textarea
              className="caption-input"
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={maxLength}
            />

            {images.length > 0 && (
              <div className="image-preview">
                {images.map((image) => (
                  <div key={image.id} className="preview-item">
                    <img 
                      src={image.url} 
                      alt="Preview" 
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(image.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="image-upload-section">
              <div className="upload-content">
                <ImagePlus size={48} className="upload-icon" />
                <p className="upload-text">Add photos to your post</p>
                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Photos
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="file-input"
                onChange={handleImageUpload}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <div className={`character-count ${
            remainingChars < 20 ? (remainingChars < 0 ? 'error' : 'warning') : ''
          }`}>
            {remainingChars} characters remaining
          </div>
          <button
            className="post-submit-btn"
            onClick={handleSubmit}
            disabled={!canPost}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
