import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import HelpChatFull from "../components/HelpChatFull.jsx";
import { useAuth } from "../services/authContext.jsx";
import { useState } from "react";

export default function Contact() {
  const { user } = useAuth();
  const loggedIn = !!user?.token;
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="bg-[#0B0D10] text-[#F5F3EE] min-h-screen fade-in">
      {/* HERO */}
      <section className="bg-white/5 border border-white/10 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-[#D4AF37] drop-shadow-sm">
          Contact Us
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-[#B9B3A8] text-lg">
          Got a question or partnership idea? Drop us a message - we'd love to hear from you.
        </p>
      </section>

      {/* CONTACT + SUPPORT */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-[#D4AF37] mb-4">Get in touch</h2>
            <p className="text-[#E3DED5] mb-6">
              Reach us directly by email or phone. We respond quickly during business hours.
            </p>
            <p className="flex items-center gap-2 text-[#E3DED5] mb-2">
              <MapPin className="text-[#D4AF37]" /> Artisans' House, 7 Queensbridge, Northampton, Northamptonshire, United Kingdom, NN4 7BF
            </p>
            <p className="flex items-center gap-2 text-[#E3DED5] mb-2">
              <Phone className="text-[#D4AF37]" /> +44 7555 123 456
            </p>
            <a
              href="mailto:wmctransport6@gmail.com"
              className="flex items-center gap-2 text-[#D4AF37] font-semibold hover:underline"
            >
              <Mail className="text-[#D4AF37]" /> wmctransport6@gmail.com
            </a>
          </div>

          <div id="support-chat" className="relative overflow-hidden bg-gradient-to-br from-white/8 to-white/3 border border-white/10 rounded-2xl p-8 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={20} className="text-[#D4AF37]" />
              <h3 className="text-xl font-semibold text-[#F5F3EE]">Need help?</h3>
            </div>
            <p className="text-sm text-[#E3DED5] mb-4">
              Start a live chat with our team. We respond quickly during business hours.
            </p>
            {loggedIn ? (
              <>
                {!chatOpen && (
                  <button
                    onClick={() => setChatOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#D4AF37] text-[#0B0D10] text-sm font-semibold hover:bg-[#B98B2D]"
                  >
                    <MessageCircle size={16} />
                    Open chat
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-[#E3DED5]">
                Please <Link to="/login" className="text-[#D4AF37] font-semibold hover:underline">sign in</Link> to start a live chat.
              </p>
            )}
            <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-white/10" />
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
          <iframe
            title="WMC TRANSPORT LTD Location"
            src="https://www.google.com/maps?q=Artisans%27%20House%2C%207%20Queensbridge%2C%20Northampton%2C%20Northamptonshire%2C%20United%20Kingdom%2C%20NN4%207BF&output=embed"
            className="w-full h-72 md:h-80"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* FOOTER */}
      {/* Footer handled by PublicLayout */}
      {loggedIn && chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md">
          <HelpChatFull size="sm" onClose={() => setChatOpen(false)} />
        </div>
      )}
    </div>
  );
}


