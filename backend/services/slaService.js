const calculateSLA = (cat, urg) => urg === 'Critical' ? 24 : urg === 'High' ? 48 : 72;
module.exports = { calculateSLA };
