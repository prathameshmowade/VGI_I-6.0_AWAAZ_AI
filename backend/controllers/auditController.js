const getAuditChain = (req, res) => res.json({ success: true, data: [{ blockIndex: 1, action: 'COMPLAINT_CREATED', hash: '8f9a2b3c...' }] });
module.exports = { getAuditChain };
