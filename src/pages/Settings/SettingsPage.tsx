import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useApp } from '../../context/AppContext';
import { Save, CheckCircle, Eye, EyeOff, Shield, Settings2, DollarSign, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { adminName, adminEmail } = useApp();
  const [tab, setTab] = useState<'profile' | 'platform' | 'fees' | 'security'>('profile');

  const [profile, setProfile] = useState({ name: adminName, email: adminEmail, phone: '+234 901 234 5678' });
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);

  const [fees, setFees] = useState({
    platformFee: 500,
    agentCustomerCommission: 500,
    agentProviderCommission: 1000,
    agentRegistrationFee: 5000,
  });

  const [platformSettings, setPlatformSettings] = useState({
    kycAutoApproval: true,
    requireKYCToBook: true,
    requireKYCToGetPaid: true,
    maintenanceMode: false,
    maxBookingAdvanceDays: 30,
    platformName: 'ServeNaija',
    supportEmail: 'support@servenaija.ng',
    supportPhone: '+234 800 SERVE NAIJA',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = ['profile', 'platform', 'fees', 'security'] as const;

  return (
    <Layout title="Settings">
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
              tab === t ? 'border-[#165B43] text-[#165B43]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="max-w-lg">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 size={15} className="text-gray-500" />
                <p className="font-semibold text-sm">Admin Profile</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20" />
              </div>
              <Button icon={saved ? <CheckCircle size={14} /> : <Save size={14} />} variant={saved ? 'secondary' : 'primary'} onClick={handleSave}>
                {saved ? 'Saved!' : 'Save Profile'}
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Platform Settings Tab */}
      {tab === 'platform' && (
        <div className="max-w-lg">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-gray-500" />
                <p className="font-semibold text-sm">Platform Settings</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Platform Name</label>
                <input type="text" value={platformSettings.platformName} onChange={(e) => setPlatformSettings(s => ({ ...s, platformName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Support Email</label>
                <input type="email" value={platformSettings.supportEmail} onChange={(e) => setPlatformSettings(s => ({ ...s, supportEmail: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Support Phone</label>
                <input type="tel" value={platformSettings.supportPhone} onChange={(e) => setPlatformSettings(s => ({ ...s, supportPhone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Max Booking Advance (days)</label>
                <input type="number" value={platformSettings.maxBookingAdvanceDays} onChange={(e) => setPlatformSettings(s => ({ ...s, maxBookingAdvanceDays: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20" />
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                {[
                  { key: 'kycAutoApproval', label: 'Auto-approve KYC via Dojah', desc: 'Automatically approve when face match score > 85%' },
                  { key: 'requireKYCToBook', label: 'Require KYC to Book Services', desc: 'Providers must be KYC verified before accepting jobs' },
                  { key: 'requireKYCToGetPaid', label: 'Require KYC for Payouts', desc: 'Providers must be KYC verified to withdraw earnings' },
                  { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Block all user activity on the platform' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <button
                      onClick={() => setPlatformSettings(s => ({ ...s, [key]: !s[key as keyof typeof s] }))}
                      className={`relative inline-flex h-5 w-9 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                        platformSettings[key as keyof typeof platformSettings] ? 'bg-[#165B43]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        platformSettings[key as keyof typeof platformSettings] ? 'translate-x-4' : ''
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <Button icon={saved ? <CheckCircle size={14} /> : <Save size={14} />} variant={saved ? 'secondary' : 'primary'} onClick={handleSave}>
                {saved ? 'Saved!' : 'Save Settings'}
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Fees Tab */}
      {tab === 'fees' && (
        <div className="max-w-lg">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign size={15} className="text-gray-500" />
                <p className="font-semibold text-sm">Platform Fees & Commissions</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { key: 'platformFee', label: 'Platform Fee per Booking', desc: 'Flat fee charged on each booking (NGN)' },
                { key: 'agentCustomerCommission', label: 'Agent Commission (Customer Referral)', desc: 'Paid to agent when referred customer makes first booking (NGN)' },
                { key: 'agentProviderCommission', label: 'Agent Commission (Provider Referral)', desc: 'Paid to agent when referred provider completes first job (NGN)' },
                { key: 'agentRegistrationFee', label: 'Agent Registration Fee', desc: 'One-time fee paid by new agents (NGN)' },
              ].map(({ key, label, desc }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">{label}</label>
                  <p className="text-xs text-gray-500 mb-1">{desc}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">₦</span>
                    <input
                      type="number"
                      value={fees[key as keyof typeof fees]}
                      onChange={(e) => setFees(f => ({ ...f, [key]: Number(e.target.value) }))}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20"
                    />
                  </div>
                </div>
              ))}
              <Button icon={saved ? <CheckCircle size={14} /> : <Save size={14} />} variant={saved ? 'secondary' : 'primary'} onClick={handleSave}>
                {saved ? 'Saved!' : 'Save Fees'}
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="max-w-lg">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-gray-500" />
                <p className="font-semibold text-sm">Change Password</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { key: 'current', label: 'Current Password' },
                { key: 'newPass', label: 'New Password' },
                { key: 'confirm', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password[key as keyof typeof password]}
                      onChange={(e) => setPassword(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              {password.newPass && password.confirm && password.newPass !== password.confirm && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              <Button
                icon={saved ? <CheckCircle size={14} /> : <Save size={14} />}
                variant={saved ? 'secondary' : 'primary'}
                onClick={handleSave}
                disabled={!password.current || !password.newPass || password.newPass !== password.confirm}
              >
                {saved ? 'Password Updated!' : 'Update Password'}
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </Layout>
  );
}
