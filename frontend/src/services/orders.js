import { api } from "./api";

export const orders = {
  async list(token) {
    const rows = await api("/orders", {
      headers: authHeader(token),
    });
    return rows.map(fromDb);
  },

  async create(token, body) {
    const res = await api("/orders", {
      method: "POST",
      body: JSON.stringify(body),
      headers: authHeader(token),
    });
    return fromDb(res);
  },

  async update(token, id, body) {
    const res = await api(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: authHeader(token),
    });
    return fromDb(res);
  },

  async remove(token, id) {
    return api(`/orders/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },
};

function authHeader(token) {
  const fallback = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?.token;
    } catch {
      return null;
    }
  })();
  const val = token || fallback;
  return val ? { Authorization: `Bearer ${val}` } : undefined;
}

function fromDb(o) {
  if (!o) return o;

  return {
    id: o.id,
    referenceNumber: o.referenceNumber,
    status: o.status,
    pickupAddress: o.pickupAddress,
    dropoffAddress: o.dropoffAddress,
    pickupLat: o.pickupLat,
    pickupLng: o.pickupLng,
    dropoffLat: o.dropoffLat,
    dropoffLng: o.dropoffLng,
    price: o.price,
    paymentStatus: o.paymentStatus,
    userId: o.userId,
    driverId: o.driverId,
    client: o.client,
    driver: o.driver,
    description: o.description,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}
