const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/complaintController');

// Twin City verification feed (must be before /:id routes)
router.get('/twin-city/verifications', ctrl.getTwinCityVerifications);

// Core CRUD
router.get('/', ctrl.getComplaints);
router.get('/:id', ctrl.getComplaintById);
router.post('/', ctrl.createComplaint);
// High-Speed Asynchronous Decoupled Intake (<30ms, returns 202 Accepted)
router.post('/ingest', ctrl.ingestComplaintAsync);

// Status transitions
router.patch('/:id/status', ctrl.updateStatus);

// Officer completion with proof upload
router.post('/:id/complete', ctrl.completeComplaint);

// Citizen verification (VERIFIED / REJECTED vote)
router.post('/:id/verify', ctrl.verifyComplaint);

// Detailed verification status
router.get('/:id/verification-status', ctrl.getVerificationStatus);

module.exports = router;
