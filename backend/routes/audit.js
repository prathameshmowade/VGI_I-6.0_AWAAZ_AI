const express = require('express');
const router = express.Router();
const { getAuditChain } = require('../controllers/auditController');
router.get('/chain', getAuditChain);
module.exports = router;
