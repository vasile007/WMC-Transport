import { useNavigate } from "react-router-dom";
// Using a team-focused image to convey "join the team"

export default function JoinAsDriverSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-800/60 border-t border-gray-700 backdrop-blur-md py-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* TEXT SIDE */}
        <div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">
            Welcome to the Team
          </h2>
          <div className="text-yellow-300 text-sm mb-3">Join the WMC TRANSPORT LTD Driver Team</div>
          <p className="text-gray-300 leading-relaxed mb-8 text-lg">
            Drive with WMC TRANSPORT LTD and earn on your own schedule. We connect you
            with customers who need reliable, on-time transport. Start your
            journey as a trusted driver today.
          </p>
          <button
            onClick={() => navigate("/driver-apply")}
            className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-md hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
          >
            Apply Now
          </button>
        </div>

        {/* IMAGE SIDE */}
        <div className="flex justify-center md:justify-end">
          <img
            src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80"
            alt="Delivery driver loading boxes into a van"
            className="w-[420px] md:w-[480px] rounded-2xl shadow-[0_8px_32px_rgba(250,204,21,0.25)] object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
