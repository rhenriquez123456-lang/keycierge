import React from "react";

function MessageBubble({ message }) {
  return (
    <div
      className={`message-row ${
        message.sender === "user" ? "user-row" : "bot-row"
      }`}
    >
      <div
        className={`message-bubble ${
          message.sender === "user" ? "user-bubble" : "bot-bubble"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

export default MessageBubble;