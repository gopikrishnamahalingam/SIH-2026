import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, MapPin, Calendar, Users, Globe, FileText, CheckCircle2, ShieldCheck, Award, TrendingUp } from 'lucide-react';
import { Startup } from '../types';

export const StartupProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/startups/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setStartup(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Startup profile not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      {/* Top Banner Profile Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-xl shadow-inner">
            {startup.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{startup.name}</h1>
            <p className="text-xs text-slate-400 font-medium flex items-center mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {startup.location}
            </p>
          </div>
        </div>

        <div className="text-center md:text-right">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Profile Completeness
          </span>
          <span className="text-2xl font-black text-blue-900 mt-1 block">
            {startup.profileCompleteness}%
          </span>
          <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div className="bg-blue-900 h-full" style={{ width: `${startup.profileCompleteness}%` }} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Overview & Case Studies */}
        <div className="lg:col-span-2 space-y-6">
          {/* About / Tech details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm mb-3">Core Sectors</h3>
              <div className="flex flex-wrap gap-1.5">
                {startup.sectors.map((s, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-blue-50 text-blue-900 font-semibold border border-blue-100 rounded-md text-xs">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-800 text-sm mb-3">Technology Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {startup.technologies.map((t, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-slate-100 text-slate-500 font-semibold rounded-md text-xs">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Deployment History / Case Studies */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2.5">
              Previous Deployments & Case Studies
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 border border-slate-100 rounded-xl">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 uppercase tracking-wider mb-2">
                  Completed Sandbox
                </span>
                <h4 className="font-bold text-sm text-slate-800">
                  Mandi Queue Scheduler (Karnal, Haryana)
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Deployed scheduling modules at 2 grain mandis on a 60-day trial basis. Successfully managed arrivals for over 1,200 harvest trucks, shortening processing wait times by 38% compared to paper logs.
                </p>
                <div className="flex items-center space-x-3.5 text-[10px] text-slate-400 mt-3">
                  <span className="flex items-center font-medium">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    1,200+ Farmers Served
                  </span>
                  <span className="flex items-center font-medium">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    38% Queue Reduction
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Compliance & Documents */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm divide-y divide-slate-100">
            <div className="flex items-center justify-between pb-3.5">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                Founded
              </span>
              <span className="font-bold text-slate-800 text-xs">{startup.founded}</span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-slate-400" />
                Team Size
              </span>
              <span className="font-bold text-slate-800 text-xs">{startup.teamSize} Employees</span>
            </div>
            <div className="flex items-center justify-between pt-3.5">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center">
                <Globe className="w-4 h-4 mr-1.5 text-slate-400" />
                Website
              </span>
              <a
                href={startup.website}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-900 text-xs hover:underline"
              >
                {startup.website.replace('https://', '')}
              </a>
            </div>
          </div>

          {/* Compliance Verification Documents */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center">
              <ShieldCheck className="w-4.5 h-4.5 mr-1.5 text-blue-900" />
              Compliance Documents
            </h3>
            
            <div className="space-y-3">
              {startup.documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No documents uploaded.</p>
              ) : (
                startup.documents.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl">
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="text-xs font-bold text-slate-700 truncate block leading-tight">{doc.name}</span>
                      <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-900 hover:underline flex items-center mt-1">
                        <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Download Certificate
                      </a>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      doc.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : doc.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
