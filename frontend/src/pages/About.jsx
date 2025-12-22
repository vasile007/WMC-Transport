import { Truck, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="bg-[#0B0D10] text-[#F5F3EE] min-h-screen fade-in">
      {/* HERO */}
      <section className="bg-white/5 border border-white/10 border-b border-white/15 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-[#D4AF37] drop-shadow-sm">
          About WMC TRANSPORT LTD
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-[#B9B3A8] text-lg">
          Delivering trust, speed, and simplicity across every mile - because your shipment
          deserves more than just a ride.
        </p>
      </section>

      {/* MISSION */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#D4AF37] mb-4">Our Mission</h2>
          <p className="text-[#E3DED5] leading-relaxed mb-4">
            WMC TRANSPORT LTD was founded with one goal - to redefine logistics for the modern
            world. From personal deliveries to corporate freight, our platform connects customers
            with reliable, verified drivers to ensure every item arrives safely and on time.
          </p>
          <p className="text-[#E3DED5] leading-relaxed">
            We believe that logistics should be transparent, affordable, and accessible for
            everyone. With real-time tracking, secure payments, and professional drivers, WMC
            TRANSPORT LTD makes transport feel effortless.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative bg-gray-800 border border-white/15 p-8 rounded-2xl shadow-lg shadow-yellow-500/10 w-full md:w-4/5 text-gray-50">
            <Truck className="text-[#D4AF37] w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">What Drives Us</h3>
            <ul className="text-gray-200 space-y-2 list-disc list-inside">
              <li>Reliability and safety in every delivery</li>
              <li>Fast and transparent logistics</li>
              <li>Built on trust and professionalism</li>
              <li>Environmentally conscious transport</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white/5 border-t border-white/10 py-14">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold text-[#F5F3EE]">Want to reach us?</h3>
            <p className="text-[#E3DED5] mt-2">
              All phone, email, and location details now live on our contact page. You can also
              start a live chat with the team from there.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] text-white font-semibold shadow-sm hover:bg-[#B98B2D]"
          >
            <MessageCircle size={18} /> Go to Contact
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      {/* Footer handled by PublicLayout */}
    </div>
  );
}


