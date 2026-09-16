import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import SLATimer from '../components/SLATimer';
import ResolutionCopilot from '../components/ResolutionCopilot';
import XAIPanel from '../components/XAIPanel';
import ResolutionProofModal from '../components/ResolutionProofModal';
import ContractorComparison from '../components/ContractorComparison';
import { ShieldCheck, LayoutDashboard, Clock, AlertCircle, Building2, Sparkles, HardHat } from 'lucide-react';

const DEPARTMENTS = [
  { id: 'ALL', label: 'All Departments (Municipal Overview)', code: 'ALL', category: 'ALL' },
  { id: 'DEPT_ROAD', label: 'Roads & Infrastructure', code: 'DEPT_ROAD', category: 'Road Damage' },
  { id: 'DEPT_WATER', label: 'Water Supply & Drainage', code: 'DEPT_WATER', category: 'Water Supply' },
  { id: 'DEPT_SANITATION', label: 'Sanitation & Waste Management', code: 'DEPT_SANITATION', category: 'Sanitation' },
  { id: 'DEPT_ELECTRICAL', label: 'Electrical & Streetlights', code: 'DEPT_ELECTRICAL', category: 'Electrical' },
  { id: 'DEPT_PARKS', label: 'Parks & Public Amenities', code: 'DEPT_PARKS', category: 'Parks' }
];

const FALLBACK_MOCK = [
  {
    complaintId: 'CMP-2026-001',
    title: 'Severe road pothole near ABC School causing traffic hazards',
    description: 'Deep pothole on main school road. Multiple vehicles damaged over the weekend.',
    category: 'Road Damage',
    department: 'Roads & Infrastructure Department',
    departmentCode: 'DEPT_ROAD',
    urgency: 'High Priority',
    status: 'In Progress',
    confidenceScore: 96,
    xaiData: {
      confidence: 96,
      reasoning: ['Matched road hazard keywords in Laxmi Nagar', 'School Zone Safety Priority Rule Applied'],
      rulesApplied: ['Emergency School Zone Priority Rule']
    }
  },
  {
    complaintId: 'CMP-2026-002',
    title: 'Major water pipe leakage on Dharampeth Main Road',
    description: 'Water gushing out of broken 12-inch mainline.',
    category: 'Water Supply',
    department: 'Water Supply & Drainage Dept',
    departmentCode: 'DEPT_WATER',
    urgency: 'Critical Priority',
    status: 'Assigned',
    confidenceScore: 94,
    xaiData: {
      confidence: 94,
      reasoning: ['Matched water leakage keywords in Dharampeth'],
      rulesApplied: ['Water Supply Mainline Escalation Rule']
    }
  },
  {
    complaintId: 'CMP-2026-003',
    title: 'Uncollected garbage accumulation near public park',
    description: 'Waste dump not cleared for 4 days.',
    category: 'Sanitation',
    department: 'Sanitation & Waste Management',
    departmentCode: 'DEPT_SANITATION',
    urgency: 'Medium Priority',
    status: 'New',
    confidenceScore: 91,
    xaiData: {
      confidence: 91,
      reasoning: ['Sanitation dump keywords matched'],
      rulesApplied: ['Park Cleanliness Rule']
    }
  }
];

export default function OfficerDashboard() {
  const { user } = useContext(AuthContext);

  // Auto-select department based on officer login context
  const getInitialDept = () => {
    if (user?.department) {
      const d = user.department.toLowerCase();
      if (d.includes('water')) return 'DEPT_WATER';
      if (d.includes('sanitation') || d.includes('waste')) return 'DEPT_SANITATION';
      if (d.includes('electric') || d.includes('light')) return 'DEPT_ELECTRICAL';
      if (d.includes('park')) return 'DEPT_PARKS';
      if (d.includes('road') || d.includes('infra')) return 'DEPT_ROAD';
    }
    return 'DEPT_ROAD';
  };

  const [selectedDept, setSelectedDept] = useState(getInitialDept);

  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem('civic_officer_complaints');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return FALLBACK_MOCK;
  });

  const [selected, setSelected] = useState(() => complaints[0] || FALLBACK_MOCK[0]);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);

  const saveComplaintsLocally = (newComplaints) => {
    setComplaints(newComplaints);
    try {
      localStorage.setItem('civic_officer_complaints', JSON.stringify(newComplaints));
    } catch (e) {}
  };

  const loadComplaints = async () => {
    let localSaved = [];
    try {
      const saved = localStorage.getItem('civic_officer_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) localSaved = parsed;
      }
    } catch (e) {}

    try {
      const res = await axios.get('/api/complaints');
      let serverData = [];
      if (Array.isArray(res.data)) {
        serverData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        serverData = res.data.data;
      }

      if (serverData.length > 0) {
        setComplaints((prevLocal) => {
          const baseList = prevLocal.length > 0 ? prevLocal : localSaved.length > 0 ? localSaved : FALLBACK_MOCK;
          const localMap = new Map(baseList.map((c) => [c.complaintId || c._id, c]));

          const merged = serverData.map((serverComp) => {
            const id = serverComp.complaintId || serverComp._id;
            const localComp = localMap.get(id);
            if (localComp && localComp.status === 'Pending Verification' && serverComp.status !== 'Verified & Resolved') {
              return { ...serverComp, ...localComp, status: 'Pending Verification' };
            }
            return localComp ? { ...serverComp, ...localComp } : serverComp;
          });

          // Ensure all local new complaints are retained at top
          baseList.forEach((lComp) => {
            const id = lComp.complaintId || lComp._id;
            if (!merged.find((m) => (m.complaintId || m._id) === id)) {
              merged.unshift(lComp);
            }
          });

          try {
            localStorage.setItem('civic_officer_complaints', JSON.stringify(merged));
          } catch (e) {}

          return merged;
        });
      } else if (localSaved.length > 0) {
        setComplaints(localSaved);
      }
    } catch (err) {
      if (localSaved.length > 0) {
        setComplaints(localSaved);
      }
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    if (newStatus === 'Resolved') {
      const target = complaints.find((c) => (c.complaintId || c._id) === complaintId);
      if (target) {
        setResolvingComplaint(target);
        return;
      }
    }

    try {
      await axios.patch(`/api/complaints/${complaintId}/status`, { status: newStatus });
    } catch (err) {}

    const updated = complaints.map((c) =>
      (c.complaintId || c._id) === complaintId ? { ...c, status: newStatus } : c
    );
    saveComplaintsLocally(updated);
  };

  const handleResolutionSubmit = async (resolutionPayload) => {
    const compId = resolutionPayload.complaintId;
    const backendStatus = resolutionPayload.status || 'Completed';

    // Ensure status is updated to Completed via API
    try {
      await axios.patch(`/api/complaints/${compId}/status`, {
        status: backendStatus,
        resolutionProof: resolutionPayload.resolutionProof || resolutionPayload.completionProof,
        resolutionNotes: resolutionPayload.resolutionNotes || resolutionPayload.completionNotes,
        actorName: user?.name || 'Municipal Officer',
        actorRole: 'officer'
      });
    } catch (err) {}

    // Update local state with backend data
    const updated = complaints.map((c) => {
      const id = c.complaintId || c._id;
      if (id === compId) {
        return {
          ...c,
          ...resolutionPayload,
          status: backendStatus,
          resolutionProof: resolutionPayload.resolutionProof || resolutionPayload.completion_proof,
          resolutionNotes: resolutionPayload.resolutionNotes || resolutionPayload.completion_notes
        };
      }
      return c;
    });

    saveComplaintsLocally(updated);
    setResolvingComplaint(null);
  };

  useEffect(() => {
    loadComplaints();
    const interval = setInterval(loadComplaints, 3000);

    const handleStorageChange = () => {
      const saved = localStorage.getItem('civic_officer_complaints');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setComplaints(parsed);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Filter complaints according to Department Dropdown
  const filteredComplaints = complaints.filter((c) => {
    if (selectedDept === 'ALL') return true;
    const targetDept = DEPARTMENTS.find((d) => d.id === selectedDept);
    if (!targetDept) return true;

    const dCode = c.departmentCode || '';
    const dName = c.department || '';
    const cat = c.category || '';

    return (
      dCode === targetDept.code ||
      dName.toLowerCase().includes(targetDept.category.toLowerCase()) ||
      cat.toLowerCase().includes(targetDept.category.toLowerCase()) ||
      (selectedDept === 'DEPT_ROAD' && (cat.includes('Road') || dName.includes('Road'))) ||
      (selectedDept === 'DEPT_WATER' && (cat.includes('Water') || dName.includes('Water') || cat.includes('Drain'))) ||
      (selectedDept === 'DEPT_SANITATION' && (cat.includes('Sanitation') || cat.includes('Garbage') || dName.includes('Sanitation'))) ||
      (selectedDept === 'DEPT_ELECTRICAL' && (cat.includes('Electrical') || cat.includes('Light') || dName.includes('Electrical'))) ||
      (selectedDept === 'DEPT_PARKS' && (cat.includes('Park') || dName.includes('Park')))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Officer Header Card with Vibrant Accent Theme */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>NAGPUR MUNICIPAL CORPORATION • ZONE 12 REDRESSAL GRID</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-xs">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span>Officer Triage & Work Order Dashboard</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm">
              Logged in as <strong className="text-slate-900 dark:text-white font-bold">{user?.name || 'Er. Rajesh Sharma'}</strong> ({user?.department || 'Superintending Engineer, Roads & Drainage'})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department Selection Dropdown */}
            <div className="flex items-center gap-2.5 bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 p-2 px-3.5 rounded-2xl shadow-2xs">
              <Building2 className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="block text-[9px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider leading-none">
                  Department Bifurcation:
                </span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-amber-950 dark:text-amber-100 text-xs font-black outline-none cursor-pointer pr-2 pt-0.5"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-2xl text-xs shrink-0 shadow-2xs">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-black text-blue-900 dark:text-blue-200">{filteredComplaints.length} Grievances in View</span>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Countdown Timer Bar */}
      <SLATimer targetTime={new Date(Date.now() + 18 * 3600 * 1000).toISOString()} />

      {/* Main 5-Stage Kanban Board */}
      <KanbanBoard
        complaints={filteredComplaints}
        onSelect={(c) => setSelected(c)}
        onStatusChange={handleStatusChange}
      />

      {/* Agentic Dispatch Copilot */}
      <ResolutionCopilot />

      {/* Contractor Performance Comparison */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
          <HardHat className="w-4 h-4 text-amber-600" />
          <span>Contractor Performance & Transparency</span>
        </div>
        <ContractorComparison />
      </div>

      {/* Selected Complaint Explainable AI View */}
      {selected && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Detailed AI Triage Rationale for Selected Ticket ({selected.complaintId || selected._id}):</span>
          </div>
          <XAIPanel xaiData={selected.xaiData} />
        </div>
      )}

      {/* Photo Proof Upload Modal */}
      {resolvingComplaint && (
        <ResolutionProofModal
          complaint={resolvingComplaint}
          onClose={() => setResolvingComplaint(null)}
          onSubmit={handleResolutionSubmit}
          onSubmitResolution={handleResolutionSubmit}
        />
      )}
    </div>
  );
}
