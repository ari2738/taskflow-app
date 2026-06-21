import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import api from "../api.js";

const WELCOME = "Hi! I'm your AI productivity assistant 🤖\n\nAsk me anything — about your tasks, deadlines, how to prioritise your work, or productivity tips!";

function formatTime() {
  return new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}

export default function AIChatbot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([{ role:"bot", text:WELCOME, time:formatTime() }]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, open]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg = { role:"user", text:msg, time:formatTime() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", { message: msg });
      setMessages((m) => [...m, { role:"bot", text:res.data.reply, time:formatTime() }]);
    } catch {
      setMessages((m) => [...m, { role:"bot", text:"Sorry, I couldn't connect to the AI. Make sure your GEMINI_API_KEY is set in backend/.env", time:formatTime() }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* FAB */}
      <button className="chatbot-fab" onClick={() => setOpen((o) => !o)} aria-label="AI assistant">
        {open ? <X size={22} /> : <Bot size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h4>AI Assistant</h4>
                <p>Powered by Gemini · Online</p>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="chat-bubble">{m.text}</div>
                <span className="chat-time">{m.time}</span>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <div className="chat-bubble" style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span className="spinner spinner-accent" style={{ width:14, height:14 }} />
                  <span style={{ color:"var(--text-muted)" }}>Thinking…</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your tasks…"
              disabled={loading}
            />
            <button className="chatbot-send" onClick={send}
              disabled={loading || !input.trim()}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
