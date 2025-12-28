import { useEffect, useRef, useState } from 'react';
import  io  from 'socket.io-client';
import { MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../services/authContext.jsx';
import { clearUnread, getUnreadCount, incrementUnread, subscribeUnread } from '../services/chatUnread.js';
import { BASE_URL } from "../services/api";



export default function HelpChat({ defaultOpen = false }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const convRef = useRef(null);
  const viewRef = useRef(null);
  const openRef = useRef(false);

  useEffect(() => {
    const token = user?.token;
    let t = token;
    if (!t) {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        t = u.token;
      } catch {}
    }


const s = io("https://wmc-transport.vercel.app", {
  transports: ["polling"],
  upgrade: false,
  withCredentials: true,
  query: { token: t || "" }
});
    



    socketRef.current = s;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('help:message', (msg) => {
      setMessages((m) => [...m, msg]);
      if (msg?.from && msg.from !== 'client' && !openRef.current) {
        const next = incrementUnread();
        setUnreadCount(next);
      }
    });
    s.emit('help:join', null, (payload) => {
      convRef.current = payload?.conversationId;
      if (payload?.history?.length) setMessages(payload.history);
    });
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.disconnect();
    };
  }, [user?.token]);

  useEffect(() => {
    setUnreadCount(getUnreadCount());
    const unsub = subscribeUnread(() => setUnreadCount(getUnreadCount()));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTop = viewRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    openRef.current = open;
    if (open) {
      clearUnread();
      setUnreadCount(0);
    }
  }, [open]);

  function send(e) {
    e?.preventDefault();
    const t = text.trim();
    if (!t || !socketRef.current) return;
    socketRef.current.emit('help:message', { conversationId: convRef.current, text: t });
    setText('');
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-4 py-3 rounded-full shadow-xl hover:brightness-105 ring-1 ring-white/20"
          aria-label="Open help chat"
        >
          <span className="relative inline-flex items-center">
            <MessageCircle size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-gray-800" />
            )}
          </span>
          Help
        </button>
      )}

      {open && (
        <div className="w-96 sm:w-[28rem] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-12 bg-gradient-to-r from-gray-900 to-gray-700 text-white flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-emerald-300" : "bg-white/60"}`} />
              <div className="font-semibold">Live Support</div>
            </div>
            <button className="text-white/90 hover:text-white" onClick={() => setOpen(false)}><X size={18} /></button>
          </div>
          <div ref={viewRef} className="h-80 overflow-y-auto p-3 space-y-2 bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center mt-8">How can we help today?</p>
            )}
            {messages.map((m, idx) => {
              const staffSide = m.from && m.from !== "client";
              return (
                <div
                  key={idx}
                  className={`max-w-[85%] text-sm px-3 py-2 rounded-2xl shadow-sm ${
                    staffSide
                      ? "bg-white border border-gray-200 text-gray-900"
                      : "bg-gray-100 border border-gray-200 text-gray-900 ml-auto"
                  }`}
                >
                  {m.text}
                </div>
              );
            })}
          </div>
          <form onSubmit={send} className="p-3 flex items-center gap-2 border-t border-gray-200">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button type="submit" className="p-2 rounded-xl bg-gray-900 text-white hover:bg-black">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
