import React, { useState } from "react";
import { databases, account } from "../appwrite";
import { ID } from "appwrite";
import Spinner from "./Spinner.jsx";

export default function Signup({ onSignup }) {

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: "", lastName: "", username: "", email: "", password: ""
    });

    async function newUser() {
        setLoading(true);
        setError("");
        try {
            await account.create(ID.unique(), form.email, form.password, form.username);
            await databases.createDocument(
                import.meta.env.VITE_APPWRITE_DB_ID,
                import.meta.env.VITE_APPWRITE_COLLECTION_ID,
                ID.unique(),
                {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    username: form.username,
                    email: form.email,
                }
            );
            onSignup();
        } catch (err) {
            setError("Signup Failed: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="loginBox">
            <div className="loginHeader">
                <h2>Sign Up</h2>
                <input placeholder="First Name" onChange={(e) => setForm({...form, firstName: e.target.value})} />
                <input placeholder="Last Name" onChange={(e) => setForm({...form, lastName: e.target.value})} />
                <input placeholder="Username" onChange={(e) => setForm({...form, username: e.target.value})} />
                <input placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} />
                <input placeholder="Password" type="password" onChange={(e) => setForm({...form, password: e.target.value})} />
                <button disabled={loading} onClick={newUser}>
                    {loading ? <Spinner /> : "Sign Up"}
                </button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    );
}