import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Zap, AlertCircle, Wallet, Sparkles, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import { Challenge, Pilot, AuditLog } from '../types';

export const GovernmentDashboard: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const chalRes = await fetch('/api/challenges');
      const chalData = await chalRes.json();
      setChallenges(chalData);

      const pilotsRes = await fetch('/api/pilots');
      const pilotsData = await pilotsRes.json();
      setPilots(pilotsData);

      const logsRes = await fetch('/api/audit-logs');
      const logsData = await logsRes.json();
      setActivity(logsData.slice(0, 5)); // Show recent 5 actions
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Drafting Requirements';
      case 'PUBLISHED':
        return 'Startup Discovery';
      case 'CLOSED':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Government Procurement Hub</h1>
          <p className="text-slate-500 text-sm mt-1">
            Formulate challenges, run matching discovery, configure testing sandboxes, and authorize evidence-based scaling.
          </p>
        </div>
        <Link
          to="/challenges/create"
          className="px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          Formulate Challenge
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top statistics cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: 'Active Challenges', value: challenges.length, icon: FileText, color: 'text-blue-900 bg-blue-50 border-blue-100' },
              { label: 'Under Evaluation', value: 2, icon: Users, color: 'text-indigo-900 bg-indigo-50 border-indigo-100' }, // Seeded
              { label: 'Active Pilots', value: pilots.filter(p => p.status === 'ACTIVE' || p.status === 'VALIDATION').length, icon: Zap, color: 'text-emerald-900 bg-emerald-50 border-emerald-100' },
              { label: 'Pending Milestones', value: 1, icon: AlertCircle, color: 'text-amber-900 bg-amber-50 border-amber-100' }, // Seeded
              { label: 'Pending Payments', value: 1, icon: Wallet, color: 'text-red-900 bg-red-50 border-red-100' }, // Seeded
              { label: 'Scale-up Decisions', value: 1, icon: Sparkles, color: 'text-purple-900 bg-purple-50 border-purple-100' }, // Seeded
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{stat.label}</span>
                  <span className="text-2xl font-black text-slate-800 block mt-1">{stat.value}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side: Challenges & Pilots list */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Active Challenges Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4">
                  Active Challenges
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs text-slate-600">
                    <thead>
                      <tr className="text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Challenge</th>
                        <th className="pb-3 px-4">Department</th>
                        <th className="pb-3 px-4">Applications</th>
                        <th className="pb-3 px-4">Current Stage</th>
                        <th className="pb-3 pl-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {challenges.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="py-3.5 pr-4 font-bold text-slate-800 max-w-[180px] truncate">
                            {c.title}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-500 max-w-[150px] truncate">
                            {c.department.replace('Department of ', '')}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                            {c.applications?.length || 0} apps
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-950 border border-blue-100">
                              {getStageLabel(c.status)}
                            </span>
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            <Link
                              to={`/challenges/${c.id}`}
                              className="text-blue-950 font-bold hover:underline inline-flex items-center"
                            >
                              <span>Open</span>
                              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Sandbox Pilots */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4">
                  Pilot Performance Sandbox
                </h3>

                <div className="space-y-4">
                  {pilots.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No active pilots running.</p>
                  ) : (
                    pilots.map((p) => {
                      const queueKpi = p.kpis.find(k => k.name.includes('Waiting'));
                      const hasAchieved = queueKpi && queueKpi.status === 'ACHIEVED';
                      
                      return (
                        <div
                          key={p.id}
                          className="p-4 border border-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-inner transition-all"
                        >
                          <div>
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Mandi wait-time pilot
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-800 mt-1 block">
                              {p.startup.name} Sandbox
                            </h4>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{p.challenge.title}</span>
                          </div>

                          <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-center sm:text-right">
                              <span className="block text-[8px] font-bold text-slate-400 uppercase">Outcome Status</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block mt-1 ${
                                hasAchieved ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-900 border border-blue-100'
                              }`}>
                                {hasAchieved ? 'Target Achieved' : 'Testing Active'}
                              </span>
                            </div>

                            <Link
                              to={`/pilots/${p.id}`}
                              className="px-3.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                            >
                              Sandbox
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Recent Activity Feed */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 pb-2.5 border-b border-slate-100">
                  <Activity className="w-4.5 h-4.5 text-blue-950" />
                  <span>Audit Trail feed</span>
                </h3>

                <div className="divide-y divide-slate-100 space-y-3.5">
                  {activity.map((log) => (
                    <div key={log.id} className="pt-3.5 first:pt-0 text-[11px] leading-relaxed">
                      <p className="text-slate-700 font-normal">
                        <strong className="text-slate-800 font-extrabold">{log.performedBy?.name || 'System'}</strong>: {log.details}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/audit-logs"
                  className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-blue-950 font-bold border border-slate-200 rounded-xl transition-all text-xs block mt-4"
                >
                  View Full Audit Log
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
