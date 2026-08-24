import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FileText, Sparkles, Building, Calendar, Wallet, MapPin, Award, CheckCircle, Clock, Search, Filter, ArrowRight, ArrowLeft, Upload, Trash2, CheckCircle2, ChevronRight, Eye, ShieldAlert } from 'lucide-react';
import { Challenge, Role, Startup } from '../types';
import { LifecycleTracker } from '../components/LifecycleTracker';

interface ChallengeDetailsProps {
  userRole: Role | null;
}

export const ChallengeDetails: React.FC<ChallengeDetailsProps> = ({ userRole }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedId, setAppliedId] = useState('');
  const [applying, setApplying] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleDeleteChallenge = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this challenge? This action will permanently remove the challenge and all associated applications, pilots, and evaluation metrics.');
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/challenges/${challenge?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to delete challenge');
      }

      alert('Challenge deleted successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleWithdrawApplication = async (appId: string) => {
    const confirmWithdraw = window.confirm('Are you sure you want to withdraw your application? This action is permanent.');
    if (!confirmWithdraw) return;

    setWithdrawing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/applications/${appId}`, {
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
      setHasApplied(false);
      setAppliedId('');
      fetchChallenge();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  // Startup Profile state
  const [startupProfile, setStartupProfile] = useState<Startup | null>(null);

  // Multi-step Wizard States
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Form Fields
  // Step 1: Startup Info
  const [startupName, setStartupName] = useState('');
  const [founderInfo, setFounderInfo] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [location, setLocation] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [website, setWebsite] = useState('');
  const [sector, setSector] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [recognitionInfo, setRecognitionInfo] = useState('DPIIT Certified');

  // Step 2: Solution
  const [solutionTitle, setSolutionTitle] = useState('');
  const [problemUnderstanding, setProblemUnderstanding] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [techUsed, setTechUsed] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');
  const [innovation, setInnovation] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');

  // Step 3: Pilot Plan
  const [implApproach, setImplApproach] = useState('');
  const [timelineDeployment, setTimelineDeployment] = useState('15 days - Installation & Config');
  const [timelineTesting, setTimelineTesting] = useState('30 days - User feedback loop');
  const [timelineTraining, setTimelineTraining] = useState('15 days - Local operator training');
  const [timelineMonitoring, setTimelineMonitoring] = useState('15 days - Real-time metrics check');
  const [timelineEvaluation, setTimelineEvaluation] = useState('15 days - KPI Audit');
  const [teamMembers, setTeamMembers] = useState('');
  const [infrastructure, setInfrastructure] = useState('');
  const [hardwareSoftware, setHardwareSoftware] = useState('');
  const [govSupport, setGovSupport] = useState('');
  const [kpiResults, setKpiResults] = useState<Record<string, string>>({});

  // Step 4: Documents
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [docCategory, setDocCategory] = useState('Startup Recognition Certificate');
  const [customDocName, setCustomDocName] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Step 5: Review
  const [confirmAuth, setConfirmAuth] = useState(false);

  // Government Applications table states
  const [appSearch, setAppSearch] = useState('');
  const [appEligibilityFilter, setAppEligibilityFilter] = useState('');
  const [appSortDesc, setAppSortDesc] = useState(true); // default sort by match score desc

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  useEffect(() => {
    // Check search params for auto apply trigger
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('apply') === 'true' && userRole === 'STARTUP' && !hasApplied && !loading && challenge) {
      handleOpenWizard();
    }
  }, [window.location.search, userRole, hasApplied, loading, challenge]);

  const fetchChallenge = () => {
    setLoading(true);
    fetch(`/api/challenges/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setChallenge(data);
        setLoading(false);
        
        // Check if current startup user has already applied
        const token = localStorage.getItem('token');
        if (token) {
          fetch('/api/applications', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(apps => {
              const matched = apps.find((app: any) => app.challengeId === id);
              if (matched) {
                setHasApplied(true);
                setAppliedId(matched.id);
              }
            })
            .catch(err => console.error(err));
          
          // Fetch startup details to prefill Step 1
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            const user = JSON.parse(cachedUser);
            const startupId = user.startupId;
            if (startupId) {
              fetch(`/api/startups/${startupId}`)
                .then(res => res.json())
                .then(startup => {
                  setStartupProfile(startup);
                  // Prefill fields
                  setStartupName(startup.name || '');
                  setFounderInfo(startup.founder || 'AgriWait Founders Team');
                  setFoundedYear(String(startup.founded || 2022));
                  setLocation(startup.location || '');
                  setTeamSize(String(startup.teamSize || 12));
                  setWebsite(startup.website || '');
                  setSector(startup.sectors[0]?.name || 'Agriculture');
                  setTechnologies(startup.technologies.map((t: any) => t.name) || []);
                  
                  // Prefill solution tech list
                  setTechUsed(startup.technologies.map((t: any) => t.name) || []);

                  // Pre-set document upload suggestions
                  const docs = startup.documents.map((d: any) => ({
                    name: d.name,
                    fileType: 'PDF',
                    size: 154200,
                    status: d.status,
                    url: d.documentUrl
                  }));
                  setUploadedDocs(docs);
                })
                .catch(err => console.error(err));
            }
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleOpenWizard = () => {
    if (hasApplied) return;
    setShowWizard(true);
    setWizardStep(1);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
  };

  const handleSimulatedDocUpload = () => {
    setUploadingDoc(true);
    setTimeout(() => {
      const name = customDocName || docCategory;
      const newDoc = {
        name,
        fileType: 'PDF',
        size: Math.floor(Math.random() * 500000) + 100000, // random size 100kb-600kb
        status: 'APPROVED',
        url: `/docs/${name.toLowerCase().replace(/ /g, '_')}.pdf`
      };
      setUploadedDocs([...uploadedDocs, newDoc]);
      setCustomDocName('');
      setUploadingDoc(false);
    }, 800);
  };

  const handleRemoveDoc = (index: number) => {
    setUploadedDocs(uploadedDocs.filter((_, i) => i !== index));
  };

  const handleAddTechnology = () => {
    if (newTech.trim() && !techUsed.includes(newTech.trim())) {
      setTechUsed([...techUsed, newTech.trim()]);
      setNewTech('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setTechUsed(techUsed.filter(t => t !== tech));
  };

  const handleFinalSubmit = async () => {
    if (!confirmAuth) {
      alert('Please confirm the accuracy of information submitted.');
      return;
    }
    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId: id,
          solutionTitle,
          problemUnderstanding,
          solutionDescription: proposedSolution,
          technologyUsed: techUsed,
          innovation,
          expectedImpact,
          implementationApproach: implApproach,
          pilotTimeline: {
            deployment: timelineDeployment,
            testing: timelineTesting,
            training: timelineTraining,
            monitoring: timelineMonitoring,
            evaluation: timelineEvaluation,
          },
          resourceRequirements: {
            teamMembers,
            infrastructure,
            hardwareSoftware,
            govSupport,
          },
          expectedKpiResults: kpiResults,
          documents: uploadedDocs,
          startupInfo: {
            name: startupName,
            location,
            founded: foundedYear,
            teamSize,
            website,
            sectors: [sector],
            technologies
          }
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }
      setHasApplied(true);
      setAppliedId(data.id);
      setShowWizard(false);
      fetchChallenge();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Challenge details not found.
      </div>
    );
  }

  // Calculate matching details for Government Applications Table
  const getAppStats = (appName: string) => {
    if (appName.includes('AgriWait')) {
      return { score: 92, eligibility: 'Eligible', isEligible: true };
    }
    if (appName.includes('FarmQueue')) {
      return { score: 86, eligibility: 'Eligible', isEligible: true };
    }
    if (appName.includes('CropFlow')) {
      return { score: 79, eligibility: 'Conditional', isEligible: true };
    }
    return { score: 72, eligibility: 'Not Eligible', isEligible: false };
  };

  // Filter Government Applications
  const appsList = challenge.applications || [];
  const filteredApps = appsList.filter((app: any) => {
    const stats = getAppStats(app.startup.name);
    const matchesSearch = app.startup.name.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.status.toLowerCase().includes(appSearch.toLowerCase());
    const matchesElig = appEligibilityFilter ? stats.eligibility === appEligibilityFilter : true;
    return matchesSearch && matchesElig;
  }).sort((a: any, b: any) => {
    const scoreA = getAppStats(a.startup.name).score;
    const scoreB = getAppStats(b.startup.name).score;
    return appSortDesc ? scoreB - scoreA : scoreA - scoreB;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      {/* Lifecycle tracker */}
      <LifecycleTracker currentStage="CHALLENGE" />

      {/* Header Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2.5 mb-2.5">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-950 font-bold rounded text-[10px] uppercase tracking-wider border border-blue-100">
              {challenge.sector}
            </span>
            <span className="flex items-center text-[11px] text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {challenge.location}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            {challenge.title}
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center">
            <Building className="w-4 h-4 mr-1.5 text-slate-400" />
            {challenge.department}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {userRole === 'GOVERNMENT' && (
            <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
              <Link
                to={`/discovery/${challenge.id}`}
                className="w-full md:w-auto px-5 py-3 bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>Discover Suitable Startups</span>
              </Link>
              <button
                disabled={deleting}
                onClick={handleDeleteChallenge}
                className="w-full md:w-auto px-5 py-3 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold text-sm rounded-xl transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4.5 h-4.5" />
                <span>{deleting ? 'Deleting...' : 'Delete Challenge'}</span>
              </button>
            </div>
          )}

          {userRole === 'STARTUP' && (
            <div className="w-full md:w-auto">
              {hasApplied ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <span className="px-5 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-4.5 h-4.5 mr-1.5" />
                    Application Submitted
                  </span>
                  <Link
                    to={`/applications/${appliedId}`}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl text-center flex items-center justify-center border border-slate-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    View Application
                  </Link>
                  <button
                    disabled={withdrawing}
                    onClick={() => handleWithdrawApplication(appliedId)}
                    className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold text-sm rounded-xl text-center flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-1">{withdrawing ? 'Withdrawing...' : 'Withdraw'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenWizard}
                  disabled={applying}
                  className="w-full px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center"
                >
                  Apply to Challenge
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Side: Parameters */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Problem Statement Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2.5">
              Problem Statement Scope
            </h3>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase">Context / Problem Description</span>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed font-normal">{challenge.description}</p>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase">Current Situation</span>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed font-normal">{challenge.currentSituation}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Target Users</span>
                <p className="text-slate-700 text-sm font-medium mt-1">{challenge.targetUsers}</p>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Expected Impact Outcome</span>
                <p className="text-slate-700 text-sm font-medium mt-1">{challenge.expectedImpact}</p>
              </div>
            </div>
          </div>

          {/* Required capabilities / technologies */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2.5 mb-4">
              Required Capabilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Queue management', 'Data analytics', 'Web/mobile technology', 'Agriculture domain experience'].map((cap) => (
                <span key={cap} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full font-bold text-xs">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {/* Eligibility Requirements Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2.5 mb-4">
              Configured Eligibility Requirements
            </h3>
            <div className="space-y-3.5">
              {challenge.requirements.map((req) => (
                <div key={req.id} className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{req.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{req.description}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
                    Required
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Government applications list */}
          {(userRole === 'GOVERNMENT' || userRole === 'ADMIN') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Applications ({filteredApps.length})</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Review and manage startup submissions for this challenge.</p>
                </div>
              </div>

              {/* Filters row */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search startup..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-900 bg-white"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Eligibility Filter */}
                <select
                  value={appEligibilityFilter}
                  onChange={(e) => setAppEligibilityFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-900 bg-white"
                >
                  <option value="">All Eligibility</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Conditional">Conditional</option>
                  <option value="Not Eligible">Not Eligible</option>
                </select>

                {/* Sort match score */}
                <button
                  onClick={() => setAppSortDesc(!appSortDesc)}
                  className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-left"
                >
                  Sort by Match Score: {appSortDesc ? 'High to Low' : 'Low to High'}
                </button>
              </div>

              {/* Table */}
              {filteredApps.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No applications found matching search criteria.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Startup</th>
                        <th className="py-3 px-4 text-center">Match</th>
                        <th className="py-3 px-4">Eligibility</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {filteredApps.map((app: any) => {
                        const stats = getAppStats(app.startup.name);
                        return (
                          <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              {app.startup.name}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                              {stats.score}%
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                stats.eligibility === 'Eligible'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : stats.eligibility === 'Conditional'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                {stats.eligibility}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-100 text-[9px] font-bold uppercase">
                                {app.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                to={`/applications/${app.id}`}
                                className="px-3.5 py-1 bg-blue-955 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold inline-block"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Quick Stats & Metrics */}
        <div className="space-y-6">
          {/* Quick Specifications */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm divide-y divide-slate-100">
            <div className="flex items-center justify-between pb-3.5">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center">
                <Wallet className="w-4 h-4 mr-1.5 text-slate-400" />
                Budget
              </span>
              <span className="font-bold text-slate-800 text-sm">
                ₹{Number(challenge.estimatedBudget).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                Pilot Duration
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {challenge.pilotDuration} Days
              </span>
            </div>
          </div>

          {/* Success KPIs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center">
              <Award className="w-4.5 h-4.5 mr-1.5 text-amber-500" />
              Target KPIs
            </h3>
            <div className="space-y-4">
              {challenge.kpis.map((kpi) => (
                <div key={kpi.id} className="p-3 border border-slate-100 rounded-xl">
                  <h4 className="font-bold text-xs text-slate-800 leading-tight">{kpi.name}</h4>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                    <span>Baseline: <strong className="text-slate-600 font-bold">{kpi.baseline}</strong></span>
                    <span>Goal Target: <strong className="text-blue-900 font-bold">{kpi.target}</strong></span>
                    <span>Freq: <strong className="text-slate-600 font-bold">{kpi.frequency}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluator Criteria Weights */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center">
              <FileText className="w-4.5 h-4.5 mr-1.5 text-blue-900" />
              Evaluation Criteria Weight
            </h3>
            <div className="space-y-2.5">
              {challenge.criteria.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">{c.name}</span>
                  <span className="text-xs font-bold text-slate-800">
                    {(Number(c.weight) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Multi-step Application Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider">Mandi Procurement Sandboxing</span>
                <h3 className="font-extrabold text-slate-850 text-base text-slate-800 mt-0.5">Apply to Challenge</h3>
              </div>
              <button onClick={handleCloseWizard} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
                Cancel
              </button>
            </div>

            {/* Steps Progress Indicator */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between text-[11px] font-bold text-slate-400">
              {[
                { step: 1, name: '1 Startup' },
                { step: 2, name: '2 Solution' },
                { step: 3, name: '3 Pilot Plan' },
                { step: 4, name: '4 Documents' },
                { step: 5, name: '5 Review' }
              ].map((s) => (
                <div key={s.step} className="flex items-center space-x-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] border ${
                    wizardStep === s.step
                      ? 'bg-blue-905 bg-blue-900 text-white border-blue-900 font-black'
                      : wizardStep > s.step
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-700 font-black'
                      : 'border-slate-200'
                  }`}>
                    {s.step}
                  </span>
                  <span className={wizardStep === s.step ? 'text-blue-900 font-extrabold' : wizardStep > s.step ? 'text-emerald-700' : ''}>
                    {s.name.split(' ')[1]}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-650">
              
              {/* STEP 1: Startup Info */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 mb-3">
                    <h4 className="font-extrabold text-slate-800 text-sm">Startup Profile Information</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Please review your startup registration details. Edit if outdated.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Startup Name</label>
                      <input
                        type="text"
                        value={startupName}
                        onChange={(e) => setStartupName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Founder / Team Info</label>
                      <input
                        type="text"
                        value={founderInfo}
                        onChange={(e) => setFounderInfo(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Founded Year</label>
                      <input
                        type="number"
                        value={foundedYear}
                        onChange={(e) => setFoundedYear(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Team Size</label>
                      <input
                        type="number"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Website URL</label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Sector</label>
                      <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Startup Recognition Status</label>
                      <input
                        type="text"
                        value={recognitionInfo}
                        onChange={(e) => setRecognitionInfo(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Proposed Solution */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 mb-3">
                    <h4 className="font-extrabold text-slate-800 text-sm">Proposed Solution Details</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Describe your technology proposal for solving the procurement bottlenecks.</p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Solution Title</label>
                      <input
                        type="text"
                        placeholder="e.g. AI-powered mandi arrivals scheduling and queue dispatcher"
                        value={solutionTitle}
                        onChange={(e) => setSolutionTitle(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Understanding of the Problem</label>
                      <textarea
                        rows={3}
                        placeholder="Explain your understanding of the government department problem..."
                        value={problemUnderstanding}
                        onChange={(e) => setProblemUnderstanding(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Proposed Solution Description</label>
                      <textarea
                        rows={4}
                        placeholder="Explain how your technology solution will solve the problem..."
                        value={proposedSolution}
                        onChange={(e) => setProposedSolution(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>

                    {/* Technologies list */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Technologies Used</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {techUsed.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded font-bold uppercase text-[9px] flex items-center">
                            {t}
                            <button type="button" onClick={() => handleRemoveTechnology(t)} className="ml-1 text-slate-400 hover:text-slate-650">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Add technology..."
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-1 flex-1 focus:outline-none focus:border-blue-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddTechnology}
                          className="px-3 py-1 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">What makes it innovative?</label>
                        <textarea
                          rows={2.5}
                          placeholder="How is your solution unique?"
                          value={innovation}
                          onChange={(e) => setInnovation(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expected Measurable Impact</label>
                        <textarea
                          rows={2.5}
                          placeholder="Describe the target impact expected..."
                          value={expectedImpact}
                          onChange={(e) => setExpectedImpact(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Pilot / Implementation Plan */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 mb-3">
                    <h4 className="font-extrabold text-slate-800 text-sm">Implementation & Pilot Plan</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Describe your roadmap for pilot sandbox trials in selected mandis.</p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Implementation Approach</label>
                      <textarea
                        rows={3}
                        placeholder="Conduct of pilots methodology..."
                        value={implApproach}
                        onChange={(e) => setImplApproach(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 bg-white font-medium"
                      />
                    </div>

                    {/* Timeline Phases */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Timeline Phase Estimates</span>
                      <div className="grid sm:grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-0.5">1. Deployment Phase</label>
                          <input type="text" value={timelineDeployment} onChange={(e) => setTimelineDeployment(e.target.value)} className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-white focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-0.5">2. Testing Phase</label>
                          <input type="text" value={timelineTesting} onChange={(e) => setTimelineTesting(e.target.value)} className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-white focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-0.5">3. Operator Training Phase</label>
                          <input type="text" value={timelineTraining} onChange={(e) => setTimelineTraining(e.target.value)} className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-white focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-0.5">4. Monitoring Phase</label>
                          <input type="text" value={timelineMonitoring} onChange={(e) => setTimelineMonitoring(e.target.value)} className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-white focus:outline-none" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-400 font-semibold mb-0.5">5. Final Evaluation Phase</label>
                          <input type="text" value={timelineEvaluation} onChange={(e) => setTimelineEvaluation(e.target.value)} className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-white focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Team Members Assigned</label>
                        <input type="text" placeholder="e.g. 1 Lead Engineer, 2 Field Technicians" value={teamMembers} onChange={(e) => setTeamMembers(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Infrastructure Required</label>
                        <input type="text" placeholder="e.g. Cloud VM, local network router" value={infrastructure} onChange={(e) => setInfrastructure(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hardware & Software</label>
                        <input type="text" placeholder="e.g. SMS Gateway license" value={hardwareSoftware} onChange={(e) => setHardwareSoftware(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Government Support Needed</label>
                        <input type="text" placeholder="e.g. Power outlet at mandi gates" value={govSupport} onChange={(e) => setGovSupport(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-xs" />
                      </div>
                    </div>

                    {/* Target KPI Outcomes */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Committed KPI Expected Results</span>
                      <div className="space-y-2">
                        {challenge.kpis.map((kpi) => (
                          <div key={kpi.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                            <div className="min-w-0 mr-4">
                              <span className="font-bold text-slate-800 block">{kpi.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Government Target: {kpi.target}</span>
                            </div>
                            <input
                              type="text"
                              required
                              placeholder="Your expected outcome"
                              value={kpiResults[kpi.id] || kpiResults[kpi.name] || ''}
                              onChange={(e) => setKpiResults({
                                ...kpiResults,
                                [kpi.id]: e.target.value,
                                [kpi.name]: e.target.value
                              })}
                              className="border border-slate-200 rounded-lg px-3 py-1.5 focus:border-blue-900 bg-white w-40 text-xs font-bold text-right"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Documents Upload */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 mb-3">
                    <h4 className="font-extrabold text-slate-800 text-sm">Proof & Evidence Documents</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Upload required compliance certificates and technical proposals.</p>
                  </div>

                  {/* Document upload form (simulated) */}
                  <div className="p-4 border border-slate-100 rounded-xl space-y-3 bg-slate-50/20">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Document Category</label>
                        <select
                          value={docCategory}
                          onChange={(e) => setDocCategory(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:border-blue-900 bg-white"
                        >
                          <option value="Startup Recognition Certificate">Startup Recognition Certificate (DPIIT)</option>
                          <option value="Technical Proposal">Technical Proposal Document</option>
                          <option value="Cybersecurity Audit Compliance Certificate">Cybersecurity Certificate</option>
                          <option value="Previous Project Evidence">Previous Project Case Studies</option>
                          <option value="Other Documentation">Other Documentation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Custom File Name (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. AgriWait_Cyberaudit_2025"
                          value={customDocName}
                          onChange={(e) => setCustomDocName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:border-blue-900 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulatedDocUpload}
                      disabled={uploadingDoc}
                      className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadingDoc ? 'Uploading...' : 'Attach Selected File'}</span>
                    </button>
                  </div>

                  {/* Uploaded Documents List */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Attached Proof Documents ({uploadedDocs.length})</span>
                    {uploadedDocs.length === 0 ? (
                      <p className="text-slate-450 italic py-2 text-center text-xs">No documents attached yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {uploadedDocs.map((doc, idx) => (
                          <div key={idx} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between bg-white shadow-sm">
                            <div className="min-w-0 flex-1 mr-4">
                              <span className="font-bold text-slate-800 truncate block leading-tight">{doc.name}</span>
                              <span className="text-[9px] text-slate-400 mt-1 uppercase font-semibold block">{doc.fileType} • {(doc.size / 1024).toFixed(0)} KB</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: Review & Submit */}
              {wizardStep === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-2.5 mb-3">
                    <h4 className="font-extrabold text-slate-800 text-sm">Review Proposal Application</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Please review your application summary details before submitting.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Summary cards */}
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-800">Challenge Title</span>
                        <span className="text-slate-650 text-right truncate max-w-[250px]">{challenge.title}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-800">Startup Name</span>
                        <span className="text-slate-650">{startupName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-800">Solution Title</span>
                        <span className="text-slate-650 text-right truncate max-w-[250px]">{solutionTitle || 'Untitled Solution'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-800">Attached Documents</span>
                        <span className="text-slate-650">{uploadedDocs.length} files attached</span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                      <h5 className="font-extrabold text-blue-900 text-xs uppercase">Important Declaration Check</h5>
                      <label className="flex items-start text-[11px] font-semibold text-blue-950 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmAuth}
                          onChange={(e) => setConfirmAuth(e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-900 border-slate-200 rounded focus:ring-blue-900 mt-0.5"
                        />
                        <span>I confirm that the information submitted is accurate and that I am authorized to submit this application on behalf of the startup.</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer (Controls) */}
            <div className="p-5 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <button
                type="button"
                disabled={wizardStep === 1 || applying}
                onClick={() => setWizardStep(wizardStep - 1)}
                className={`px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center ${
                  wizardStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back</span>
              </button>

              {wizardStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={applying || !confirmAuth}
                  onClick={handleFinalSubmit}
                  className={`px-6 py-2.5 font-bold rounded-lg text-xs transition-colors text-white ${
                    confirmAuth && !applying
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  {applying ? 'Submitting proposal...' : 'Submit Application'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
