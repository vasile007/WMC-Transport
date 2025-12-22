import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function DriverApply() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData({ ...formData, phone: digitsOnly });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      setStatus("Phone number must contain digits only.");
      return;
    }
    setStatus("Sending...");
emailjs
  .send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID, // ✅ folosește .env corect
    formData,
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  )
  .then(() => {
    setStatus("✅ Application sent successfully!");
    setFormData({
      name: "",
      email: "",
      phone: "",
      vehicle: "",
      message: "",
    });
  })
  .catch((error) => {
    console.error("EmailJS error:", error);
    setStatus("❌ Failed to send. Please try again.");
  });
  }

  return (
    <div className="bg-[#0B0D10] text-[#F5F3EE] min-h-screen fade-in">
      <section className="py-16 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-[#D4AF37] text-center mb-4">
          Driver Application Form
        </h1>
        <p className="text-center text-gray-300 mb-10">
          Fill in your details below and our recruitment team will contact you
          soon.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 space-y-5"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          />
          <input
            type="text"
            name="vehicle"
            placeholder="Vehicle Type (Van, Truck, Bike...)"
            value={formData.vehicle}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          />
          <textarea
            name="message"
            placeholder="Tell us about your experience..."
            value={formData.message}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          ></textarea>

          <button
            type="submit"
            className="w-full py-3 bg-[#D4AF37] text-[#F5F3EE] font-semibold rounded-full shadow-md hover:bg-[#B98B2D] hover:scale-105 transition-all duration-300"
          >
            🚛 Submit Application
          </button>

          {status && (
            <p className="text-center text-sm mt-3 text-gray-300">{status}</p>
          )}
        </form>
      </section>
    </div>
  );
}


