import { api } from "./api";

export const payments = {
  async create(token, body) {
    return api("/payments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
  },
  async confirmStripe(token, body) {
    return api("/payments/confirm/stripe", {
      method: "POST",
      body: JSON.stringify(body),
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
  },
};

