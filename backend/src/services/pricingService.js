import axios from "axios";
import { config } from "../config/config.js";

const pricingTable = {
  house_move: { base: 50, perMile: 2.5 },
  parcel: { base: 10, perMile: 1.2 },
  express: { base: 15, perMile: 1.8 },
  freight: { base: 80, perMile: 3.0 },
};

function buildLocation(address, lat, lng) {
  if (typeof lat === "number" && typeof lng === "number") {
    return `${lat},${lng}`;
  }
  return address;
}

/**
 * Calculate a price quote based on Google Distance Matrix data.
 */
export async function calculateQuote({
  pickupAddress,
  pickupLat,
  pickupLng,
  dropoffAddress,
  dropoffLat,
  dropoffLng,
  serviceType = "parcel",
}) {
   const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Missing Google Maps API key");

  const origins = buildLocation(pickupAddress, pickupLat, pickupLng);
  const destinations = buildLocation(dropoffAddress, dropoffLat, dropoffLng);

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origins
  )}&destinations=${encodeURIComponent(destinations)}&key=${apiKey}`;

  const { data } = await axios.get(url);
  const distanceInfo = data?.rows?.[0]?.elements?.[0];

  if (data.status !== "OK" || distanceInfo?.status !== "OK") {
    throw new Error("Failed to calculate distance");
  }

  const meters = distanceInfo.distance.value;
  const miles = meters / 1609.34;
  const roundedMiles = parseFloat(miles.toFixed(2));

  const { base, perMile } = pricingTable[serviceType] || pricingTable.parcel;
  const total = parseFloat((base + miles * perMile).toFixed(2));

  return {
    pickupAddress,
    dropoffAddress,
    serviceType,
    distanceMiles: roundedMiles,
    basePrice: base,
    pricePerMile: perMile,
    totalPrice: total,
    currency: (config.payments.currency || "gbp").toUpperCase(),
  };
}
