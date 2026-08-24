import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, FileText, CheckCircle2, ChevronRight, Check, ShieldAlert } from 'lucide-react';
import { Application, Pilot } from '../types';

export const ExpertDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);

  // Score Form State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [techFeasibility, setTechFeasibility] = useState(5);
  const [innovation, setInnovation] = useState(5);
  const [costEffectiveness, setCostEffectiveness] = useState(5);
  const [scalability, setScalability] = useState(5);
  const [security, setSecurity] = useState(5);
  const [socialImpact, setSocialImpact] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);

  // Validation Form State
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null);
  const [startupClaim, setStartupClaim] = useState('45% reduction (from 5.2 to 2.86 hours)');
  const [systemResult, setSystemResult] = useState('43% reduction (from 5.2 to 2.96 hours)');
  const [independentResult, setIndependentResult] = useState('43% reduction');
  const [target, setTarget] = useState('40% reduction');
  const [outcome, setOutcome] = useState('VERIFIED');
  const [methodology, setMethodology] = useState(
    'Checked electronic gate logs, cross-referenced with randomized telephone interviews with 150 farmers who visited the Mandi during October-November.'
  );
  const [observations, setObservations] = useState(
    'The system has drastically reduced queue congestion. The primary bottleneck is now physical unloading speed, not token processing. Recommended for scaling.'
  );
  const [submittingValidation, setSubmittingValidation] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const appsRes = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const appsData = await appsRes.json();
      setApplications(appsData.filter((a: any) => a.status === 'UNDER_EXPERT_EVALUATION' || a.status === 'ELIGIBILITY_SCREENED' || a.status === 'SUBMITTED' || a.status === 'ELIGIBILITY_SCREENING'));

      const pilotsRes = await fetch('/api/pilots', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const pilotsData = await pilotsRes.json();
      // Pilots in ACTIVE stage can undergo validation
      setPilots(pilotsData.filter((p: any) => p.status === 'ACTIVE' || p.status === 'REVIEW'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmittingScore(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          techFeasibility,
          innovation,
          costEffectiveness,
          scalability,
          security,
          socialImpact,
          comments,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit evaluation');
      }

      setSelectedApp(null);
      setComments('');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingScore(false);
    }
  };

  const handleValidationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilot) return;
    setSubmittingValidation(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/validations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          pilotId: selectedPilot.id,
          startupClaim,
          systemResult,
          independentResult,
          target,
          outcome,
          methodology,
          observations,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit validation report');
      }

      setSelectedPilot(null);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingValidation(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
          <Award className="w-8 h-8 text-blue-900" />
          <span>Expert Evaluation Dashboard</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review startup applications, submit weighted evaluation ratings, and author independent pilot validation reports.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* List of Applications to Score */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-slate-700 flex items-center space-x-1.5 uppercase tracking-wider">
              <FileText className="w-4.5 h-4.5 text-blue-950" />
              <span>Assigned Evaluations ({applications.length})</span>
            </h3>

            {applications.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                No new applications assigned to your panel.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all flex justify-between items-start"
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">{app.startup.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{app.challenge.title}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {app.startup.technologies.slice(0, 3).map((t, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setSelectedPilot(null);
                      }}
                      className="px-3.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                    >
                      Rate Application
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* List of Active Pilots to Validate */}
            <h3 className="text-sm font-extrabold text-slate-700 flex items-center space-x-1.5 uppercase tracking-wider pt-4">
              <CheckCircle2 className="w-4.5 h-4.5 text-blue-950" />
              <span>Sandbox Validations ({pilots.length})</span>
            </h3>

            {pilots.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                No active pilots ready for validation.
              </div>
            ) : (
              <div className="space-y-4">
                {pilots.map((pilot) => (
                  <div
                    key={pilot.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all flex justify-between items-start"
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        {pilot.startup.name} Pilot
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{pilot.challenge.title}</p>
                      <div className="flex items-center space-x-1.5 mt-2">
                        <span className="w-2 h-2 rounded-full bg-blue-900 animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">{pilot.status}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPilot(pilot);
                        setSelectedApp(null);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                    >
                      Validate Pilot
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Score Panel / Validation Panel */}
          <div>
            {selectedApp ? (
              /* Evaluation Matrix Form */
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <span>Score Matrix: {selectedApp.startup.name}</span>
                  <button onClick={() => setSelectedApp(null)} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
                    Cancel
                  </button>
                </h3>

                <form onSubmit={handleScoreSubmit} className="space-y-4 text-xs text-slate-600">
                  {[
                    { label: 'Technical Feasibility', val: techFeasibility, setVal: setTechFeasibility },
                    { label: 'Innovation', val: innovation, setVal: setInnovation },
                    { label: 'Cost Effectiveness', val: costEffectiveness, setVal: setCostEffectiveness },
                    { label: 'Scalability', val: scalability, setVal: setScalability },
                    { label: 'Security', val: security, setVal: setSecurity },
                    { label: 'Social Impact', val: socialImpact, setVal: setSocialImpact },
                  ].map((slider) => (
                    <div key={slider.label} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-500">{slider.label}</span>
                        <span className="font-extrabold text-blue-900">{slider.val} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={slider.val}
                        onChange={(e) => slider.setVal(Number(e.target.value))}
                        className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-950"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Evaluation Feedback Comments
                    </label>
                    <textarea
                      required
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                      placeholder="Add detailed panel remarks..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingScore}
                    className="w-full py-2.5 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors shadow-sm"
                  >
                    {submittingScore ? 'Submitting evaluation...' : 'Submit Score Evaluation'}
                  </button>
                </form>
              </div>
            ) : selectedPilot ? (
              /* Validation Form */
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <span>Validation Audit: {selectedPilot.startup.name}</span>
                  <button onClick={() => setSelectedPilot(null)} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
                    Cancel
                  </button>
                </h3>

                <form onSubmit={handleValidationSubmit} className="space-y-4 text-xs text-slate-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                        Startup KPI Claim
                      </label>
                      <input
                        type="text"
                        required
                        value={startupClaim}
                        onChange={(e) => setStartupClaim(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                        System Logs Result
                      </label>
                      <input
                        type="text"
                        required
                        value={systemResult}
                        onChange={(e) => setSystemResult(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                        Independent Measured Outcome
                      </label>
                      <input
                        type="text"
                        required
                        value={independentResult}
                        onChange={(e) => setIndependentResult(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                        Target Requirement
                      </label>
                      <input
                        type="text"
                        required
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Audit Outcome
                    </label>
                    <select
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                    >
                      <option value="VERIFIED">Verified — Target Achieved</option>
                      <option value="PARTIAL">Verified — Partially Achieved</option>
                      <option value="FAILED">Failed — Goals unmet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Verification Methodology
                    </label>
                    <textarea
                      required
                      value={methodology}
                      onChange={(e) => setMethodology(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Key Observations & Recommendations
                    </label>
                    <textarea
                      required
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingValidation}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    {submittingValidation ? 'Submitting report...' : 'Publish Validation Report'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center h-80">
                <Award className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-xs font-medium">Select an application or pilot from the list to rate or audit outcomes.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
