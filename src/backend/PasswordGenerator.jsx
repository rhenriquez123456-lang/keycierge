import React from "react";
import { useState, useRef, useEffect } from "react";

// ── Password Specifications ────────────────────────────────────────
// Must be at least 12 characters long
// Must contain at least one uppercase (capital) letter [A-Z]
// Must contain at least one special character from: !@#$%^&*
// Each password is tied to a specific app — different apps = different KEYs
// KEYs are 48 characters, deterministically derived (same pw + app = same KEY)
// ──────────────────────────────────────────────────────────────────

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function validatePassword(pw) {
  const errs = [];
  if (pw.length < 12)         errs.push("at least 12 characters");
  if (!/[A-Z]/.test(pw))      errs.push("at least one capital letter");
  if (!/[!@#$%^&*]/.test(pw)) errs.push("at least one special character (!@#$%^&*)");
  return errs;
}

// Derives a deterministic 48-char KEY from password + app name combined.
// The same password + same app always produces the same KEY.
// Different app names produce entirely different KEYs even with the same password.
function deriveKey(pw, app) {
  const seed_str = pw + "::" + app.toLowerCase().trim();
  let seed = 5381;
  for (let i = 0; i < seed_str.length; i++) {
    seed = (Math.imul(seed, 33) ^ seed_str.charCodeAt(i)) >>> 0;
  }
  let result = "";
  for (let i = 0; i < 48; i++) {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    result += CHARSET[(seed >>> 0) % CHARSET.length];
  }
  return result;
}

const PHASES = {
  MENU: "menu",
  ADD_APP: "add_app",
  ADD_PW: "add_pw",
  ADD_CONFIRM: "add_confirm",
  RETRIEVE_APP: "retrieve_app",
  RETRIEVE_PW: "retrieve_pw",
};

export default function Loki() {
  const [messages, setMessages] = useState([{
    from: "bot",
    text: "Hey, I'm Loki — your personal key vault. I can store a unique 48-character KEY for each of your apps, each protected by its own password. Type \"add\" to get started, or \"get\" to retrieve a KEY.",
  }]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState(PHASES.MENU);
  const [vault, setVault] = useState({}); // { AppName: { password, key } }
  const [pendingApp, setPendingApp] = useState(null);
  const [pendingPw, setPendingPw] = useState(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  function addMsg(text, from, key = null) {
    setMessages((prev) => [...prev, { from, text, key }]);
  }

  function handleSend() {
    if (!input.trim()) return;
    const val = input.trim();
    setInput("");

    const isPassword = [PHASES.ADD_PW, PHASES.ADD_CONFIRM, PHASES.RETRIEVE_PW].includes(phase);
    addMsg(isPassword ? "•".repeat(val.length) : val, "user");

    if (phase === PHASES.MENU) {
      const cmd = val.toLowerCase();
      if (cmd === "add") {
        addMsg("Sure! Which app are you adding a password for?", "bot");
        setPhase(PHASES.ADD_APP);
      } else if (cmd === "get") {
        if (Object.keys(vault).length === 0) {
          addMsg("Your vault is empty. Type \"add\" to store your first app password.", "bot");
        } else {
          addMsg("Which app's KEY would you like to retrieve?", "bot");
          setPhase(PHASES.RETRIEVE_APP);
        }
      } else {
        addMsg("I didn't catch that. Type \"add\" to store a new app password, or \"get\" to retrieve a KEY.", "bot");
      }

    } else if (phase === PHASES.ADD_APP) {
      const appName = val.charAt(0).toUpperCase() + val.slice(1);
      if (vault[appName]) {
        addMsg(`${appName} already has a password stored. Type "get" to retrieve it, or use a different app name.`, "bot");
        setPhase(PHASES.MENU);
      } else {
        setPendingApp(appName);
        addMsg(`Got it — ${appName}. Now create a password to protect your ${appName} KEY.`, "bot");
        setPhase(PHASES.ADD_PW);
      }

    } else if (phase === PHASES.ADD_PW) {
      const errs = validatePassword(val);
      if (errs.length > 0) {
        addMsg(`That password doesn't meet the requirements: ${errs.join(", ")}. Please try again.`, "bot");
      } else {
        setPendingPw(val);
        addMsg("Password accepted. Please confirm it by entering it again.", "bot");
        setPhase(PHASES.ADD_CONFIRM);
      }

    } else if (phase === PHASES.ADD_CONFIRM) {
      if (val !== pendingPw) {
        addMsg(`Passwords don't match. Let's try again — create a new password for ${pendingApp}.`, "bot");
        setPendingPw(null);
        setPhase(PHASES.ADD_PW);
      } else {
        const key = deriveKey(pendingPw, pendingApp);
        setVault((prev) => ({ ...prev, [pendingApp]: { password: pendingPw, key } }));
        addMsg(`Done! Your ${pendingApp} KEY has been stored. Type "add" for another app, or "get" to retrieve a KEY.`, "bot", key);
        setPendingApp(null);
        setPendingPw(null);
        setPhase(PHASES.MENU);
      }

    } else if (phase === PHASES.RETRIEVE_APP) {
      const appName = val.charAt(0).toUpperCase() + val.slice(1);
      if (!vault[appName]) {
        addMsg(`I don't have an entry for "${appName}". Type "add" to create one.`, "bot");
        setPhase(PHASES.MENU);
      } else {
        setPendingApp(appName);
        addMsg(`Enter the password for ${appName} to unlock its KEY.`, "bot");
        setPhase(PHASES.RETRIEVE_PW);
      }

    } else if (phase === PHASES.RETRIEVE_PW) {
      if (val === vault[pendingApp].password) {
        addMsg(`Correct! Here is your ${pendingApp} KEY:`, "bot", vault[pendingApp].key);
        setPendingApp(null);
        setPhase(PHASES.MENU);
      } else {
        addMsg(`Incorrect password for ${pendingApp}. Try again.`, "bot");
      }
    }
  }

  const isPasswordField = [PHASES.ADD_PW, PHASES.ADD_CONFIRM, PHASES.RETRIEVE_PW].includes(phase);

  return (
    <div style={{ maxWidth: 520, margin: "1rem auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #eee" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", color: "#EEEDFE", fontWeight: 500, fontSize: 14 }}>L</div>
        <div>
          <p style={{ margin: 0, fontWeight: 500 }}>Loki</p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Your personal key vault</p>
        </div>
      </div>

      {/* Chat log */}
      <div ref={logRef} style={{ border: "1px solid #ddd", borderRadius: 12, background: "#f9f9f9", padding: 12, minHeight: 200, maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.from === "user" ? "flex-end" : "flex-start", background: msg.from === "user" ? "#534AB7" : "#fff", color: msg.from === "user" ? "#EEEDFE" : "#111", border: msg.from === "bot" ? "1px solid #ddd" : "none", borderRadius: 8, padding: "8px 12px", maxWidth: "88%", fontSize: 14, lineHeight: 1.55 }}>
            {msg.text}
            {msg.key && (
              <div style={{ fontFamily: "monospace", fontSize: 11, background: "#f1f1f1", border: "1px solid #ddd", borderRadius: 6, padding: "6px 8px", wordBreak: "break-all", marginTop: 6 }}>
                {msg.key}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vault cards */}
      {Object.keys(vault).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, marginBottom: 10 }}>
          {Object.keys(vault).map((app) => (
            <div key={app} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ margin: "0 0 2px", fontWeight: 500, fontSize: 13 }}>{app}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#888" }}>KEY stored</p>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type={isPasswordField ? "password" : "text"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={phase === PHASES.MENU ? 'Type "add" or "get"...' : "Type here..."}
          autoComplete="off"
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
        />
        <button onClick={handleSend} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer", fontSize: 14 }}>
          Send
        </button>
      </div>
    </div>
  );
}