const crypto = require('crypto');
let latestHash = '0'.repeat(64);
const recordAuditEvent = (data) => { const prev = latestHash; latestHash = crypto.createHash('sha256').update(prev + JSON.stringify(data)).digest('hex'); return { previousHash: prev, hash: latestHash }; };
module.exports = { recordAuditEvent };
