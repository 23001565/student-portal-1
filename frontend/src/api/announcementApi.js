import { http } from './http.js';

/**
 * Get all announcements (authenticated users)
 */
export function listAnnouncements() {
  return http('/api/announcements');
}

/**
 * Create a new announcement (admin only)
 * @param {{ title: string, content: string }} payload
 */
export function createAnnouncement(payload) {
  return http('/api/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a specific announcement by ID (admin only)
 * @param {number} id
 */
export function deleteAnnouncement(id) {
  return http(`/api/admin/announcements/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Delete all announcements (admin only)
 */
export function deleteAllAnnouncements() {
  return http('/api/admin/announcements', {
    method: 'DELETE',
  });
}
