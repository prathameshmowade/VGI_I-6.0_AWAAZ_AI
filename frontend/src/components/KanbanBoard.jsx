import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import KanbanCard from './KanbanCard';
import { Users, Award } from 'lucide-react';

const COLS = ['New', 'Assigned', 'In Progress', 'Under Verification', 'Completed'];

const COL_NAMES_HI = {
  'New': 'नई शिकायतें',
  'Assigned': 'अधिकारी आवंटित',
  'In Progress': 'कार्य प्रगति पर',
  'Under Verification': 'सत्यापन जारी',
  'Completed': 'सत्यापित व पूर्ण'
};

const COL_STYLES = {
  'New': 'border-blue-200 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/30 dark:to-slate-900 dark:border-blue-900',
  'Assigned': 'border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-slate-900 dark:border-indigo-900',
  'In Progress': 'border-amber-200 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/30 dark:to-slate-900 dark:border-amber-900',
  'Under Verification': 'border-purple-200 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/30 dark:to-slate-900 dark:border-purple-900',
  'Completed': 'border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-slate-900 dark:border-emerald-900'
};


export default function KanbanBoard({ complaints = [], onSelect, onStatusChange }) {
  const { isHindi } = useContext(LanguageContext);

  return (
    <div className="space-y-6">
      {/* Top Differentiators Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Community Coalition */}
        <div className="bg-white dark:bg-emerald-950/70 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold block text-[11px]">
                {isHindi ? 'सामुदायिक समूह क्लस्टरिंग' : 'Community Coalition Clustering'}
              </span>
              <span className="text-emerald-950 dark:text-white font-bold">
                {isHindi ? '247 नागरिक प्रभावित • 12 रिपोर्ट स्वतः एकत्रित' : '247 Citizens Affected • 12 Reports Auto-Clustered'}
              </span>
            </div>
          </div>
          <span className="bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
            {isHindi ? 'याचिका सत्यापित 🔥' : 'Petition Verified 🔥'}
          </span>
        </div>

        {/* Citizen Trust Index */}
        <div className="bg-white dark:bg-emerald-950/70 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold block text-[11px]">
                {isHindi ? 'नागरिक विश्वास सूचकांक' : 'Citizen Trust Index Score'}
              </span>
              <span className="text-emerald-950 dark:text-white font-bold">
                {isHindi ? 'नागपुर सेंट्रल सड़क विभाग • 92 / 100 रेटिंग' : 'Nagpur Central Roads Dept • 92 / 100 Rating'}
              </span>
            </div>
          </div>
          <span className="bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
            {isHindi ? 'शीर्ष SLA अनुपालन ✓' : 'Top Tier SLA Compliance ✓'}
          </span>
        </div>
      </div>

      {/* Kanban Column Grid — Clean 5 Stages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {COLS.map((col) => {
          const colComplaints = complaints.filter((c) => {
            const status = (c.status || 'New').trim();
            const vStatus = c.verification_status || 'NONE';

            if (col === 'Completed') {
              return status === 'Completed' || status === 'Resolved' || status === 'Verified & Resolved' || vStatus === 'VERIFIED';
            }
            if (col === 'Under Verification') {
              return status === 'Under Verification' || status === 'Pending Verification';
            }
            if (col === 'In Progress') {
              return status === 'In Progress' || status === 'In-Progress' || status === 'Started';
            }
            if (col === 'Assigned') {
              return status === 'Assigned';
            }
            if (col === 'New') {
              const knownStatuses = ['Assigned', 'In Progress', 'In-Progress', 'Started', 'Under Verification', 'Pending Verification', 'Completed', 'Resolved', 'Verified & Resolved'];
              return status === 'New' || status === 'new' || status === 'Accepted' || status === 'Not Assigned' || !knownStatuses.includes(status);
            }
            return false;
          });

          const columnDisplayName = isHindi ? (COL_NAMES_HI[col] || col) : col;

          return (
            <div
              key={col}
              className={`p-4 rounded-2xl border ${COL_STYLES[col] || 'border-emerald-100 bg-white'} min-h-[340px] space-y-3 shadow-xs`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-900">
                <h3 className="font-extrabold text-emerald-950 dark:text-white text-xs uppercase tracking-wider">
                  {columnDisplayName}
                </h3>
                <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {colComplaints.length}
                </span>
              </div>
              <div className="space-y-3">
                {colComplaints.map((c) => (
                  <KanbanCard
                    key={c.complaintId || c._id}
                    complaint={c}
                    onSelect={() => onSelect?.(c)}
                    onStatusChange={(targetId, newStatus) => {
                      onStatusChange?.(targetId || c.complaintId || c._id, newStatus);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
