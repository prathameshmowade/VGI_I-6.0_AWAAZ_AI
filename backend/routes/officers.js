const express = require('express');
const router = express.Router();
const { getOfficers, getContractors } = require('../controllers/officerController');
router.get('/', getOfficers);
router.get('/contractors', getContractors);
module.exports = router;
