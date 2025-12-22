import { calculateQuote } from "../services/pricingService.js";

export async function getQuote(req, res) {
  try {
    const {
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      serviceType,
    } = req.body;
    if (!pickupAddress || !dropoffAddress) {
      return res.status(400).json({ error: "Both addresses are required" });
    }

    const quote = await calculateQuote({
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      serviceType,
    });

    res.json(quote);
  } catch (err) {
    console.error("ƒ?O Quote error:", err.message);
    res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
