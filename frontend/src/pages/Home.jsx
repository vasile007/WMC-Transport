import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, MapPin, ShieldCheck, Smartphone, Route, Star, Truck as TruckIcon, Calculator } from "lucide-react";
import { useAuth } from "../services/authContext.jsx";
import truckImage from "../assets/truck.jpg";
import JoinAsDriverSection from "../components/JoinAsDriverSection.jsx";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const hasThanks = sp.get("thanks") === "1";
      const seen = sessionStorage.getItem("qm_thanks_seen") === "1";
      if (hasThanks && !seen) {
        setShowThanks(true);
        sessionStorage.setItem("qm_thanks_seen", "1");
        // Clean the URL so refreshes don't re-trigger
        window.history.replaceState(null, "", window.location.pathname);
        // Auto-hide after 5 seconds
        const t = setTimeout(() => setShowThanks(false), 5000);
        return () => clearTimeout(t);
      }
    } catch {
      // Ignore URL/session access errors
    }
  }, []);

  function handleCreateOrder() {
    if (user) navigate(`/${user.role}-dashboard`);
    else navigate("/login");
  }

  const stats = [
    { label: "Deliveries Completed", value: "10k+", icon: Clock3 },
    { label: "Cities Covered", value: "42+", icon: MapPin },
    { label: "Trusted Drivers", value: "1,500+", icon: ShieldCheck },
  ];

  const steps = [
    { title: "Request", text: "Enter pickup and dropoff details and confirm your booking.", icon: Route },
    { title: "Track", text: "Follow your driver in real time with live ETA updates.", icon: Smartphone },
    { title: "Deliver", text: "On-time delivery with proof and instant confirmation.", icon: TruckIcon },
  ];

  const features = [
    { title: "Transparent Pricing", text: "Upfront prices with no surprises or hidden fees.", icon: Calculator },
    { title: "Nationwide Coverage", text: "From local drops to cross-country shipments, we've got it covered.", icon: MapPin },
    { title: "Dedicated Support", text: "In-app help chat and responsive support when you need it.", icon: ShieldCheck },
  ];

  const testimonials = [
    { quote: "Perfect experience. Quick pickup and on-time delivery.", name: "Alice M.", where: "London" },
    { quote: "Transparent pricing and great communication throughout.", name: "Tom R.", where: "Birmingham" },
    { quote: "Driver was professional and careful with my parcel.", name: "Sara P.", where: "Manchester" },
  ];

  return (
    <div className="fade-in bg-[#0B0D10] text-[#F5F3EE] min-h-screen">
      {showThanks && (
        <div className="bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-[#F5F3EE]">Thank you! Our support team will be in touch shortly.</div>
            <button
              onClick={() => {
                try {
                  sessionStorage.setItem("qm_thanks_seen", "1");
                } catch {}
                setShowThanks(false);
              }}
              className="text-[#D4AF37] text-sm hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-24 top-10 h-48 w-48 rounded-full bg-[#D4AF37]/20 blur-3xl" />
          <div className="absolute right-6 bottom-6 h-56 w-56 rounded-full bg-[#B98B2D]/20 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F1216]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-20 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-12 items-center min-h-[70vh]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 shadow-sm text-sm font-semibold text-[#D4AF37]">
              Reliable moves, every time
            </div>
            <h1
              className="mt-5 text-[clamp(2.4rem,4vw,4.6rem)] leading-tight tracking-tight font-semibold"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Send parcels and move goods with confidence
            </h1>
            <p className="mt-4 text-lg text-[#B9B3A8] max-w-xl">
              WMC TRANSPORT LTD provides fast, reliable delivery with live tracking, transparent pricing, and dedicated support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={handleCreateOrder}
                className="inline-flex items-center justify-center px-7 py-3 rounded-md bg-[#D4AF37] text-[#0B0D10] font-semibold shadow-md hover:bg-[#B98B2D] transition-colors gap-2"
              >
                Get Started <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="inline-flex items-center justify-center px-7 py-3 rounded-md border border-[#D4AF37]/60 text-[#F5F3EE] font-semibold bg-transparent hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
              >
                See Pricing
              </button>
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-[#B9B3A8]">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20" />
                <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20" />
                <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20" />
              </div>
              <span>Trusted by thousands of happy customers across the UK.</span>
            </div>
          </div>
          <div className="relative flex justify-center md:justify-end">
            <div className="absolute -top-10 -left-6 h-28 w-28 rounded-full bg-[#D4AF37]/20 blur-2xl" />
            <img
              src={truckImage}
              alt="Delivery van"
              className="w-[360px] md:w-[520px] rounded-2xl shadow-2xl object-cover border border-white/15"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-[#B98B2D]/20 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-[#D4AF37]">
                <stat.icon size={22} />
              </div>
              <div>
                <div className="text-3xl font-extrabold">{stat.value}</div>
                <div className="text-sm text-[#B9B3A8]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#F5F3EE]" style={{ fontFamily: "Playfair Display, serif" }}>
            How it works
          </h2>
          <p className="mt-3 text-[#B9B3A8] max-w-2xl mx-auto">
            Book in minutes, track every mile, and get transparent proof of delivery.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.title} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-white/10 text-[#D4AF37] flex items-center justify-center">
                <s.icon size={22} />
              </div>
              <h3 className="text-lg font-semibold mt-4 mb-1">{s.title}</h3>
              <p className="text-[#B9B3A8] text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Quote Card */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-white/10 text-[#D4AF37] flex items-center justify-center">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-tight">Get a quick quote</h3>
              <p className="text-sm text-[#B9B3A8]">Share the essentials and we will confirm your price fast.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input placeholder="Pickup address" className="h-12 px-4 rounded-md border border-white/10 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-[#F5F3EE] placeholder-[#B9B3A8]" />
            <input placeholder="Dropoff address" className="h-12 px-4 rounded-md border border-white/10 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-[#F5F3EE] placeholder-[#B9B3A8]" />
            <input placeholder="Parcel size / notes" className="h-12 px-4 rounded-md border border-white/10 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-[#F5F3EE] placeholder-[#B9B3A8]" />
            <button onClick={handleCreateOrder} className="h-12 rounded-md bg-[#D4AF37] text-[#0B0D10] font-semibold hover:bg-[#B98B2D] transition-colors">
              Get Quote
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            <div className="h-10 w-10 rounded-full bg-white/10 text-[#D4AF37] flex items-center justify-center mb-3">
              <f.icon size={18} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-[#B9B3A8] text-sm leading-relaxed">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Testimonials */}
      <section className="bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-[#F5F3EE] text-center" style={{ fontFamily: "Playfair Display, serif" }}>
            What our customers say
          </h2>
          <p className="text-center text-[#B9B3A8] mt-2">Consistent, careful, and communicative on every job.</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-1 text-[#D4AF37] mb-3" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" className="text-[#D4AF37]" />
                  ))}
                </div>
                <span className="sr-only">Rated 5 out of 5</span>
                <p className="text-[#E3DED5] leading-relaxed">"{t.quote}"</p>
                <div className="mt-3 text-sm text-[#B9B3A8]">{t.name} - {t.where}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <JoinAsDriverSection />
      </section>

      {/* Footer handled by PublicLayout */}
    </div>
  );
}
