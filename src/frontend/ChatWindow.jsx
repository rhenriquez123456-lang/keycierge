import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

function ChatWindow({ messages }) {

  const bottomRef = useRef(null);

  useEffect(() => {                                              //  proper opening brace
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });   //  [messages] moved out
  }, [messages]);                                                // dependency array here

  
  return (
    <div className="chat-window">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;