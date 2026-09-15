const counts = new Map();
module.exports = (req, res, next) => { const ip = req.ip; const now = Date.now(); if(!counts.has(ip)) counts.set(ip, []); const t = counts.get(ip).filter(x => now-x < 60000); t.push(now); counts.set(ip, t); if(t.length > 60) return res.status(429).json({ message: 'Rate limit exceeded' }); next(); };
