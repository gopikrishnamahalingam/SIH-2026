import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, Users, FileText, Zap, Award, Sparkles } from 'lucide-react';

export const SystemAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setLoading(false);
      });
  }, []);

  const COLORS = ['#1e3a8a', '#d97706', '#059669', '#7c3aed', '#db2777', '#4b5563'];

  const getDecisionChartData = () => {
    if (!data?.decisionStats) return [];
    return [
      { name: 'Scaled Up', count: data.decisionStats.scale, fill: '#059669' },
      { name: 'Extended Testing', count: data.decisionStats.extend, fill: '#d97706' },
      { name: 'Stopped / Terminated', count: data.decisionStats.stop, fill: '#dc2626' },
    ];
  };

  const getSectorChartData = () => {
    if (!data?.sectorBreakdown || data.sectorBreakdown.length === 0) {
      return [{ name: 'Agriculture', value: 3 }];
    }
    return data.sectorBreakdown;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-8 h-8 text-blue-900" />
          <span>System-Wide Analytics</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time metrics tracking startup registrations, innovation challenges, and pilot sandboxing outcomes.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top statistics cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Challenges', value: data.totalChallenges, icon: FileText, bg: 'bg-blue-50 text-blue-900' },
              { label: 'Registered Startups', value: data.totalStartups, icon: Users, bg: 'bg-indigo-50 text-indigo-900' },
              { label: 'Submitted Apps', value: data.totalApplications, icon: Award, bg: 'bg-amber-50 text-amber-900' },
              { label: 'Sandbox Pilots', value: data.totalPilots, icon: Zap, bg: 'bg-emerald-50 text-emerald-900' },
              { label: 'Scale-up rate', value: `${data.scaleRate.toFixed(0)}%`, icon: Sparkles, bg: 'bg-purple-50 text-purple-900' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase">{stat.label}</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 block mt-1">{stat.value}</span>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className="w-5 h-5 stroke-[2]" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Sector distribution pie chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-sm mb-4">Startups by Technology Sector</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getSectorChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getSectorChartData().map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scale up decisions bar chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-sm mb-4">Pilot Sandbox Scale-up Outcomes</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getDecisionChartData()} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count">
                      {getDecisionChartData().map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
