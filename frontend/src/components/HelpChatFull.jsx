import { useEffect, useRef, useState } from 'react';
import  io  from 'socket.io-client';
import { Send, Circle, X } from 'lucide-react';
import { useAuth } from '../services/authContext.jsx';
import { clearUnread } from '../services/chatUnread.js';
import { BASE_URL } from "../services/api";

const BASE = BASE_URL;


export default function HelpChatFull({ onClose, size = "md" }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const [closed, setClosed] = useState(false);
  const [askedNotify, setAskedNotify] = useState(false);
  const [notifyPerm, setNotifyPerm] = useState(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default');
  const socketRef = useRef(null);
  const convRef = useRef(null);
  const viewRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    let t = "";
    try {
      t = localStorage.getItem("token") || "";
    } catch {}
    if (!t) return;
    const token = t || "";
    clearUnread();


const s = io("http://3.209.223.219:3000", {
  transports: ["polling"],
  upgrade: false,
  query: { token }
});



    socketRef.current = s;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('help:message', (msg) => {
      setMessages((m) => [...m, msg]);
      // Sound on staff replies
      try {
        if (msg?.from && msg.from !== 'client') {
          audioRef.current?.play();
          if (typeof window !== 'undefined' && 'Notification' in window) {
            try {
              if (Notification.permission === 'granted') {
                new Notification('Support reply', { body: String(msg.text||'').slice(0, 80) });
              }
            } catch {}
          }
        }
      } catch {}
    });
    s.on('help:closed', () => setClosed(true));
    s.emit('help:join', null, (payload) => {
      convRef.current = payload?.conversationId;
      // Intentionally ignore history for now
    });
    return () => { s.off('connect', onConnect); s.off('disconnect', onDisconnect); s.disconnect(); };
  }, [user?.token]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTop = viewRef.current.scrollHeight;
    }
  }, [messages]);

  function send(e) {
    e?.preventDefault();
    const t = text.trim();
    if (!t || !socketRef.current) return;
    socketRef.current.emit('help:message', { conversationId: convRef.current, text: t });
    setText('');
  }

  function quickAsk(t) {
    setText(t);
    // slight delay so users can edit, or uncomment to auto-send
    // send();
  }

  function fmt(ts) {
    try { const d = new Date(ts); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  }

  const sizeClass = size === "sm" ? "max-w-md" : "max-w-2xl";
  const bodyHeight = size === "sm" ? "h-[360px]" : "h-[420px]";

  return (
    <div className={`w-full ${sizeClass} mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className="h-12 bg-white border-b border-gray-200 text-gray-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">QM</div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Customer Support {closed && <span className="ml-1 text-xs text-gray-500">(closed)</span>}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Circle size={10} className={connected ? 'text-emerald-500' : 'text-gray-400'} />
              {connected ? 'Online' : 'Connecting...'} · Avg reply: a few minutes
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-gray-500">Conversation is saved for quality</div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100" aria-label="Close chat">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Quick actions */}
      {messages.length === 0 && (
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 mb-2">Quick questions</div>
          <div className="flex flex-wrap gap-2">
            {['Where is my driver?','I need to change pickup time','Payment didn\'t go through','Create a new order'].map((t) => (
              <button key={t} onClick={() => quickAsk(t)} className="text-xs px-2.5 py-1 rounded-full border border-gray-300 text-gray-700 bg-white hover:border-gray-400">
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={viewRef} className={`${bodyHeight} overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white`}>
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-sm text-gray-600">How can we help today?</p>
            <p className="text-xs text-gray-500">A support agent will join shortly.</p>
          </div>
        )}
        {messages.map((m, idx) => {
          const staffSide = m.from && m.from !== "client";
          return (
            <div
              key={idx}
              className={`max-w-[75%] text-sm px-3 py-2 rounded-2xl shadow-sm ${
                staffSide
                  ? 'bg-white border border-gray-200 text-gray-900'
                  : 'bg-gray-100 border border-gray-200 text-gray-900 ml-auto'
              }`}
            >
              <div>{m.text}</div>
              <div className={`mt-1 text-[10px] ${staffSide ? 'text-gray-500' : 'text-white/80'}`}>{fmt(m.ts)}</div>
            </div>
          );
        })}
    </div>
      {/* Audio for notifications */}
      <audio ref={audioRef} src="data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA/////wAAAAC4A..." preload="auto" />

      {/* Composer */}
      <form onSubmit={send} className="p-4 flex items-center gap-2 border-t border-gray-200 bg-white">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={closed ? 'This conversation is closed' : 'Write a message...'}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-600 disabled:bg-gray-100"
          aria-label="Type your message"
          disabled={closed}
        />
        <button type="submit" disabled={!text.trim() || closed} className="p-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
