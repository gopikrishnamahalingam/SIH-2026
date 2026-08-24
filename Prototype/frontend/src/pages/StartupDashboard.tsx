import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  FileText,
  ChevronRight,
  Upload,
  Sparkles,
  Building,
  Briefcase,
  Search,
  Filter,
  MapPin,
  Wallet,
  Calendar,
  ArrowRight,
  LayoutDashboard,
  Compass,
  CheckCircle
} from 'lucide-react';
import { Application, Pilot, Startup, Challenge } from '../types';

export const StartupDashboard: React.FC = () => {
  const [profile, setProfile] = useState<Startup | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);

  // Tabs
  const [activeTab, setActiveTab] = useState<'workspace' | 'discover'>('workspace');

  // Search & Filters for Browse All
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSector, setActiveSector] = useState('All');
  const [activeBudgetRange, setActiveBudgetRange] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'budget' | 'deadline'>('match');

  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docName, setDocName] = useState('Cybersecurity Declaration');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      let startupId = user.startupId;

      // Fallback if startupId is missing in user object
      if (!startupId) {
        const startupsRes = await fetch('/api/startups', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const startups = await startupsRes.json();
        const myStartup = startups.find((s: any) => s.userId === user.id);
        if (myStartup) {
          startupId = myStartup.id;
          user.startupId = startupId;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }

      if (startupId) {
        const startupRes = await fetch(`/api/startups/${startupId}`);
        const startupData = await startupRes.json();
        setProfile(startupData);

        // Fetch recommended challenges
        const recsRes = await fetch('/api/discovery/startup/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const recsData = await recsRes.json();
        setRecommendations(Array.isArray(recsData) ? recsData : []);
      }

      // Fetch applications
      const appsRes = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const appsData = await appsRes.json();
      setApplications(Array.isArray(appsData) ? appsData : []);

      // Fetch pilots
      const pilotsRes = await fetch('/api/pilots', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const pilotsData = await pilotsRes.json();
      setPilots(Array.isArray(pilotsData) ? pilotsData.filter((p: any) => p.startupId === startupId) : []);

      // Fetch all challenges
      const chalRes = await fetch('/api/challenges');
      const chalData = await chalRes.json();
      setAllChallenges(Array.isArray(chalData) ? chalData.filter((c: any) => c.status === 'PUBLISHED') : []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingDoc(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/startups/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: docName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }
      setDocName('Cybersecurity Declaration');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const getMatchDetails = (challengeId: string) => {
    const matched = recommendations.find((r) => r.challengeId === challengeId);
    if (matched) {
      return {
        score: matched.score,
        reason: matched.reasons[0] || 'Good capabilities match.',
      };
    }
    // Static algorithm fallback logic
    if (profile) {
      const nameMatch = profile.name.toLowerCase().includes('agri') || profile.sectors.some(s => s.name.toLowerCase().includes('agri'));
      if (nameMatch) {
        return { score: 75, reason: 'Technical capabilities match.' };
      }
    }
    return { score: 65, reason: 'Relevant technical alignment.' };
  };

  // Filter and Sort Challenges
  const filteredChallenges = allChallenges
    .filter((challenge) => {
      const matchesSearch =
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector = activeSector === 'All' || challenge.sector === activeSector;

      let matchesBudget = true;
      if (activeBudgetRange !== 'All') {
        const budget = Number(challenge.estimatedBudget);
        if (activeBudgetRange === '< 10L') matchesBudget = budget < 1000000;
        else if (activeBudgetRange === '10L - 50L') matchesBudget = budget >= 1000000 && budget <= 5000000;
        else if (activeBudgetRange === '> 50L') matchesBudget = budget > 5000000;
      }

      return matchesSearch && matchesSector && matchesBudget;
    })
    .sort((a, b) => {
      if (sortBy === 'match') {
        return getMatchDetails(b.id).score - getMatchDetails(a.id).score;
      }
      if (sortBy === 'budget') {
        return Number(b.estimatedBudget) - Number(a.estimatedBudget);
      }
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });

  const sectors = ['All', ...Array.from(new Set(allChallenges.map((c) => c.sector)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">

      {/* Header Panel */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
            Startup Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor compliance audits, active sandbox pilots, and discover new government challenges.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-1 bg-slate-200/60 p-1.5 rounded-xl border border-slate-200/50 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'workspace'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'discover'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Opportunities</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left panel: Info summary and compliance documents */}
          <div className="lg:col-span-1 space-y-6">
            {/* Startup Info Summary */}
            {profile && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-900 text-white flex items-center justify-center font-black rounded-xl text-lg">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 leading-tight">{profile.name}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-0.5" />
                      {profile.location}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profile Status:</span>
                    <span className="font-bold text-emerald-600 uppercase tracking-wider">{profile.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completeness:</span>
                    <span className="font-bold text-slate-700">{profile.profileCompleteness}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sector Focus:</span>
                    <span className="font-bold text-slate-700">
                      {profile.sectors.map(s => s.name).join(', ') || 'General'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Library / Upload */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center">
                <Upload className="w-4 h-4 mr-1.5 text-blue-900" />
                Upload Compliance Certificate
              </h3>

              <form onSubmit={handleUploadDoc} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    Document Category
                  </label>
                  <select
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:border-blue-900 bg-white"
                  >
                    <option value="Cybersecurity Declaration">Cybersecurity Declaration</option>
                    <option value="ISO 27001 Cybersecurity Certificate">ISO 27001 Certificate</option>
                    <option value="Financial Audits FY25">Audits Statement FY25</option>
                    <option value="Startup Recognition DPIIT">DPIIT Recognition Letter</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={uploadingDoc || !docName}
                  className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold shadow-sm transition-colors text-xs"
                >
                  {uploadingDoc ? 'Uploading...' : 'Submit Document to Registry'}
                </button>
              </form>

              {/* Show documents list */}
              {profile && profile.documents.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-3">
                    Submitted Certificates
                  </span>
                  {profile.documents.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center p-2.5 border border-slate-100 rounded-lg">
                      <div className="min-w-0 flex-1 mr-2">
                        <span className="text-xs font-bold text-slate-700 truncate block leading-tight">{doc.name}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tab Content Panels (Workspace / Discover) */}
          <div className="lg:col-span-2 space-y-6">

            {activeTab === 'workspace' ? (
              <>
                {/* Active Sandbox Pilots */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                    <Briefcase className="w-4 h-4 mr-1.5 text-slate-400" />
                    Active Sandbox Testing ({pilots.length})
                  </h3>

                  {pilots.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                      You do not have any active sandboxed pilots. Apply to published challenges to enter sandbox testing.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pilots.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div>
                            <h4 className="font-extrabold text-base text-slate-800 leading-tight">
                              {p.challenge.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                              Sandbox duration: {p.challenge.pilotDuration} days. Current Stage:{' '}
                              <strong className="text-blue-900 font-bold uppercase">{p.currentStage}</strong>
                            </p>
                          </div>

                          <Link
                            to={`/pilots/${p.id}`}
                            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm text-center"
                          >
                            Enter Sandbox Dashboard
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Challenge Applications */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                    <FileText className="w-4 h-4 mr-1.5 text-slate-400" />
                    Challenge Applications ({applications.length})
                  </h3>

                  {applications.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                      No active challenge applications submitted.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1.5">
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-100 rounded text-[9px] font-bold uppercase tracking-wider">
                                {app.challenge.sector}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium flex items-center">
                                <Building className="w-3.5 h-3.5 mr-1" />
                                {app.challenge.department}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-800 truncate leading-tight">
                              {app.challenge.title}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                            <div>
                              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                Status
                              </span>
                              <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase block mt-1">
                                {app.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <Link to={`/applications/${app.id}`} className="text-slate-400 hover:text-blue-900 transition-colors">
                              <ChevronRight className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Recommended Challenges */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Recommended for You
                    </h3>
                  </div>

                  {recommendations.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs">
                      No matching recommendations at this time. Update your technology sector or documents to trigger recommendation matches.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {recommendations.slice(0, 2).map((rec) => {
                        const challenge = allChallenges.find(c => c.id === rec.challengeId) || rec;
                        const hasApplied = applications.some((a) => a.challengeId === rec.challengeId);

                        return (
                          <div
                            key={rec.challengeId}
                            className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-100 rounded text-[9px] font-bold uppercase tracking-wider">
                                  {challenge.sector}
                                </span>
                                <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-black">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/25" />
                                  <span>{rec.score}% Match</span>
                                </div>
                              </div>

                              <h4 className="font-extrabold text-sm text-slate-800 leading-tight mb-2">
                                {challenge.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                {challenge.description}
                              </p>

                              <p className="text-[10px] text-slate-400 font-medium mb-3 italic">
                                "{rec.reasons?.[0] || 'Good technological alignment.'}"
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-bold flex items-center">
                                <Wallet className="w-3.5 h-3.5 mr-1" />
                                {(Number(challenge.estimatedBudget) / 100000).toFixed(0)}L Budget
                              </span>

                              {hasApplied ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Applied
                                </span>
                              ) : (
                                <Link
                                  to={`/challenges/${rec.challengeId}`}
                                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-[10px] font-bold transition-all flex items-center shadow-sm"
                                >
                                  <span>View Details</span>
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Browse All Challenges */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">

                  {/* Search and Filters panel */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="font-extrabold text-slate-800 text-sm">Browse All Challenges</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Explore procurement opportunities across various departments.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="md:col-span-1 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search challenges..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-900"
                        />
                      </div>

                      <div>
                        <select
                          value={activeSector}
                          onChange={(e) => setActiveSector(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                        >
                          <option value="All">All Sectors</option>
                          {sectors.filter(s => s !== 'All').map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-white"
                        >
                          <option value="match">Sort by: AI Match Score</option>
                          <option value="budget">Sort by: Budget Size</option>
                          <option value="deadline">Sort by: Release Date</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[11px]">
                      <span className="text-slate-400 font-semibold flex items-center">
                        <Filter className="w-3 h-3 mr-1" />
                        Budget Range:
                      </span>
                      {['All', '< 10L', '10L - 50L', '> 50L'].map((bRange) => (
                        <button
                          key={bRange}
                          onClick={() => setActiveBudgetRange(bRange)}
                          className={`px-2.5 py-1 rounded-full border transition-all font-medium ${activeBudgetRange === bRange
                              ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {bRange}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Challenges Grid */}
                  {filteredChallenges.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No challenges match the active search or filters. Clear inputs to reset.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredChallenges.map((challenge) => {
                        const matchInfo = getMatchDetails(challenge.id);
                        const hasApplied = applications.some((a) => a.challengeId === challenge.id);

                        return (
                          <div
                            key={challenge.id}
                            className="border border-slate-100 hover:border-slate-200 rounded-xl p-4.5 transition-all flex flex-col justify-between bg-slate-50/50"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] text-slate-400 font-medium flex items-center">
                                  <Building className="w-3.5 h-3.5 mr-1" />
                                  {challenge.department}
                                </span>
                                <div className="text-[10px] font-bold text-amber-700 bg-amber-50/50 border border-amber-100 px-1.5 py-0.5 rounded-lg flex items-center">
                                  <Sparkles className="w-3 h-3 mr-0.5 text-amber-500" />
                                  <span>{matchInfo.score}%</span>
                                </div>
                              </div>

                              <h4 className="font-extrabold text-sm text-slate-800 leading-tight mb-2">
                                {challenge.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                {challenge.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100/70 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-bold flex items-center">
                                <Wallet className="w-3.5 h-3.5 mr-1" />
                                {(Number(challenge.estimatedBudget) / 100000).toFixed(0)}L Budget
                              </span>

                              {hasApplied ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Applied
                                </span>
                              ) : (
                                <Link
                                  to={`/challenges/${challenge.id}`}
                                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[10px] font-bold transition-all flex items-center text-slate-700 shadow-sm"
                                >
                                  <span>Details</span>
                                  <ArrowRight className="w-3 h-3 ml-1 text-slate-500" />
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </>
            )}

          </div>

        </div>
      )}
    </div>
  );
};
