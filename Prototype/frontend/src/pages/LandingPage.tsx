import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Zap, Award, BarChart3, Users, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-950 to-blue-900 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* <div className="inline-flex items-center space-x-2 bg-blue-900/60 border border-blue-800 rounded-full px-4 py-1.5 mb-6 text-xs text-amber-400 font-semibold shadow-inner"> */}
            {/* <Sparkles className="w-3.5 h-3.5" /> */}
            {/* <span>SIH 2026 Problem Statement: SIH26136</span> */}
          {/* </div> */}
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            From Government Challenges to Scalable Startup Solutions
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Discover, test, validate and scale innovative solutions through a transparent, evidence-based procurement lifecycle. Empowering startups to solve critical public sector issues safely.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>Explore Challenges</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login?register=true"
              className="w-full sm:w-auto px-8 py-4 bg-blue-900/40 hover:bg-blue-900/70 border border-blue-800 text-white font-semibold text-base rounded-xl transition-all flex items-center justify-center"
            >
              Register as Startup
            </Link>
          </div>
        </div>
      </section>

      {/* Lifecycle Flow Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-950 mb-4">Complete Innovation Procurement Lifecycle</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            GovStart maps the entire process into a secure, structured flow to ensure risk-free public sector integration.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { step: '1', title: 'Challenge', desc: 'Government publishes problem statements' },
            { step: '2', title: 'Discover', desc: 'AI searches and match scores startup pool' },
            { step: '3', title: 'Screen', desc: 'Auto check against eligibility requirements' },
            { step: '4', title: 'Evaluate', desc: 'Experts evaluate candidate scores (0-10)' },
            { step: '5', title: 'Pilot', desc: 'Safe testing sandbox with baseline KPIs' },
            { step: '6', title: 'Validate', desc: 'Independent expert reports on outcomes' },
            { step: '7', title: 'Scale', desc: 'Evidence-based Scale / Extend / Stop decision' },
          ].map((item) => (
            <div key={item.step} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center flex flex-col justify-between items-center relative">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-xs border border-blue-100 mb-3">
                {item.step}
              </div>
              <h3 className="font-bold text-sm text-blue-950 mb-1">{item.title}</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="bg-blue-950 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { icon: Users, value: '1,240+', label: 'Startups Registered' },
            { icon: FileText, value: '286', label: 'Challenges Created' },
            { icon: Zap, value: '94', label: 'Active Pilots in Sandbox' },
            { icon: CheckCircle2, value: '71', label: 'Solutions Scaled' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="p-3 bg-blue-900/60 rounded-full mb-3 text-amber-500">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white block mb-1">{stat.value}</span>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">{stat.label}</span>
              <span className="text-[9px] text-slate-500 italic mt-0.5 block">Demo statistics</span>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features / For Roles */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* For Government */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-blue-950 mb-4 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-900" />
              <span>For Government Departments</span>
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Define innovation challenges, configure eligibility constraints, discover deep-tech solutions via matching filters, evaluate using panel feedback, monitor pilots, and execute evidence-based scale ups.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Multi-step Challenge Creation Wizard</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI-assisted Startup Suitability matching</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Relational Sandbox & Milestone Performance tracking</span>
              </li>
            </ul>
          </div>

          {/* For Startups */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-blue-950 mb-4 flex items-center space-x-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>For Innovative Startups</span>
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Find government problems tailored to your technologies, track application status, undergo screening, test your solutions in secure sandboxes, and secure milestones-linked payments directly.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Seamless Profile builder & credential documents library</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automated real-time eligibility status checks</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Secure pilot sandboxes with milestone payment status tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-center text-xs">
        <p className="font-semibold text-slate-300">GovStart Platform — Developed for Smart India Hackathon 2026</p>
        <p className="mt-1 text-slate-500">Government Procurement Sandbox and Lifecycle Innovation Tracker</p>
      </footer>
    </div>
  );
};
