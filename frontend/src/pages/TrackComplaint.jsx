import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';

const DEMO_TICKETS = [
  { id: 'CMP-2026-001', title: 'Severe road pothole near ABC School', status: 'In Progress', location: 'Laxmi Nagar, Nagpur' },
  { id: 'CMP-2026-002', title: 'Major water pipe leakage on Dharampeth Main Road', status: 'Assigned', location: 'Dharampeth, Nagpur' },
  { id: 'CMP-2026-004', title: 'Broken streetlight junction box', status: 'Resolved', location: 'Sadar, Nagpur' }
];

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!complaintId) return alert('Please enter a Complaint Reference ID');
    navigate(`/complaint/${complaintId}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SHA-256 BLOCKCHAIN VERIFIED TRACKER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
          Track Your Complaint Status
        </h1>
        <p className="text-emerald-800 text-xs sm:text-sm max-w-lg mx-auto">
          Enter your reference tracking ID to view real-time AI triage, officer work orders & cryptographic blockchain proof.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-600 absolute left-4 top-3.5" />
          <input
            className="w-full bg-white border border-emerald-200 pl-11 pr-4 py-3 rounded-xl text-emerald-950 placeholder-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs shadow-xs"
            placeholder="Enter Tracking ID e.g. CMP-2026-001"
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn-emerald text-xs px-6 py-3 shrink-0"
        >
          <span>Track Status</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Tickets Quick Access */}
      <div className="pt-6 border-t border-emerald-100 space-y-4">
        <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block">
          Or select a sample complaint ticket to test tracking:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DEMO_TICKETS.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/complaint/${t.id}`)}
              className="bg-white p-4 rounded-xl border border-emerald-100 hover:border-emerald-400 text-left transition space-y-2 shadow-xs hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {t.id}
                </span>
                <span className="bg-emerald-50 text-emerald-900 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                  {t.status}
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-950 line-clamp-2">{t.title}</p>
              <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>{t.location}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
