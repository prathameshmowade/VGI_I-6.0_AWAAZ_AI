import { useState, useEffect } from 'react';
export function useComplaints() { const [complaints, setComplaints] = useState([]); const [loading, setLoading] = useState(true); useEffect(() => { fetch('/api/complaints').then(r=>r.json()).then(d=>setComplaints(d.data||[])).catch(()=>setComplaints([])).finally(()=>setLoading(false)); }, []); return { complaints, loading }; }
