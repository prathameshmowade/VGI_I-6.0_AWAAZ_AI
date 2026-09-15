const jwt = require('jsonwebtoken');
const env = require('../config/env');
module.exports = (req, res, next) => { const h = req.headers.authorization; if(!h) return res.status(401).json({ message: 'No token' }); try { req.user = jwt.verify(h.split(' ')[1], env.JWT_SECRET); next(); } catch(e) { res.status(401).json({ message: 'Invalid token' }); } };
