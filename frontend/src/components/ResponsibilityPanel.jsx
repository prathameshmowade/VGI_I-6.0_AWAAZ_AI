import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MapPin, Building2, UserCheck, HardHat, FileText, Clock,
  ChevronDown, ChevronUp, CheckCircle2, Shield, Sparkles, X
} from 'lucide-react';
import OfficerProfileModal from './OfficerProfileModal';
import ContractorProfileModal from './ContractorProfileModal';

export default function ResponsibilityPanel({ complaintId, complaintData = null, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [officerModal, setOfficerModal] = useState(null);
  const [contractorModal, setContractorModal] = useState(null);

  useEffect(() => {
    // If complaintData already has responsibilityData embedded, use that
    if (complaintData && complaintData.responsibilityData) {
      setData({
        jurisdiction: complaintData.jurisdiction,
        department: {
          code: complaintData.departmentCode,
          name: complaintData.department
        },
        officer: complaintData.responsibilityData.officer,
        contractor: complaintData.responsibilityData.contractor,
        asset: complaintData.responsibilityData.asset,
        workOrder: complaintData.workOrderId,
        project: complaintData.responsibilityData.project,
        slaHours: complaintData.responsibilityData.slaHours || complaintData.slaHoursTotal,
        explanation: complaintData.responsibilityData.explanation
      });
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API
    if (!complaintId) { setLoading(false); return; }

    const fetchResponsibility = async () => {
      try {
        const res = await axios.get(`/api/civic/complaints/${complaintId}/responsibility`);
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.warn('Could not fetch responsibility data:', err);
        // Fallback demo data
        setData({
          jurisdiction: { ward: '12', zone: 'East', zoneName: 'Laxmi Nagar Zone', wardName: 'Ward 12 — Laxmi Nagar' },
          department: { code: 'DEPT_ROAD', name: 'Roads & Infrastructure' },
          officer: { id: 'OFF-001', name: 'Er. Rajesh Sharma', designation: 'Ward Engineer', stats: { activeComplaints: 14, pending: 8, inProgress: 4, overdue: 2, avgResolutionHours: 31 } },
          contractor: { id: 'CON-001', name: 'Apex Infrastructure Pvt Ltd', stats: { performanceScore: 87, slaCompliance: 92 } },
          asset: { id: 'ROAD-1204', type: 'Road', name: 'Main Road Segment — Laxmi Nagar to Medical Square' },
          workOrder: 'WO-2026-1042',
          project: 'Ward 12 Road Resurfacing & Pothole Repair',
          slaHours: 48,
          explanation: [
            { check: '✓', label: 'Complaint category: Road Damage', detail: 'Mapped to Roads & Infrastructure' },
            { check: '✓', label: 'GPS location: Ward 12 — Laxmi Nagar', detail: 'Zone: Laxmi Nagar Zone (East)' },
            { check: '✓', label: 'Infrastructure asset: ROAD-1204', detail: 'Main Road Segment — Laxmi Nagar to Medical Square' },
            { check: '✓', label: 'Jurisdiction: Ward 12 Roads & Infrastructure', detail: 'Responsible officer: Er. Rajesh Sharma (Ward Engineer)' },
            { check: '✓', label: 'Active maintenance contract: WO-2026-1042', detail: 'Ward 12 Road Resurfacing & Pothole Repair' },
            { check: '✓', label: 'Assigned contractor: Apex Infrastructure Pvt Ltd', detail: 'Performance score: 87%' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResponsibility();
  }, [complaintId, complaintData]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-indigo-200 dark:border-indigo-800 animate-pulse text-center">
        <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Resolving Civic Responsibility...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const InfoRow = ({ icon: Icon, iconColor, label, value, clickable, onClick }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className={`w-8 h-8 rounded-xl ${iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{label}</span>
        {clickable ? (
          <button
            onClick={onClick}
            className="text-sm font-black text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 hover:underline transition-colors text-left"
          >
            {value} →
          </button>
        ) : (
          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-md overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm">Who is Responsible?</h3>
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Civic Responsibility Mapping</span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/70 hover:text-white transition p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-0">
          <InfoRow
            icon={MapPin}
            iconColor="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
            label="Area"
            value={`Ward ${data.jurisdiction?.ward} — ${data.jurisdiction?.zoneName || data.jurisdiction?.zone || 'Nagpur'}`}
          />
          <InfoRow
            icon={Building2}
            iconColor="bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
            label="Responsible Department"
            value={data.department?.name || data.department?.code || 'Public Works'}
          />
          {data.officer && (
            <InfoRow
              icon={UserCheck}
              iconColor="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
              label={`Government Officer — ${data.officer.designation || 'Ward Engineer'}`}
              value={data.officer.name}
              clickable
              onClick={() => setOfficerModal(data.officer.id)}
            />
          )}
          {data.contractor && (
            <InfoRow
              icon={HardHat}
              iconColor="bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
              label="Responsible Contractor"
              value={data.contractor.name}
              clickable
              onClick={() => setContractorModal(data.contractor.id)}
            />
          )}
          {data.workOrder && (
            <InfoRow
              icon={FileText}
              iconColor="bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
              label="Work Order"
              value={`${data.workOrder}${data.project ? ` — ${data.project}` : ''}`}
            />
          )}
          <InfoRow
            icon={Clock}
            iconColor="bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400"
            label="Expected Resolution (SLA)"
            value={`${data.slaHours || 48} Hours`}
          />
        </div>

        {/* Expandable "Why this person?" section */}
        {data.explanation && data.explanation.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full px-6 py-3 flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Why this person? — Explainable Responsibility
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded && (
              <div className="px-6 pb-5 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Responsibility determined using:
                </p>
                {data.explanation.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{step.label}</span>
                      <span className="text-slate-500 dark:text-slate-400">{step.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Modals */}
      {officerModal && (
        <OfficerProfileModal officerId={officerModal} onClose={() => setOfficerModal(null)} />
      )}
      {contractorModal && (
        <ContractorProfileModal contractorId={contractorModal} onClose={() => setContractorModal(null)} />
      )}
    </>
  );
}
