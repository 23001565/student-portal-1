import { http } from './http.js';

/**
 * Get all announcements (authenticated users)
 */
export function listAnnouncements() {
  return http('/announcements');
}

/**
 * Create a new announcement (admin only)
 * @param {{ title: string, content: string }} payload
 */
export function createAnnouncement(payload) {
  return http('/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a specific announcement by ID (admin only)
 * @param {number} id
 */
export function deleteAnnouncement(id) {
  return http(`/admin/announcements/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Delete all announcements (admin only)
 */
export function deleteAllAnnouncements() {
  return http('/admin/announcements', {
    method: 'DELETE',
  });
}
