import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Briefcase, Calendar, Wallet, CheckCircle2, AlertCircle, FileText, Send, Check, ShieldCheck } from 'lucide-react';
import { Pilot, Role } from '../types';
import { LifecycleTracker } from '../components/LifecycleTracker';

interface PilotDashboardProps {
  userRole: Role | null;
}

export const PilotDashboard: React.FC<PilotDashboardProps> = ({ userRole }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState(true);

  // Evidence Dialog States
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  // Scale Decision States
  const [decision, setDecision] = useState<'SCALE' | 'EXTEND_PILOT' | 'STOP'>('SCALE');
  const [reason, setReason] = useState(
    'Demonstrated 42.3% queue reduction matching the success parameters. System has validated database security audits. Recommend scaling to 20 additional districts.'
  );
  const [proposedScope, setProposedScope] = useState('20 Additional Districts across Haryana');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  useEffect(() => {
    fetchPilot();
  }, [id]);

  const fetchPilot = () => {
    setLoading(true);
    fetch(`/api/pilots/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPilot(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneId) return;
    setSubmittingEvidence(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/milestones/${selectedMilestoneId}/evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ evidenceUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit evidence');
      }
      setShowEvidenceModal(false);
      setEvidenceUrl('');
      fetchPilot();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleVerifyMilestone = async (milestoneId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/milestones/${milestoneId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      fetchPilot();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReleasePayment = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payments/${paymentId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Release failed');
      }
      fetchPilot();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDecision(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          pilotId: id,
          decision,
          reason,
          proposedScope: decision === 'SCALE' ? proposedScope : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish decision');
      }
      fetchPilot();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Sandbox pilot not found.
      </div>
    );
  }

  // Generate charts data
  const beforeTime = 5.2;
  const targetTime = 3.1;
  const currentKpi = pilot.kpis.find(k => k.name.includes('Waiting'));
  const currentTime = currentKpi ? parseFloat(currentKpi.current) : 5.2;

  const chartData = [
    { name: 'Before System', hours: beforeTime, fill: '#ef4444' },
    { name: 'Target Goal', hours: targetTime, fill: '#3b82f6' },
    { name: 'Current Measured', hours: currentTime, fill: '#10b981' },
  ];

  const getTrackerStage = (status: string): 'PILOT' | 'VALIDATION' | 'SCALE' => {
    if (status === 'VALIDATION') return 'VALIDATION';
    if (status === 'COMPLETED') return 'SCALE';
    return 'PILOT';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      {/* Tracker: shows PILOT stage or VALIDATION stage */}
      <LifecycleTracker currentStage={getTrackerStage(pilot.status)} />

      {/* Header Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-2.5">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-950 font-bold rounded text-[10px] uppercase tracking-wider border border-blue-100">
              Active Sandbox testing
            </span>
            <span className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Stage: {pilot.currentStage}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            {pilot.challenge.title}
          </h1>
          <p className="text-slate-500 text-sm mt-1 leading-normal">
            Deployed Startup:{' '}
            <strong className="text-slate-700 font-extrabold">{pilot.startup.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-semibold w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <Wallet className="w-5 h-5 text-blue-900" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Allocated Budget</span>
              <span className="text-slate-800 font-extrabold mt-0.5 block">₹{Number(pilot.budget).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <Calendar className="w-5 h-5 text-blue-900" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Sandbox Period</span>
              <span className="text-slate-800 font-extrabold mt-0.5 block">{pilot.challenge.pilotDuration} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Performance Analytics & Milestones) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Performance Dashboard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2.5 mb-6">
              Farmer Waiting-Time Performance Metrics
            </h3>

            <div className="grid md:grid-cols-3 gap-6 items-center">
              {/* Chart */}
              <div className="md:col-span-1 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="hours">
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Stats values */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Before System</span>
                  <span className="text-2xl font-black text-red-500 block mt-1">5.2 hours</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Average</span>
                  <span className="text-2xl font-black text-emerald-600 block mt-1">3.0 hours</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center col-span-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue Time Reduction</span>
                  <span className="text-3xl font-black text-blue-900 block mt-1">42.3%</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 mt-2 inline-block uppercase">
                    Target Goal Exceeded
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2.5 mb-6">
              Milestone Agreement & performance payouts
            </h3>

            <div className="space-y-6">
              {pilot.milestones.map((m, idx) => {
                const pendingPayment = m.payments.find(p => p.status === 'PENDING');
                
                return (
                  <div key={m.id} className="border-l-4 border-slate-200 pl-4 py-1 relative">
                    <div className="absolute -left-2 top-2 w-3.5 h-3.5 rounded-full border-2 border-white bg-slate-300" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1">
                          Milestone {idx + 1} — ₹{Number(m.amount).toLocaleString('en-IN')}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                          {m.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.description}</p>
                        
                        {m.evidenceUrl && (
                          <a
                            href={m.evidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-900 font-bold hover:underline flex items-center mt-2.5"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            View Verification Evidence
                          </a>
                        )}
                      </div>

                      {/* Status Badges & CTAs */}
                      <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                        <div className="flex space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            m.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : m.status === 'UNDER_REVIEW'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {m.status.replace(/_/g, ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            m.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.paymentStatus === 'PROCESSING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            Payment: {m.paymentStatus}
                          </span>
                        </div>

                        {/* Interactive Action buttons depending on user role and state */}
                        {userRole === 'STARTUP' && m.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              setSelectedMilestoneId(m.id);
                              setShowEvidenceModal(true);
                            }}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors mt-1"
                          >
                            Submit Evidence
                          </button>
                        )}

                        {(userRole === 'GOVERNMENT' || userRole === 'EXPERT') && m.status === 'UNDER_REVIEW' && (
                          <button
                            onClick={() => handleVerifyMilestone(m.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors mt-1"
                          >
                            Verify Milestone
                          </button>
                        )}

                        {userRole === 'ADMIN' && m.paymentStatus === 'PROCESSING' && pendingPayment && (
                          <button
                            onClick={() => handleReleasePayment(pendingPayment.id)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold rounded-lg text-xs shadow-sm transition-colors mt-1"
                          >
                            Release Payout
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Independent Validation & Scale Decision */}
        <div className="space-y-6">
          
          {/* Independent Validation Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center">
              <ShieldCheck className="w-4.5 h-4.5 mr-1.5 text-blue-900" />
              Independent Validation
            </h3>

            {pilot.validationReports.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-[11px] text-slate-400 leading-normal">
                  Independent expert audit in progress. Once evaluation results are compiled, validation status will update here.
                </p>
              </div>
            ) : (
              pilot.validationReports.map((report) => (
                <div key={report.id} className="space-y-3.5 text-xs">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Independent Audit Status</span>
                      <strong className="text-emerald-800 font-extrabold text-sm block mt-0.5">{report.outcome}</strong>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">System logs measured</span>
                    <p className="text-slate-700 font-semibold mt-1">{report.systemResult}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Auditor verified result</span>
                    <p className="text-slate-700 font-semibold mt-1">{report.independentResult}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Auditor observations</span>
                    <p className="text-slate-500 leading-relaxed font-normal mt-1">{report.observations}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    Audited by: <strong className="text-slate-600 font-semibold">{report.submittedBy.name}</strong>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Scale decision Choices card (only visible if pilot is in VALIDATION stage and user is GOVERNMENT or ADMIN) */}
          {(pilot.status === 'VALIDATION' || pilot.status === 'COMPLETED') && (userRole === 'GOVERNMENT' || userRole === 'ADMIN') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">
                Procurement Scaling Decision
              </h3>

              {pilot.scaleDecisions.length > 0 ? (
                /* Decision already registered */
                pilot.scaleDecisions.map((dec) => (
                  <div key={dec.id} className="space-y-4 text-xs">
                    <div className="p-3.5 bg-blue-900 text-white rounded-xl text-center">
                      <span className="block text-[8px] font-bold uppercase tracking-wider text-blue-200">Registered Action</span>
                      <strong className="text-lg font-black block mt-1 uppercase tracking-tight">{dec.decision}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Reasoning / Justification</span>
                      <p className="text-slate-600 leading-relaxed mt-1 font-normal">{dec.reason}</p>
                    </div>
                    {dec.proposedScope && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Target Scale Scope</span>
                        <p className="text-slate-700 font-semibold mt-1">{dec.proposedScope}</p>
                      </div>
                    )}
                    <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                      Decided by: <strong className="text-slate-600 font-semibold">{dec.decidedBy.name}</strong> on {new Date(dec.decidedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                /* Decision creation form */
                <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs text-slate-600">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                      Procurement Outcome choice
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['SCALE', 'EXTEND_PILOT', 'STOP'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDecision(opt)}
                          className={`py-2 rounded-xl text-center font-bold text-[10px] border transition-all ${
                            decision === opt
                              ? opt === 'SCALE'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : opt === 'EXTEND_PILOT'
                                ? 'bg-amber-500 border-amber-500 text-blue-950 shadow-sm'
                                : 'bg-red-600 border-red-600 text-white shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {opt.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {decision === 'SCALE' && (
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                        Scaling scope
                      </label>
                      <input
                        type="text"
                        required
                        value={proposedScope}
                        onChange={(e) => setProposedScope(e.target.value)}
                        placeholder="e.g. 20 additional districts"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Reason / Justification Comment
                    </label>
                    <textarea
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingDecision}
                    className="w-full py-2.5 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors shadow-sm"
                  >
                    {submittingDecision ? 'Submitting decision...' : 'Publish Scaling Decision'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Startup evidence upload modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-black text-slate-800 mb-2 flex items-center space-x-2">
              <Send className="w-5 h-5 text-blue-900" />
              <span>Submit Milestone Evidence</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter the link to the verification document or system logs for the panel evaluation.
            </p>

            <form onSubmit={handleSubmitEvidence} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                  Evidence Document URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /evidence/m3_report.pdf"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                />
              </div>

              <div className="flex justify-end items-center space-x-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvidence}
                  className="px-4 py-2 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors"
                >
                  {submittingEvidence ? 'Submitting...' : 'Upload Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
import { Cell } from 'recharts';
