import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useEffect } from "react";
import HelpChat from "../components/HelpChat.jsx";
import { clearUnread } from "../services/chatUnread.js";

export default function ClientSupport() {
  useEffect(() => {
    clearUnread();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100">
      <section className="max-w-5xl mx-auto px-6 py-8">
        <nav className="text-sm text-gray-400 mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link className="hover:text-red-400" to="/client-dashboard">Dashboard</Link></li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-200">Support</li>
          </ol>
        </nav>
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-100">Support / Chat</h1>
              <p className="text-sm text-gray-400">Chat with support and get help</p>
            </div>
            <Link to="/client-dashboard" className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Back to Dashboard</Link>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-900/40" />
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 shadow-sm">
          <HelpChat defaultOpen />
        </div>
      </section>
    </main>
  );
}
