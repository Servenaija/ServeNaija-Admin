import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoIcon from '../../assets/logo.png';
import logoText from '../../assets/serveNaija-text.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { ok, error: err } = await login(email.trim(), password);
    if (ok) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(err || 'Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Left panel – branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #165B43 0%, #0c3d2c 60%, #091e17 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: '#D6A643' }} />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full opacity-10"
          style={{ background: '#D6A643' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={logoIcon} alt="ServeNaija" className="w-11 h-11 rounded-full object-cover" style={{ boxShadow: '0 0 0 2px rgba(214,166,67,0.6)' }} />
          <img src={logoText} alt="ServeNaija" className="h-6 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            The Control Centre<br />
            <span style={{ color: '#D6A643' }}>for Everything.</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-8 max-w-sm">
            Manage providers, customers, bookings, KYC verification, payments, and real-time chat — all in one place.
          </p>
          {/* Feature list */}
          <div className="space-y-3">
            {[
              'Provider & customer lifecycle management',
              'KYC verification via Dojah (NIN, BVN, Passport)',
              'Real-time booking dispute resolution',
              'In-app messaging & call management',
              'Marketplace orders, stores & products',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(214,166,67,0.2)', border: '1px solid rgba(214,166,67,0.4)' }}>
                  <ChevronRight size={10} style={{ color: '#D6A643' }} />
                </div>
                <span className="text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          © 2026 ServeNaija. All rights reserved.
        </p>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <img src={logoIcon} alt="ServeNaija" className="w-10 h-10 rounded-full object-cover" style={{ boxShadow: '0 0 0 2px rgba(22,91,67,0.3)' }} />
            <img src={logoText} alt="ServeNaija" className="h-6 object-contain" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Header */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: 'rgba(22,91,67,0.08)', color: '#165B43' }}>
                <Shield size={12} />
                Admin Access Only
              </div>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to your admin dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ '--tw-ring-color': 'rgba(22,91,67,0.3)' } as React.CSSProperties}
                  placeholder="Enter admin password"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 pr-12 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': 'rgba(22,91,67,0.3)' } as React.CSSProperties}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: loading ? '#165B43' : 'linear-gradient(135deg, #165B43 0%, #1e7a5a 100%)' }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in to Dashboard'
                )}
              </button>
            </form>

            
          </div>
        </div>
      </div>
    </div>
  );
}
