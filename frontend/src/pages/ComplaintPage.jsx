import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import TrackingTimeline from '../components/TrackingTimeline';
import XAIPanel from '../components/XAIPanel';
import BlockchainAudit from '../components/BlockchainAudit';
import CitizenVerificationPanel from '../components/CitizenVerificationPanel';
import ResponsibilityPanel from '../components/ResponsibilityPanel';
import { ArrowLeft, ShieldCheck, ThumbsUp, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

const SAMPLE_DETAIL = {
  complaintId: 'CMP-2026-001',
  title: 'Severe road pothole near ABC School causing accidents',
  description: 'Deep pothole on main school road. Multiple vehicles damaged over the weekend. Immediate resurfacing required.',
  category: 'Road Damage',
  urgency: 'High Priority',
  status: 'Pending Verification',
  location: 'Vijay Nagar, Indore',
  department: 'Roads & Infrastructure Department',
  assignedOfficer: 'Er. Rajesh Sharma',
  upvotes: 24,
  confidenceScore: 96,
  createdAt: '2026-08-07 10:14 AM',
  estimatedCompletion: '2026-08-08 04:00 PM',
  blockchainHash: '054d3ce7fe530088f41e6d31bfb79da20f8cf3eec68366e03bc1887584d47ac3',
  resolutionProof: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
  resolutionNotes: 'Hot-mix asphalt patch laid & leveled, site cleared and tested.',
  verifications: [
    { citizenName: 'Vikram Deshmukh', comment: 'Drove past ABC school this morning, pothole is filled!', verifiedAt: new Date().toISOString() },
    { citizenName: 'Sneha Kulkarni', comment: 'Surface is smooth and safe for school buses now.', verifiedAt: new Date().toISOString() }
  ],
  verificationsCount: 2,
  requiredVerifications: 3,
  xaiData: {
    confidence: 96,
    reasoning: [
      'Matched road hazard keywords: "pothole", "accident", "school zone"',
      'Mapped to Vijay Nagar Zone Jurisdiction',
      'Historical precedence: 4 similar pothole repairs completed in Vijay Nagar'
    ],
    rulesApplied: ['School & Hospital Safety Zone Priority Rule (SLA 24h)'],
    similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
  }
};

export default function ComplaintPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState({ ...SAMPLE_DETAIL, complaintId: id || SAMPLE_DETAIL.complaintId });
  const [upvotes, setUpvotes] = useState(complaint.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showResponsibility, setShowResponsibility] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/complaints/${id}`)
      .then((res) => {
        if (res.data?.data) {
          setComplaint(res.data.data);
          setUpvotes(res.data.data.upvotes || 0);
        }
      })
      .catch((err) => {
        console.warn('Could not load complaint from server, using sample fallback:', err);
      });
  }, [id]);

  const handleEndorse = () => {
    if (!hasUpvoted) {
      setUpvotes((v) => v + 1);
      setHasUpvoted(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Navigation */}
      <div className="flex justify-between items-center">
        <Link to="/track" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grievance Search</span>
        </Link>
        <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SHA-256 Audit Active</span>
        </span>
      </div>

      {/* Main Complaint Detail Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-emerald-100 shadow-xs space-y-6">
        <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-emerald-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold bg-emerald-600 text-white px-3 py-1 rounded-lg shadow-xs">
                {complaint.complaintId}
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{complaint.urgency}</span>
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{complaint.status}</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 pt-1">{complaint.title}</h1>
          </div>

          <button
            onClick={handleEndorse}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${
              hasUpvoted
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{upvotes} {hasUpvoted ? 'Community Endorsed' : 'Endorse Issue'}</span>
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1">
            <span className="text-emerald-700 font-medium block">Category</span>
            <span className="font-bold text-emerald-950">{complaint.category}</span>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1">
            <span className="text-emerald-700 font-medium block">Reported Location</span>
            <span className="font-bold text-emerald-950 truncate block">{complaint.location}</span>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1">
            <span className="text-emerald-700 font-medium block">Assigned Officer</span>
            <span className="font-bold text-emerald-800">{complaint.assignedOfficer}</span>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1">
            <span className="text-emerald-700 font-medium block">Resolution ETA</span>
            <span className="font-bold text-emerald-950">{complaint.estimatedCompletion}</span>
          </div>
        </div>

        {/* Description Box */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1 text-xs">
          <span className="text-emerald-800 font-semibold block uppercase text-[11px]">Detailed Description:</span>
          <p className="text-emerald-950 leading-relaxed">{complaint.description}</p>
        </div>

        {/* 5-Step Visual Tracking Timeline */}
        <div className="pt-2">
          <span className="text-xs font-bold text-emerald-950 block mb-2">5-Step Live Tracking Status:</span>
          <TrackingTimeline currentStep={
            complaint.status === 'Completed' || complaint.status === 'Resolved' || complaint.status === 'Verified & Resolved' ? 4
            : complaint.status === 'Under Verification' || complaint.status === 'Pending Verification' ? 3
            : complaint.status === 'In Progress' || complaint.status === 'In-Progress' || complaint.status === 'Started' ? 2
            : complaint.status === 'Assigned' ? 1
            : 0
          } />
        </div>

        {/* Who is Responsible? Button */}
        <div className="pt-3 flex gap-3">
          <button
            onClick={() => setShowResponsibility(!showResponsibility)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
              showResponsibility
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{showResponsibility ? 'Hide Responsibility Details' : 'Who is Responsible?'}</span>
          </button>
        </div>
      </div>

      {/* Civic Responsibility Panel */}
      {showResponsibility && (
        <ResponsibilityPanel
          complaintId={complaint.complaintId}
          complaintData={complaint}
          onClose={() => setShowResponsibility(false)}
        />
      )}

      {/* Citizen Authenticity Verification Panel */}
      <CitizenVerificationPanel
        complaint={complaint}
        onVerificationUpdate={(updated) => setComplaint(updated)}
      />

      {/* Grid: XAI Panel + Blockchain Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <XAIPanel xaiData={complaint.xaiData} />
        <BlockchainAudit hash={complaint.blockchainHash} />
      </div>
    </div>
  );
}
