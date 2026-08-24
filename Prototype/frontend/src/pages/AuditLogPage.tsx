import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, Search, RefreshCw } from 'lucide-react';
import { AuditLog } from '../types';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load audit logs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATED') || action.includes('PUBLISHED')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (action.includes('SUBMITTED') || action.includes('APPLIED')) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (action.includes('VERIFIED') || action.includes('APPROVED')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (action.includes('SCALE_DECISION') || action.includes('SCALE')) return 'bg-purple-50 text-purple-700 border-purple-100';
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.performedBy?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2.5">
            <Shield className="w-8 h-8 text-blue-900 fill-blue-900/10" />
            <span>Immutable Platform Audit Trail</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Verifiable transaction log tracking all actions taken by startups, evaluators, and procurement officers.
          </p>
        </div>
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
            />
          </div>
          <button
            onClick={fetchLogs}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            No audit logs found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Event Action</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(log.createdAt).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-normal text-slate-800 leading-normal max-w-sm">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.performedBy ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                            {log.performedBy.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 leading-tight">{log.performedBy.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{log.performedBy.role} ({log.performedBy.email})</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Auto Engine</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
