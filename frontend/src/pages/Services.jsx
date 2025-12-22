import { Truck, Package, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      title: "House & Furniture Moves",
      description:
        "From single-room moves to full home relocations - we ensure your belongings arrive safely and on time.",
      icon: <Truck className="w-10 h-10 text-[#D4AF37]" />,
    },
    {
      title: "Parcel & Courier Delivery",
      description:
        "Send parcels across town or nationwide. Real-time tracking and proof of delivery included.",
      icon: <Package className="w-10 h-10 text-[#D4AF37]" />,
    },
    {
      title: "Express & Same-Day Transport",
      description:
        "When every minute counts, our express couriers ensure urgent deliveries reach their destination fast.",
      icon: <Clock className="w-10 h-10 text-[#D4AF37]" />,
    },
    {
      title: "Commercial & Freight Logistics",
      description:
        "Reliable logistics solutions for businesses - scheduled routes, warehousing, and heavy transport.",
      icon: <MapPin className="w-10 h-10 text-[#D4AF37]" />,
    },
  ];

  return (
    <div className="bg-[#0B0D10] text-[#F5F3EE] min-h-screen fade-in">
      {/* HERO */}
      <section className="bg-white/5 border border-white/10 border-b border-white/15 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-[#D4AF37] drop-shadow-sm">
          Our Services
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-[#E3DED5] text-lg">
          From local moves to nationwide logistics - WMC TRANSPORT LTD covers
          all your transport needs with speed and reliability.
        </p>
      </section>

      {/* SERVICES GRID */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {services.map((s, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-lg hover:border-yellow-400 hover:shadow-yellow-500/20 transition-all duration-300"
          >
            <div className="flex justify-center mb-4">{s.icon}</div>
            <h3 className="text-xl font-semibold text-[#D4AF37] mb-3">
              {s.title}
            </h3>
            <p className="text-[#E3DED5] text-sm leading-relaxed">
              {s.description}
            </p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-red-800 to-red-600 rounded-2xl px-8 py-8 md:px-12 md:py-10 shadow-xl flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white drop-shadow-md">Need a tailored quote?</h3>
            <p className="text-white text-sm md:text-base leading-relaxed drop-shadow">
              Tell us what you need moved, when, and where. We will build a simple plan with transparent pricing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/contact")}
              className="px-5 py-2 bg-white/5 text-[#D4AF37] font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Talk to our team
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="px-5 py-2 border border-white/70 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              View pricing
            </button>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-semibold text-[#D4AF37] mb-4 text-center">
          Operating Across the UK
        </h2>
        <div className="rounded-2xl overflow-hidden border border-white/15 shadow-lg">
          <iframe
            title="UK service area"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6217115.567046268!2d-7.384531553518621!3d54.16405842486998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d0b0d3a2d3fcd5%3A0xd9bdb1c331b9f67!2sUnited%20Kingdom!5e0!3m2!1sen!2suk!4v1730211956795!5m2!1sen!2suk"
            className="w-full h-80"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* FOOTER */}
      {/* Footer handled by PublicLayout */}
    </div>
  );
}


