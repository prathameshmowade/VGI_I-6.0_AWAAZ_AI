const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { loadComplaints: loadDatabase } = require('../utils/databaseStore');

/**
 * GET /api/notifications
 * Retrieve notifications for citizen (or all if not filtered)
 */
router.get('/', (req, res) => {
  try {
    const { citizenId, citizenEmail, citizenPhone } = req.query;
    const notifications = notificationService.getNotifications({
      citizenId,
      citizenEmail,
      citizenPhone
    });
    return res.json({ success: true, data: notifications, count: notifications.length });
  } catch (err) {
    console.error('[API:Notifications] Error getting notifications:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const updated = notificationService.markAsRead(id);
    return res.json({ success: true, updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for a citizen as read
 */
router.patch('/read-all', (req, res) => {
  try {
    const { citizenId, citizenEmail } = req.body;
    notificationService.markAllAsRead({ citizenId, citizenEmail });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/notifications/test-resolve
 * Trigger a resolution notification for a given complaint ID (or a demo ticket)
 */
router.post('/test-resolve', async (req, res) => {
  try {
    const { complaintId, actorName, resolutionProof, resolutionNotes } = req.body;
    const store = loadDatabase();
    let comp = store.find((c) => (c.complaintId || c._id) === complaintId);

    if (!comp) {
      // Pick first available complaint or create a synthetic one
      comp = store[0] || {
        complaintId: complaintId || 'CMP-2026-004',
        title: 'Broken streetlight junction box',
        category: 'Electrical',
        location: 'Sadar, Nagpur',
        status: 'Resolved',
        evidencePhoto: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=700&auto=format&fit=crop&q=80',
        citizenName: 'Citizen'
      };
    }

    const notif = await notificationService.dispatchResolutionNotification(comp, {
      actorName: actorName || 'Municipal Inspector Rajesh Sharma',
      actorRole: 'officer',
      resolutionProof: resolutionProof || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
      resolutionNotes: resolutionNotes || 'Site inspected and repair certified complete with photographic proof.'
    });

    return res.status(201).json({ success: true, message: 'Resolution notification dispatched', data: notif });
  } catch (err) {
    console.error('[API:Notifications:Test] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
