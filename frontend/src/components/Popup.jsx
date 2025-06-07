// components/Popup.jsx
import React, { useEffect } from 'react';

function Popup({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="popup">
      <p>{message}</p>
    </div>
  );
}

export default Popup;
