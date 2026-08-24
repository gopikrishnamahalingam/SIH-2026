import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export const CreateChallenge: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Department of Agriculture & Farmer Welfare');
  const [sector, setSector] = useState('Agriculture');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [currentSituation, setCurrentSituation] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  
  const [pilotDuration, setPilotDuration] = useState('90');
  const [estimatedBudget, setEstimatedBudget] = useState('1000000');

  // Arrays
  const [requirements, setRequirements] = useState<{ name: string; description: string; isRequired: boolean }[]>([
    { name: 'DPIIT Startup Recognition', description: 'Startup must be registered and recognized by DPIIT, India.', isRequired: true },
    { name: 'Required Technology', description: 'Proven capabilities in queue management software or data analytics.', isRequired: true },
  ]);

  const [criteria, setCriteria] = useState<{ name: string; weight: number }[]>([
    { name: 'Technical Feasibility', weight: 25 },
    { name: 'Innovation', weight: 20 },
    { name: 'Cost Effectiveness', weight: 15 },
    { name: 'Scalability', weight: 15 },
    { name: 'Security', weight: 10 },
    { name: 'Social Impact', weight: 15 },
  ]);

  const [kpis, setKpis] = useState<{ name: string; baseline: string; target: string; unit: string; frequency: string }[]>([
    { name: 'Average Waiting Time', baseline: '5.2 hours', target: '3.1 hours', unit: 'hours', frequency: 'Daily' },
  ]);

  // Helpers to add/remove array items
  const addRequirement = () => {
    setRequirements([...requirements, { name: '', description: '', isRequired: true }]);
  };

  const removeRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const updateRequirement = (idx: number, key: string, val: any) => {
    const updated = [...requirements];
    updated[idx] = { ...updated[idx], [key]: val };
    setRequirements(updated);
  };

  const addCriterion = () => {
    setCriteria([...criteria, { name: '', weight: 0 }]);
  };

  const removeCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const updateCriterion = (idx: number, name: string, weight: number) => {
    const updated = [...criteria];
    updated[idx] = { name, weight };
    setCriteria(updated);
  };

  const addKpi = () => {
    setKpis([...kpis, { name: '', baseline: '', target: '', unit: '', frequency: 'Daily' }]);
  };

  const removeKpi = (idx: number) => {
    setKpis(kpis.filter((_, i) => i !== idx));
  };

  const updateKpi = (idx: number, key: string, val: string) => {
    const updated = [...kpis];
    updated[idx] = { ...updated[idx], [key]: val };
    setKpis(updated);
  };

  const handlePublish = async () => {
    // Check criteria sum
    const weightSum = criteria.reduce((sum, c) => sum + Number(c.weight), 0);
    if (Math.abs(weightSum - 100) > 0.1 && Math.abs(weightSum - 1.0) > 0.01) {
      setError('Evaluation criteria weights must sum to exactly 100%');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      // Format weights to decimal fraction (e.g. 25 -> 0.25)
      const formattedCriteria = criteria.map(c => ({
        name: c.name,
        weight: c.weight > 1 ? c.weight / 100 : c.weight,
      }));

      const payload = {
        title,
        department,
        sector,
        location,
        description,
        currentSituation,
        targetUsers,
        expectedImpact,
        pilotDuration: Number(pilotDuration),
        estimatedBudget: Number(estimatedBudget),
        requirements,
        criteria: formattedCriteria,
        kpis,
        status: 'PUBLISHED',
      };

      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish challenge');
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">Step 1 — Problem Definition</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Challenge Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Farmer Procurement Waiting-Time Reduction"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
                >
                  <option value="Agriculture">Agriculture</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Transport">Transport & Logistics</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Location scope</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Haryana Mandis"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the problem, context, and what you seek to resolve..."
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Situation</label>
              <textarea
                value={currentSituation}
                onChange={(e) => setCurrentSituation(e.target.value)}
                rows={2}
                placeholder="Describe the current process and its failures..."
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Users</label>
                <input
                  type="text"
                  value={targetUsers}
                  onChange={(e) => setTargetUsers(e.target.value)}
                  placeholder="e.g. Mandi managers, local farmers"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Expected Impact</label>
                <input
                  type="text"
                  value={expectedImpact}
                  onChange={(e) => setExpectedImpact(e.target.value)}
                  placeholder="e.g. 40% wait reduction, faster unloading"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">Step 2 — Pilot Parameters & Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Pilot Sandbox Duration (Days)</label>
                <input
                  type="number"
                  value={pilotDuration}
                  onChange={(e) => setPilotDuration(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Estimated Budget (₹)</label>
                <input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-slate-800 text-lg">Step 3 — Configurable Eligibility Rules</h3>
              <button
                type="button"
                onClick={addRequirement}
                className="text-xs font-semibold text-blue-900 hover:text-blue-800 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Requirement</span>
              </button>
            </div>
            <div className="space-y-3.5">
              {requirements.map((req, idx) => (
                <div key={idx} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl relative space-y-2">
                  <button
                    type="button"
                    onClick={() => removeRequirement(idx)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-3 gap-3 pr-8">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase">Requirement Name</label>
                      <input
                        type="text"
                        value={req.name}
                        required
                        placeholder="e.g. DPIIT Recognition"
                        onChange={(e) => updateRequirement(idx, 'name', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase">Type</label>
                      <select
                        value={req.isRequired ? 'true' : 'false'}
                        onChange={(e) => updateRequirement(idx, 'isRequired', e.target.value === 'true')}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
                      >
                        <option value="true">Mandatory</option>
                        <option value="false">Optional</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase">Description / Success Evidence</label>
                    <input
                      type="text"
                      value={req.description}
                      required
                      placeholder="e.g. Certificate upload required"
                      onChange={(e) => updateRequirement(idx, 'description', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-slate-800 text-lg">Step 4 — Evaluation Weight Criteria</h3>
              <button
                type="button"
                onClick={addCriterion}
                className="text-xs font-semibold text-blue-900 hover:text-blue-800 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Criterion</span>
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 divide-y divide-slate-200/80">
              {criteria.map((crit, idx) => (
                <div key={idx} className="flex justify-between items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <input
                    type="text"
                    value={crit.name}
                    required
                    onChange={(e) => updateCriterion(idx, e.target.value, crit.weight)}
                    placeholder="Criterion Name"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white"
                  />
                  <div className="flex items-center space-x-2 w-28">
                    <input
                      type="number"
                      value={crit.weight}
                      required
                      onChange={(e) => updateCriterion(idx, crit.name, Number(e.target.value))}
                      placeholder="Weight"
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-right focus:outline-none focus:border-blue-900 bg-white"
                    />
                    <span className="text-xs text-slate-400 font-medium">%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCriterion(idx)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="text-right text-xs font-semibold text-slate-500 uppercase">
              Total Weight:{' '}
              <span
                className={
                  Math.abs(criteria.reduce((s, c) => s + c.weight, 0) - 100) < 0.1
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }
              >
                {criteria.reduce((s, c) => s + c.weight, 0)}%
              </span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-slate-800 text-lg">Step 5 — Target Success KPIs</h3>
              <button
                type="button"
                onClick={addKpi}
                className="text-xs font-semibold text-blue-900 hover:text-blue-800 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add KPI</span>
              </button>
            </div>
            <div className="space-y-3.5">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl relative space-y-2">
                  <button
                    type="button"
                    onClick={() => removeKpi(idx)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase">KPI Name</label>
                      <input
                        type="text"
                        value={kpi.name}
                        required
                        placeholder="e.g. Average Waiting Time"
                        onChange={(e) => updateKpi(idx, 'name', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase">Measurement Unit</label>
                      <input
                        type="text"
                        value={kpi.unit}
                        required
                        placeholder="e.g. hours"
                        onChange={(e) => updateKpi(idx, 'unit', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pr-8">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase">Baseline</label>
                      <input
                        type="text"
                        value={kpi.baseline}
                        required
                        placeholder="5.2 hours"
                        onChange={(e) => updateKpi(idx, 'baseline', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase">Target Goal</label>
                      <input
                        type="text"
                        value={kpi.target}
                        required
                        placeholder="3.1 hours"
                        onChange={(e) => updateKpi(idx, 'target', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase">Frequency</label>
                      <select
                        value={kpi.frequency}
                        onChange={(e) => updateKpi(idx, 'frequency', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-900 bg-white mt-1"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Milestone-based">Milestone-based</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Step 6 — Review Details</span>
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 divide-y divide-slate-200/60 space-y-4 text-xs">
              <div className="first:pt-0">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Title</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">{title}</span>
              </div>
              <div className="pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Department</span>
                  <span className="font-medium text-slate-700 mt-0.5 block">{department}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Sector</span>
                  <span className="font-medium text-slate-700 mt-0.5 block">{sector}</span>
                </div>
              </div>
              <div className="pt-3">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Estimated Budget</span>
                <span className="font-bold text-slate-800 mt-0.5 block">₹{Number(estimatedBudget).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-3">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Description</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed font-normal">{description}</p>
              </div>
              <div className="pt-3">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Eligibility Requirements ({requirements.length})</span>
                <ul className="list-disc pl-4 mt-1 text-slate-600 space-y-1">
                  {requirements.map((r, i) => (
                    <li key={i}>
                      <span className="font-bold text-slate-700">{r.name}</span> ({r.isRequired ? 'Mandatory' : 'Optional'}) — {r.description}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Target Success KPIs ({kpis.length})</span>
                <ul className="list-disc pl-4 mt-1 text-slate-600 space-y-1">
                  {kpis.map((k, i) => (
                    <li key={i}>
                      <span className="font-bold text-slate-700">{k.name}</span>: Baseline {k.baseline} → Target {k.target} ({k.frequency})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Challenge Formulation Wizard</h1>
          <p className="text-xs text-slate-400">Step {step} of 6 — Define innovation parameters</p>
        </div>
        {/* Progress bar */}
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${step >= i ? 'bg-blue-900' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
            <p className="text-xs text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {renderStep()}

        {/* Wizard Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          {step < 6 ? (
            <button
              onClick={() => {
                setError('');
                // Basic validations before stepping
                if (step === 1 && (!title || !description || !location)) {
                  setError('Please fill in the title, location, and description');
                  return;
                }
                setStep(step + 1);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-950 text-white rounded-lg text-xs font-semibold hover:bg-blue-900 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              {loading ? 'Publishing...' : 'Publish Challenge'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
