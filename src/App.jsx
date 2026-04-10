import React, { useState, useEffect } from "react";
import ChatInput from "./frontend/ChatInput";
import ChatWindow from "./frontend/ChatWindow";
import Login from "./frontend/Login";
import Signup from "./frontend/Signup";
import { storePassword, retrievePassword } from "./backend/vault.jsx";

function App() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [screen, setScreen] = useState("login"); // "login" | "signup" | "chat"

    useEffect(() => {
        const greeting = {
            id: Date.now(),
            sender: "ai",
            text: "Hey, I'm Loki — your AI password manager. I can help you store and retrieve your passwords securely using access keys. What can I help you with?"
        };
        setMessages([greeting]);
    }, []);

    async function handleSend() {
        if (!inputValue.trim()) return;

            const userMessage = { id: Date.now(), sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    //  Detect store command
    if (inputValue.toLowerCase().startsWith("store ")) {
        const password = inputValue.slice(6).trim();
        const accessKey = await storePassword(password);
        setMessages((prev) => [...prev, { 
            id: Date.now() + 1, 
            sender: "ai", 
            text: `Done! Your password has been stored. Your access key is: ${accessKey} — keep this safe, you'll need it to retrieve your password.` 
        }]);
        setLoading(false);
        return;
    }

    // Detect retrieve command
    if (inputValue.toLowerCase().startsWith("retrieve ")) {
        const accessKey = inputValue.slice(9).trim();
        try {
            const password = await retrievePassword(accessKey);
            setMessages((prev) => [...prev, { 
                id: Date.now() + 1, 
                sender: "ai", 
                text: `Here is your password: ${password}` 
            }]);
        } catch (err) {
            setMessages((prev) => [...prev, { 
                id: Date.now() + 1, 
                sender: "ai", 
                text: "I couldn't find a password for that access key." 
            }]);
        }
        setLoading(false);
        return;
    }

        try {
            const response = await fetch("/api/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
                    "anthropic-version": "2023-06-01",
                    "anthropic-dangerous-direct-browser-access": "true"
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: `You are Loki, an AI password manager assistant. Be friendly, brief, and helpful.`,
                    messages: [{ role: "user", content: inputValue }],
                }),
            });
            const data = await response.json();
            const botText = data.content[0].text;
            setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: botText }]);
        } catch (err) {
            console.error("API error:", err);
            setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: "Error reaching AI." }]);
        } finally {
            setLoading(false);
        }
    }

    // ✅ Show correct screen based on state
    if (screen === "login") {
        return (
            <div>
                <div className="hrImage">
                    <h1 className="hrHeader">Loki</h1>
                </div>
                <Login onLogin={() => setScreen("chat")} />
                <p style={{ textAlign: "center", color: "#fff" }}>
                    Don't have an account?{" "}
                    <span 
                        onClick={() => setScreen("signup")} 
                        style={{ color: "#4bc9ff", cursor: "pointer" }}>
                        Sign Up
                    </span>
                </p>
            </div>
        );
    }

    if (screen === "signup") {
        return (
            <div>
                <Signup onSignup={() => setScreen("login")} />
                <p style={{ textAlign: "center", color: "#fff" }}>
                    Already have an account?{" "}
                    <span 
                        onClick={() => setScreen("login")} 
                        style={{ color: "#4bc9ff", cursor: "pointer" }}>
                        Login
                    </span>
                </p>
            </div>
        );
    }

    return (
        <div className="app">
            <div className="chat-wrapper">
                <div className="chat-header">
                    <h1>AI Password Assistant</h1>
                    <p>Ask me for your passwords</p>
                </div>
                <ChatWindow messages={messages} loading={loading} />
                <ChatInput
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    handleSend={handleSend}
                    loading={loading}
                />
            </div>
        </div>
    );
}

export default App;