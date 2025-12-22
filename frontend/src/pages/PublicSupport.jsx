import { Link } from "react-router-dom";
import HelpChatFull from "../components/HelpChatFull.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../services/authContext.jsx";

export default function PublicSupport() {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const loggedIn = !!user?.token;
  return (
    <main className="bg-[#0B0D10] min-h-screen text-[#F5F3EE]">
      <section className="max-w-3xl mx-auto px-6 py-10">
        <nav className="text-sm text-[#B9B3A8] mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link className="hover:text-[#D4AF37]" to="/">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-[#E3DED5]">Support</li>
          </ol>
        </nav>
        <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-white p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shadow-sm">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-[#F5F3EE]">Customer Support</h1>
              <p className="text-sm text-[#B9B3A8]">Chat with our team for quick help</p>
            </div>
            <Link to="/" className="text-sm px-3 py-1.5 rounded-md border border-white/15 text-[#F5F3EE] hover:border-[#D4AF37] hover:text-[#D4AF37]">Back to Home</Link>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-100" />
        </div>

        <div className="bg-white/10 border border-white/10 rounded-2xl p-4 shadow-sm">
          {!loggedIn && (
            <div className="mb-4 text-sm text-[#E3DED5]">
              Please <Link to="/login" className="text-[#F5F3EE] hover:underline">sign in</Link> to start a live chat.
            </div>
          )}
          {loggedIn && open && <HelpChatFull onClose={() => navigate('/?thanks=1')} />}
          {loggedIn && !open && null}
          <div className="mt-3 text-[11px] text-[#B9B3A8]">
            For urgent issues, email <span className="font-medium">support@quikmove.com</span> or call +44 7555 123 456.
          </div>
        </div>
      </section>
    </main>
  );
}


