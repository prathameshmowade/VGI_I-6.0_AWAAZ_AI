import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Trophy, AlertTriangle, ArrowUpDown, HardHat } from 'lucide-react';
import ContractorProfileModal from './ContractorProfileModal';

export default function ContractorComparison({ wardId = null }) {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('performanceScore');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedContractor, setSelectedContractor] = useState(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const url = wardId ? `/api/civic/contractors/compare?ward=${wardId}` : '/api/civic/contractors/compare';
        const res = await axios.get(url);
        if (res.data && res.data.success) {
          setContractors(res.data.data);
        }
      } catch (err) {
        // Fallback demo data
        setContractors([
          { contractorId: 'CON-001', name: 'Apex Infrastructure Pvt Ltd', assignedWards: ['12', '7'], activeWorks: 26, slaCompliance: 92, overdue: 5, performanceScore: 87, performanceBadge: '🏆 Good' },
          { contractorId: 'CON-006', name: 'Vidarbha Roads & Bridges Corp', assignedWards: ['5', '6'], activeWorks: 38, slaCompliance: 78, overdue: 10, performanceScore: 74, performanceBadge: '⚠️ Needs Improvement' },
          { contractorId: 'CON-004', name: 'BrightGrid Electrical Solutions', assignedWards: ['12', '7'], activeWorks: 12, slaCompliance: 96, overdue: 3, performanceScore: 93, performanceBadge: '🏆 Good' },
          { contractorId: 'CON-002', name: 'Jal Hydro Engineering Services', assignedWards: ['12'], activeWorks: 14, slaCompliance: 95, overdue: 3, performanceScore: 91, performanceBadge: '🏆 Good' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [wardId]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...contractors].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const SortHeader = ({ label, field }) => (
    <th
      className="text-left py-3 px-3 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortKey === field ? 'text-indigo-600' : 'opacity-40'}`} />
      </span>
    </th>
  );

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Contractor Performance Comparison</h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{wardId ? `Ward ${wardId}` : 'All Wards'} • {contractors.length} Contractors</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading contractor data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <SortHeader label="Contractor" field="name" />
                  <SortHeader label="Area" field="assignedWards" />
                  <SortHeader label="Active Works" field="activeWorks" />
                  <SortHeader label="SLA Compliance" field="slaCompliance" />
                  <SortHeader label="Overdue" field="overdue" />
                  <SortHeader label="Score" field="performanceScore" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sorted.map(c => (
                  <tr
                    key={c.contractorId}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => setSelectedContractor(c.contractorId)}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.assignedWards || []).map(w => (
                          <span key={w} className="text-[9px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-200 dark:border-blue-800">
                            W{w}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white text-center">{c.activeWorks}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.slaCompliance >= 90 ? 'bg-emerald-500' : c.slaCompliance >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${c.slaCompliance}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{c.slaCompliance}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold ${c.overdue > 5 ? 'text-rose-600' : c.overdue > 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {c.overdue}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-black text-xs px-2.5 py-1 rounded-lg border ${
                        c.performanceScore >= 85
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : c.performanceScore >= 70
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}>
                        {c.performanceScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedContractor && (
        <ContractorProfileModal contractorId={selectedContractor} onClose={() => setSelectedContractor(null)} />
      )}
    </>
  );
}
