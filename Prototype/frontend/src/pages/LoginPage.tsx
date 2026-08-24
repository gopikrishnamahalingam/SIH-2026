import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Users, ArrowRight, UserCheck } from 'lucide-react';
import { Role } from '../types';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [searchParams] = useSearchParams();
  const isRegister = searchParams.get('register') === 'true';
  const navigate = useNavigate();

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('STARTUP');
  const [regStartupName, setRegStartupName] = useState('');
  const [regSector, setRegSector] = useState('Agriculture');

  const demoAccounts = [
    { label: 'Government Officer', email: 'government@govstart.demo', role: 'GOVERNMENT' },
    { label: 'Startup Founder', email: 'startup@govstart.demo', role: 'STARTUP' },
    { label: 'Expert Evaluator', email: 'expert@govstart.demo', role: 'EXPERT' },
    { label: 'System Admin', email: 'admin@govstart.demo', role: 'ADMIN' },
  ];

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'password123' }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onLoginSuccess(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onLoginSuccess(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regName) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          name: regName,
          role: regRole,
          startupName: regStartupName,
          sector: regSector,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      onLoginSuccess(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Shield className="mx-auto h-12 w-12 text-blue-900" />
        <h2 className="mt-6 text-3xl font-extrabold text-slate-800">
          {isRegister ? 'Register on GovStart' : 'Sign in to GovStart'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button onClick={() => navigate('/login')} className="font-semibold text-blue-900 hover:text-blue-800 underline">
                Sign in
              </button>
            </span>
          ) : (
            <span>
              New to GovStart?{' '}
              <button onClick={() => navigate('/login?register=true')} className="font-semibold text-blue-900 hover:text-blue-800 underline">
                Register as Startup
              </button>
            </span>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-lg">
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          {isRegister ? (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Singh"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@organization.gov.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Account Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as Role)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900"
                >
                  <option value="STARTUP">Startup Founder</option>
                  <option value="GOVERNMENT">Government Officer</option>
                  <option value="EXPERT">Expert Evaluator</option>
                </select>
              </div>

              {regRole === 'STARTUP' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Startup Name</label>
                    <input
                      type="text"
                      required
                      placeholder="AgriWait Solutions"
                      value={regStartupName}
                      onChange={(e) => setRegStartupName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sector</label>
                    <select
                      value={regSector}
                      onChange={(e) => setRegSector(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-900"
                    >
                      <option value="Agriculture">Agriculture</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Transport">Transport & Logistics</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none transition-colors"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@govstart.demo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                  <button type="button" className="text-xs font-medium text-blue-900 hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Quick Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-4 flex items-center justify-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>SIH Live Demo - Quick Sign In</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleQuickLogin(account.email)}
                  disabled={loading}
                  className="flex flex-col items-start p-2.5 border border-slate-200 hover:border-blue-900 hover:bg-blue-50/20 rounded-lg text-left transition-all group"
                >
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{account.role}</span>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-900 leading-tight">
                    {account.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3.5 italic leading-normal">
              Clicking these will bypass authentication to let you immediately evaluate the role-based dashboards. Password is "password123".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
