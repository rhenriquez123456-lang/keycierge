import React from "react";
import { useState } from 'react'
import { account } from "../appwrite.js"
import Spinner from './Spinner.jsx'

export default function Login() {

const [ error, setError ] = useState("");
const [ loading, setLoading ] = useState(false);
const [ username, setUsername ] = useState("");
const [ password, setPassword ] = useState("");

// Function async to initiate accessment into database for matching username and password
async function LoginData() {

  setLoading(true);
  setError("");

  try{
                          // Appwrite object (createEmailPasswordSection from appwrite.js)    
    const session = await account.createEmailPasswordSession(username, password);

    console.log("logged in", session);
    return session;
  } catch (err) {
    setError("Error Accessing Database");
  } finally {
    setLoading(false);
  }

  } 
   // Component returns button to initiate login function
return (
    <div>
      <input placeholder="Email" onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
    
      <button disabled={loading} onClick={() => LoginData}>
       {loading ? <Spinner /> : "Login"} 
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  ); 
}