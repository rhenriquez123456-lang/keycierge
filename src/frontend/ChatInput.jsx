import React from "react";

function ChatInput({ inputValue, setInputValue, handleSend }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-input-area">
      <input
        type="text"
        placeholder="Type a message..."
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        className="chat-input"
      />
      <button onClick={handleSend} className="send-button">
        Send
      </button>
    </div>
  );
}

export default ChatInput;