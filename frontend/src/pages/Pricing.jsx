import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Truck, CreditCard, Phone } from "lucide-react";

export default function Pricing() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [distance, setDistance] = useState(null);
  const [price, setPrice] = useState(null);
  const handleCalculate = () => {
    const cleanPickup = pickup.trim();
    const cleanDropoff = dropoff.trim();
    if (!cleanPickup || !cleanDropoff) {
      alert("Please enter both pickup and dropoff locations.");
      return;
    }
    if (cleanPickup.length < 4 || cleanDropoff.length < 4) {
      alert("Please enter valid pickup and dropoff addresses.");
      return;
    }
    if (cleanPickup.toLowerCase() === cleanDropoff.toLowerCase()) {
      alert("Pickup and dropoff addresses must be different.");
      return;
    }

    const simulatedDistance = Math.floor(Math.random() * 195 + 5);
    setDistance(simulatedDistance);

    const cost = (simulatedDistance * 1.2 + 5).toFixed(2);
    setPrice(cost);
  };

  return (
    <div className="bg-[#0B0D10] text-[#F5F3EE] min-h-screen fade-in">
      {/* HERO */}
      <section className="bg-white/5 border border-white/10 border-b border-white/15 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-[#D4AF37] drop-shadow-sm">
          Pricing & Instant Quote
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-gray-300 text-lg">
          Get a real-time estimate for your delivery in seconds — transparent,
          simple, and reliable.
        </p>
      </section>

      {/* FORM SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-[#D4AF37] mb-6 text-center">
            Get Your Quote
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-300 mb-2">Pickup Address</label>
              <input
                type="text"
                placeholder="e.g. 12 High St, Northampton"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Dropoff Address</label>
              <input
                type="text"
                placeholder="e.g. 45 Bridge Rd, London"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleCalculate}
              className="px-12 py-3 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-semibold shadow-[0_14px_32px_rgba(225,29,72,0.35)] hover:shadow-[0_18px_44px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-white/30"
            >
              Get Estimate
            </button>
          </div>

          {price && (
            <div className="mt-10 text-center">
              <div className="inline-block bg-white/10 border border-white/15 rounded-2xl px-8 py-6">
                <div className="flex justify-center gap-3 items-center mb-3 text-[#D4AF37]">
                  <Truck className="w-6 h-6" />
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Estimated Distance</h3>
                <p className="text-[#B9B3A8] mb-3">{distance} km</p>
                <h3 className="text-xl font-semibold mb-2">Estimated Price</h3>
                <p className="text-3xl font-bold text-[#D4AF37]">£{price}</p>
              </div>
              <div className="mt-4 text-sm text-[#B9B3A8]">
                Want to book a delivery?{" "}
                <Link to="/contact" className="text-[#F5F3EE] font-semibold hover:underline">
                  Contact us
                </Link>{" "}
                or{" "}
                <Link to="/login" className="text-[#F5F3EE] font-semibold hover:underline">
                  login
                </Link>{" "}
                to get started.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 grid md:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="text-2xl font-semibold text-[#D4AF37] mb-2">European coverage</h2>
            <p className="text-[#E3DED5] mb-3">
              Our driver network covers the UK and mainland Europe. Main dispatch hub:
            </p>
            <p className="flex items-center gap-2 text-[#E3DED5] mb-2">
              <MapPin className="text-[#D4AF37]" /> Artisans' House, 7 Queensbridge, Northampton, Northamptonshire, United Kingdom, NN4 7BF
            </p>
            <p className="flex items-center gap-2 text-[#E3DED5]">
              <Phone className="text-[#D4AF37]" /> +44 7555 123 456
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/15 shadow-sm">
            <iframe
              title="UK & Europe coverage map"
              src="https://www.google.com/maps?q=Europe&z=4&output=embed"
              className="w-full h-80"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      {/* Footer handled by PublicLayout */}
    </div>
  );
}


