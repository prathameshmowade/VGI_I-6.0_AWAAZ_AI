const crypto = require('crypto');
const generateSHA256 = (data, prev='') => crypto.createHash('sha256').update(prev + JSON.stringify(data)).digest('hex');
module.exports = { generateSHA256 };
