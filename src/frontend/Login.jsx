import React, { useState } from "react";
import { account } from "../appwrite";
import Spinner from "./Spinner.jsx";

export default function Login({ onLogin }) {

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

   async function LoginData() {
    setLoading(true);
    setError("");
    try {
        // ✅ Delete any existing session first
        try {
            await account.deleteSession("current");
        } catch (e) {
            // no session existed, that's fine
        }

        const session = await account.createEmailPasswordSession(username, password);
        console.log("logged in", session);
        onLogin();
    } catch (err) {
        console.error("Error:", err.message);
        setError(err.message);
    } finally {
        setLoading(false);
    }
}

    return (
        <div className="loginBox">
            <div className="loginHeader">
                <h2>Loki</h2>
                <input placeholder="Email" onChange={(e) => setUsername(e.target.value)} />
                <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
                <button disabled={loading} onClick={LoginData}>
                    {loading ? <Spinner /> : "Login"}
                </button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    );
}