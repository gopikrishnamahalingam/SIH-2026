import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FileText, Sparkles, Building, Calendar, Wallet, MapPin, Award, CheckCircle, Clock, ShieldAlert, AlertTriangle, ArrowLeft, Download, FileCheck, CheckCircle2 } from 'lucide-react';
import { Application, Role } from '../types';

interface ApplicationDetailsProps {
  userRole: Role | null;
}

export const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ userRole }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [forceOverride, setForceOverride] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    const confirmWithdraw = window.confirm('Are you sure you want to withdraw this application? This action is permanent and cannot be undone.');
    if (!confirmWithdraw) return;

    setWithdrawing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to withdraw application');
      }

      alert('Application withdrawn successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/applications/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch application');
      setApp(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, explanation })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status');
      setExplanation('');
      fetchApplicationDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLaunchPilot = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pilots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId: app?.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + (app?.challenge.pilotDuration || 90) * 24 * 60 * 60 * 1000),
          budget: app?.challenge.estimatedBudget,
          objectives: `Launch pilot testing for ${app?.startup.name} - ${app?.challenge.title}. Target waiting-time reduction by 40%.`,
          risks: 'Integration latency, local field user training bottlenecks, infrastructure network instability.',
          dataAccess: 'Shared access to regional Mandi gate token logs, historical grain arrival transaction logs.',
          ipTerms: 'Full startup ownership of core proprietary models. Royalty-free usage license for State Departments.',
          cybersecurity: 'ISO 27001 audit or approved cybersecurity declaration.',
          milestones: [
            { name: 'Deployment', description: 'Setup queue server at Maharashtra pilot mandis.', amount: (Number(app?.challenge.estimatedBudget) * 0.3).toFixed(0), deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
            { name: 'Testing', description: 'Successful dry run testing with 100 farmers.', amount: (Number(app?.challenge.estimatedBudget) * 0.3).toFixed(0), deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
            { name: 'Evaluation', description: 'Validate 40% waiting time reduction KPI.', amount: (Number(app?.challenge.estimatedBudget) * 0.4).toFixed(0), deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }
          ]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to launch pilot sandbox');
      
      // Update app status to SELECTED_FOR_PILOT
      await handleStatusChange('SELECTED_FOR_PILOT');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Application not found.
      </div>
    );
  }

  // AI Matching mock calculations
  const matchScore = app.startup.name.includes('AgriWait') ? 92 : app.startup.name.includes('FarmQueue') ? 86 : 79;
  const matchReasons = app.startup.name.includes('AgriWait')
    ? [
        'Agriculture sector alignment',
        'Queue management technology',
        'Demonstrates previous successful deployment of queue management systems in grain procurement centers.'
      ]
    : [
        'Has agricultural queue scheduling software but lacks analytics optimization module.',
        'Fits general technical requirements.'
      ];

  // Visual status timelines mapping
  const timelineSteps = [
    { label: 'Application Submitted', statusKey: 'SUBMITTED' },
    { label: 'Eligibility Screening', statusKey: 'ELIGIBILITY_SCREENING' },
    { label: 'Expert Evaluation', statusKey: 'UNDER_EXPERT_EVALUATION' },
    { label: 'Shortlisted', statusKey: 'SHORTLISTED' },
    { label: 'Pilot Sandbox', statusKey: 'SELECTED_FOR_PILOT' },
    { label: 'Completed', statusKey: 'PILOT_COMPLETED' }
  ];

  const getStepStatus = (stepKey: string) => {
    const currentStatus = app.status;
    const statusOrder = ['SUBMITTED', 'ELIGIBILITY_SCREENING', 'UNDER_EXPERT_EVALUATION', 'SHORTLISTED', 'SELECTED_FOR_PILOT', 'PILOT_COMPLETED'];
    
    // Custom check for evaluated
    let mappedCurrent = currentStatus;
    if (currentStatus === 'ELIGIBILITY_SCREENED') mappedCurrent = 'ELIGIBILITY_SCREENING';
    if (currentStatus === 'EVALUATED') mappedCurrent = 'UNDER_EXPERT_EVALUATION';
    if (currentStatus === 'SELECTED') mappedCurrent = 'SELECTED_FOR_PILOT';
    if (currentStatus === 'CONDITIONALLY_ELIGIBLE') mappedCurrent = 'ELIGIBILITY_SCREENING';
    if (currentStatus === 'REJECTED') return stepKey === 'SUBMITTED' ? 'completed' : 'rejected';

    const currentIndex = statusOrder.indexOf(mappedCurrent);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  // Eligibility mapping from results
  const getEligibilityCheck = (reqName: string) => {
    const matched = app.eligibilityResults.find((r) => r.requirement.name.toLowerCase().includes(reqName.toLowerCase()));
    if (matched) return matched.status;
    return 'PENDING';
  };

  // Disable Select for Pilot check
  const isEvaluated = app.status === 'EVALUATED' || app.evaluations.length > 0;
  const canSelectForPilot = isEvaluated || forceOverride;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      
      {/* Back link */}
      <Link to="/dashboard" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Summary, timeline, actions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Header ID Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Application Reference</span>
            <h2 className="text-2xl font-black text-slate-800 mt-1">{app.appId || `APP-${app.id.substring(0, 5)}`}</h2>
            <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Startup:</span>
                <span className="font-bold text-slate-800">{app.startup.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Challenge:</span>
                <span className="font-bold text-slate-800 truncate max-w-[150px]">{app.challenge.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Submitted:</span>
                <span className="font-bold text-slate-600">{new Date(app.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Visual Status Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-5 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-blue-900" />
              Workflow Progress
            </h3>

            <div className="relative pl-6 border-l border-slate-200 space-y-6 text-xs">
              {timelineSteps.map((step) => {
                const status = getStepStatus(step.statusKey);
                return (
                  <div key={step.statusKey} className="relative">
                    {/* Circle badge */}
                    <div className={`absolute -left-[31px] w-[11px] h-[11px] rounded-full border-2 bg-white ${
                      status === 'completed'
                        ? 'border-emerald-600 bg-emerald-600'
                        : status === 'active'
                        ? 'border-blue-900 bg-blue-900 ring-4 ring-blue-50'
                        : status === 'rejected'
                        ? 'border-red-600 bg-red-600'
                        : 'border-slate-300'
                    }`} />
                    
                    <div>
                      <h4 className={`font-bold ${
                        status === 'completed'
                          ? 'text-emerald-700'
                          : status === 'active'
                          ? 'text-blue-900 text-sm'
                          : 'text-slate-500'
                      }`}>
                        {step.label}
                      </h4>
                      {status === 'active' && (
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
                          Current Stage
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Government Control actions panel */}
          {(userRole === 'GOVERNMENT' || userRole === 'ADMIN') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-blue-950" />
                Administrative Actions
              </h3>

              <div className="space-y-3">
                {/* Remarks/Explanation */}
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-1">
                    Action Remarks / Explanation
                  </label>
                  <textarea
                    rows={2}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Enter review comments..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleStatusChange('ELIGIBILITY_SCREENING')}
                    disabled={updating}
                    className="py-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl font-bold hover:bg-blue-100/50 transition-colors"
                  >
                    Screen Eligibility
                  </button>

                  <button
                    onClick={() => handleStatusChange('UNDER_EXPERT_EVALUATION')}
                    disabled={updating}
                    className="py-2.5 bg-blue-950 text-white rounded-xl font-bold hover:bg-blue-900 transition-colors"
                  >
                    Send to Experts
                  </button>
                </div>

                {/* Pilot Sandbox Trigger */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-[10px] font-bold text-slate-400 uppercase cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forceOverride}
                        onChange={(e) => setForceOverride(e.target.checked)}
                        className="mr-1.5 h-3.5 w-3.5 text-blue-900 border-slate-200 rounded focus:ring-blue-900"
                      />
                      Override Evaluation
                    </label>
                    {!isEvaluated && (
                      <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-0.5" /> Pending Evaluation
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleLaunchPilot}
                    disabled={updating || !canSelectForPilot}
                    className={`w-full py-2.5 font-bold rounded-xl text-xs transition-colors ${
                      canSelectForPilot
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    Select & Launch Pilot Sandbox
                  </button>
                </div>

                {/* Reject */}
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={updating}
                  className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Reject Application
                </button>
              </div>
            </div>
          )}

          {/* Startup Control actions panel */}
          {userRole === 'STARTUP' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-red-600" />
                Manage Application
              </h3>
              
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 leading-normal">
                  If your capabilities have changed or you wish to withdraw this proposal, you can withdraw your application. This will permanently delete your proposal and remove it from government evaluator views.
                </p>

                <button
                  disabled={withdrawing}
                  onClick={handleWithdraw}
                  className="w-full py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors text-xs text-center"
                >
                  {withdrawing ? 'Withdrawing Application...' : 'Withdraw Application'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Details Tab view */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Matching support details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center">
                <Sparkles className="w-4.5 h-4.5 mr-1.5 text-amber-500 fill-amber-500/10" />
                AI-Assisted Capabilities Recommendation Match
              </h3>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-100 rounded-xl text-sm">
                {matchScore}% Match Score
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed font-medium">
                <strong>Justification Notes:</strong>
                <ul className="list-disc pl-5 mt-1.5 space-y-1">
                  {matchReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>

              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-relaxed">
                ℹ️ AI-assisted recommendation. Final decision remains with authorized evaluators.
              </span>
            </div>
          </div>

          {/* Eligibility checklist */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">
              Eligibility Verification Screening Results
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              {[
                { name: 'Startup Recognition DPIIT', label: 'Startup Recognition' },
                { name: 'Cybersecurity Audit Certificate', label: 'Cybersecurity Compliance' },
                { name: 'Agricultural domain expertise', label: 'Required technology/experience' },
                { name: 'General mandatory check', label: 'Mandatory experience' }
              ].map((item) => {
                const status = getEligibilityCheck(item.name);
                return (
                  <div key={item.name} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block truncate max-w-[180px]">{item.name}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      status === 'PASS'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : status === 'WARNING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : status === 'FAIL'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proposed Solution Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2">
              Proposed Solution Proposal
            </h3>
            
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase">Solution Title</span>
              <p className="text-slate-800 text-sm mt-1 font-bold">{app.solutionTitle || 'Untitled Solution'}</p>
            </div>

            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase">Problem Understanding</span>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">{app.problemUnderstanding || 'N/A'}</p>
            </div>

            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase">Solution Description</span>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">{app.solutionDescription || 'N/A'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Technology Used</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {app.technologyUsed?.split(',').map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">
                      {t.trim()}
                    </span>
                  )) || <span className="text-slate-400 font-medium text-xs">N/A</span>}
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Innovation Advantage</span>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{app.innovation || 'N/A'}</p>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase">Expected Impact Outcome</span>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">{app.expectedImpact || 'N/A'}</p>
            </div>
          </div>

          {/* Pilot plan details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2">
              Implementation Sandbox Pilot Plan
            </h3>

            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase">Approach & Methodology</span>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">{app.implementationApproach || 'N/A'}</p>
            </div>

            {/* Timeline */}
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Estimated Timeline Phases</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs text-center font-bold">
                {['Deployment', 'Testing', 'Training', 'Monitoring', 'Evaluation'].map((phase) => {
                  const timelineObj = app.pilotTimeline as any;
                  const desc = timelineObj ? timelineObj[phase.toLowerCase()] : '';
                  return (
                    <div key={phase} className="p-2 border border-slate-100 rounded-xl bg-slate-50/20">
                      <span className="text-blue-900 block font-black">{phase}</span>
                      <span className="text-[9px] text-slate-400 mt-1 font-semibold block leading-tight">{desc || 'Pending'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KPI Outcomes */}
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Startup Committed KPI Results</span>
              <div className="space-y-2">
                {app.challenge.kpis.map((kpi) => {
                  const kpisObj = app.expectedKpiResults as any;
                  const expected = kpisObj ? kpisObj[kpi.id] || kpisObj[kpi.name] : '';
                  return (
                    <div key={kpi.id} className="p-2.5 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{kpi.name}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Government Target: {kpi.target}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block">Startup Target</span>
                        <span className="font-extrabold text-blue-900 text-sm">{expected || 'Match Gov Target'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Attached Documents */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2 flex items-center">
              <FileCheck className="w-4.5 h-4.5 mr-1.5 text-blue-900" />
              Attached Proof Evidence Documents
            </h3>

            {(!app.documents || (app.documents as any[]).length === 0) ? (
              <p className="text-slate-400 text-xs py-4 text-center">No documents uploaded for this application.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
                {(app.documents as any[]).map((doc, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/10">
                    <div className="min-w-0 mr-2">
                      <span className="font-bold text-slate-800 truncate block leading-tight">{doc.name}</span>
                      <span className="text-[9px] text-slate-400 mt-1 uppercase font-semibold block">{doc.fileType || 'PDF'} • {(doc.size / 1024).toFixed(0)} KB</span>
                    </div>

                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evaluation scorecards */}
          {app.evaluations.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center">
                <CheckCircle2 className="w-4.5 h-4.5 mr-1.5 text-emerald-600" />
                Submitted Expert Evaluation Matrix
              </h3>

              <div className="space-y-4">
                {app.evaluations.map((evalItem) => (
                  <div key={evalItem.id} className="p-4 border border-slate-100 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-slate-400 block">Evaluated by</span>
                        <strong className="text-slate-800 text-sm font-extrabold">{evalItem.expert?.name || 'Assigned Expert'}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block">Panel Score</span>
                        <strong className="text-emerald-700 text-lg font-black">{(Number(evalItem.score) * 10).toFixed(1)} / 100</strong>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-semibold">
                      {[
                        { name: 'Tech', val: evalItem.techFeasibility },
                        { name: 'Innovation', val: evalItem.innovation },
                        { name: 'Cost', val: evalItem.costEffectiveness },
                        { name: 'Scalability', val: evalItem.scalability },
                        { name: 'Security', val: evalItem.security },
                        { name: 'Impact', val: evalItem.socialImpact }
                      ].map((score) => (
                        <div key={score.name} className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-slate-400 text-[10px] block leading-tight font-bold uppercase">{score.name}</span>
                          <span className="text-slate-800 font-extrabold text-xs block mt-1">{score.val} / 10</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Panel Audit Feedback Remarks</span>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed font-normal p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                        "{evalItem.comments}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
