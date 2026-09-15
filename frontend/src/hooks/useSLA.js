import { useState, useEffect } from 'react';
export function useSLA(initial = 48) { const [hours, setHours] = useState(initial); useEffect(() => { const t = setInterval(() => setHours(h => Math.max(0, h-0.1)), 60000); return () => clearInterval(t); }, []); return Math.round(hours); }
