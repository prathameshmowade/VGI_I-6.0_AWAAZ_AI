const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/civicResponsibilityController');

// Jurisdiction lookup
router.get('/jurisdiction', ctrl.getJurisdiction);

// Responsible officer / contractor queries
router.get('/officers/responsible', ctrl.getResponsibleOfficer);
router.get('/contractors/responsible', ctrl.getResponsibleContractor);
router.get('/contractors/compare', ctrl.getContractorsComparison);

// Profiles
router.get('/officers/:id/profile', ctrl.getOfficerProfileById);
router.get('/contractors/:id/profile', ctrl.getContractorProfileById);

// Complaint responsibility (one clean API)
router.get('/complaints/:id/responsibility', ctrl.getComplaintResponsibility);

module.exports = router;
