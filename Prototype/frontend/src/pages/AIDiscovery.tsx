import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, AlertCircle, Filter, Calendar, Wallet, Check, ChevronRight, MapPin } from 'lucide-react';
import { MatchResult, Role } from '../types';
import { LifecycleTracker } from '../components/LifecycleTracker';

export const AIDiscovery: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<MatchResult[]>([]);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [scoreFilter, setScoreFilter] = useState('0');
  const [techFilter, setTechFilter] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL');

  // Pilot Modal State
  const [selectedStartup, setSelectedStartup] = useState<MatchResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [budget, setBudget] = useState('1000000');
  const [objectives, setObjectives] = useState(
    'Establish digital booking portal for procurement centres. Track daily arrival schedule and farmer processing time.'
  );
  const [risks, setRisks] = useState(
    'Internet connectivity in rural centers, farmer adoption of regional app, system uptime during peak hours.'
  );
  const [submittingPilot, setSubmittingPilot] = useState(false);

  useEffect(() => {
    fetchChallengeAndRecommendations();
  }, [challengeId]);

  const fetchChallengeAndRecommendations = async () => {
    setLoading(true);
    try {
      const challengeRes = await fetch(`/api/challenges/${challengeId}`);
      const challengeData = await challengeRes.json();
      setChallenge(challengeData);

      const recsRes = await fetch(`/api/discovery/${challengeId}`);
      const recsData = await recsRes.json();
      setRecommendations(recsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchPilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartup) return;
    setSubmittingPilot(true);

    try {
      const token = localStorage.getItem('token');
      // 1. We must find the application ID for this startup and challenge to link them
      const appsRes = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const apps = await appsRes.json();
      const matchedApp = apps.find(
        (a: any) => a.challengeId === challengeId && a.startupId === selectedStartup.startupId
      );

      if (!matchedApp) {
        throw new Error('No active application found for this startup. Please make sure the startup has applied.');
      }

      const payload = {
        applicationId: matchedApp.id,
        startDate,
        endDate,
        budget: Number(budget),
        objectives,
        risks,
        dataAccess: 'Encrypted read-access to mandi arrival registries via sandboxed API.',
        ipTerms: 'IP belongs to Startup; Government receives perpetual non-exclusive department-wide license for use.',
        cybersecurity: 'ISO 27001 certificate verification, daily logs monitoring.',
      };

      const response = await fetch('/api/pilots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to initialize pilot');
      }

      setShowModal(false);
      navigate(`/dashboard`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingPilot(false);
    }
  };

  // Filter recommendations logic
  const filteredRecs = recommendations.filter((r) => {
    const matchesScore = r.score >= Number(scoreFilter);
    const matchesTech = techFilter === '' || r.technologies.some((t: string) => t.toLowerCase().includes(techFilter.toLowerCase()));
    const matchesEligible =
      eligibilityFilter === 'ALL' ||
      (eligibilityFilter === 'ELIGIBLE' && r.eligibilityStatus === 'ELIGIBLE') ||
      (eligibilityFilter === 'CONDITIONALLY_ELIGIBLE' && r.eligibilityStatus === 'CONDITIONALLY_ELIGIBLE') ||
      (eligibilityFilter === 'NOT_ELIGIBLE' && r.eligibilityStatus === 'NOT_ELIGIBLE');

    return matchesScore && matchesTech && matchesEligible;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <LifecycleTracker currentStage="DISCOVERY" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
          <Sparkles className="w-8 h-8 text-blue-900" />
          <span>AI Startup Suitability Matching</span>
        </h1>
        {challenge && (
          <p className="text-slate-500 text-sm mt-1 leading-normal">
            Recommendations generated for challenge:{' '}
            <strong className="text-slate-700 font-bold">{challenge.title}</strong>
          </p>
        )}
      </div>

      {/* AI Notice Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-inner flex items-start space-x-3 mb-8">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-amber-800 text-xs uppercase tracking-wider block">
            AI-assisted Decision Support Indicator
          </span>
          <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">
            Match scores and suitability remarks are decision-support variables. Final startup selection, eligibility overrides, and sandbox deployment authorization require validation by the designated government procurement officer.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters column */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 h-fit">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-1.5 pb-2.5 border-b border-slate-100">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Matching Filters</span>
            </h3>

            {/* Score filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                Minimum Match Score: {scoreFilter}%
              </label>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-950 mt-2"
              />
            </div>

            {/* Tech filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                Technology keyword
              </label>
              <input
                type="text"
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                placeholder="e.g. Queue, Python"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
              />
            </div>

            {/* Eligibility filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                Eligibility Status
              </label>
              <select
                value={eligibilityFilter}
                onChange={(e) => setEligibilityFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
              >
                <option value="ALL">All Categories</option>
                <option value="ELIGIBLE">Eligible</option>
                <option value="CONDITIONALLY_ELIGIBLE">Conditionally Eligible</option>
                <option value="NOT_ELIGIBLE">Not Eligible</option>
              </select>
            </div>
          </div>

          {/* Matches column */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Discovered Startups ({filteredRecs.length})
            </h3>

            {filteredRecs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center">
                <ShieldCheck className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-sm font-medium">No suitable matches found with your selected filter parameters.</p>
              </div>
            ) : (
              filteredRecs.map((result) => {
                const isSelected = selectedStartup?.startupId === result.startupId;
                
                return (
                  <div
                    key={result.startupId}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-6 transition-all"
                  >
                    {/* Startup Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-extrabold text-base text-slate-800 tracking-tight leading-tight">
                          {result.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          result.eligibilityStatus === 'ELIGIBLE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : result.eligibilityStatus === 'CONDITIONALLY_ELIGIBLE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {result.eligibilityStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 font-medium mb-3.5 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {result.location}
                      </p>

                      {/* Tech Chips */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {result.technologies.map((t: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Strength bullets */}
                      <ul className="list-disc pl-4 text-xs text-slate-500 space-y-1.5 leading-relaxed">
                        {result.reasons.map((reason: string, idx: number) => (
                          <li key={idx} className="font-normal">{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Match Score & CTA */}
                    <div className="sm:w-44 flex flex-col justify-between items-center sm:items-end border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                      <div className="text-center sm:text-right mb-4">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          AI Compatibility
                        </span>
                        <span className="text-3xl font-black text-blue-900 block mt-1">{result.score}%</span>
                        <span className="text-[9px] text-slate-400 leading-normal">matching weight</span>
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        <Link
                          to={`/startups/${result.startupId}`}
                          className="w-full px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl text-center transition-colors block"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedStartup(result);
                            setShowModal(true);
                          }}
                          disabled={!result.isEligible}
                          className={`w-full px-4 py-2 text-white font-bold text-xs rounded-xl transition-all shadow-sm ${
                            result.isEligible
                              ? 'bg-blue-905 bg-blue-900 hover:bg-blue-800'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          Select for Pilot
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Pilot configuration modal */}
      {showModal && selectedStartup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
            <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center space-x-2">
              <ShieldCheck className="w-5.5 h-5.5 text-blue-900" />
              <span>Pilot Sandbox Launch Authorization</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Create a controlled sandboxed pilot for startup <strong className="text-slate-600 font-bold">{selectedStartup.name}</strong>.
            </p>

            <form onSubmit={handleLaunchPilot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1 flex items-center">
                  <Wallet className="w-3.5 h-3.5 mr-1" />
                  Pilot Budget Allocation (₹)
                </label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                  Pilot Objectives / Success Criteria
                </label>
                <textarea
                  required
                  rows={2}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                  Risk Management mitigation plan
                </label>
                <textarea
                  required
                  rows={2}
                  value={risks}
                  onChange={(e) => setRisks(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-[10px] text-slate-500 leading-relaxed border border-slate-100 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  Confirming this pilot clones the challenge KPIs and automatically creates 4 structured milestones linked to performance payouts.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center space-x-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPilot}
                  className="px-4 py-2 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors flex items-center space-x-1.5"
                >
                  {submittingPilot ? <span>Deploying sandbox...</span> : (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Confirm Pilot Deployment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
