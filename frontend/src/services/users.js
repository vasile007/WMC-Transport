import { api } from "./api.js";

export const users = {
  // 🔹 List users (admin only) — poate filtra după rol
  async list(token, role) {
    const query = role ? `?role=${role}` : "";
    return api(`/users${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 🔹 List only drivers (for AdminDashboard dropdown)
  async listDrivers(token) {
    return api(`/users/drivers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Update email for the current user (requires backend support)
  async updateEmail(token, body) {
    return api(`/users/email`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  },

  // Change password for the current user (requires backend support)
  async changePassword(token, body) {
    return api(`/change-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  },

  // Update profile details for the current user
  async updateProfile(token, body) {
    return api(`/users/profile`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  },

  // Admin: create a user (driver/admin)
  async create(token, body) {
    return api(`/auth/admin/create-user`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  },

  // Admin: delete a user
  async remove(token, id) {
    return api(`/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Admin: reset password for a user
  async resetPassword(token, id, password) {
    return api(`/users/${id}/password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
  },
};
