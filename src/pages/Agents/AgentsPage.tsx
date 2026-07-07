import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import { mockAgents } from '../../data/mock';
import type { Agent } from '../../types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AgentsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockAgents.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.userName.toLowerCase().includes(q) || a.referralCode.toLowerCase().includes(q);
  });

  const totalEarnings = mockAgents.reduce((s, a) => s + a.earnings, 0);
  const totalReferrals = mockAgents.reduce((s, a) => s + a.totalCustomerReferrals + a.totalProviderReferrals, 0);

  const columns = [
    {
      key: 'user', header: 'Agent',
      render: (a: Agent) => (
        <div className="flex items-center gap-3">
          <Avatar name={a.userName} size="sm" />
          <div>
            <p className="font-medium text-gray-800 text-sm">{a.userName}</p>
            <Badge variant={a.userType === 'provider' ? 'info' : 'gold'} className="text-[9px]">{a.userType}</Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'code', header: 'Referral Code',
      render: (a: Agent) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{a.referralCode}</span>
      ),
    },
    {
      key: 'referrals', header: 'Referrals',
      render: (a: Agent) => (
        <div>
          <p className="text-sm font-medium">{a.totalCustomerReferrals + a.totalProviderReferrals} total</p>
          <p className="text-xs text-gray-500">{a.totalCustomerReferrals}C · {a.totalProviderReferrals}P</p>
        </div>
      ),
    },
    {
      key: 'earnings', header: 'Earnings',
      render: (a: Agent) => (
        <div>
          <p className="text-sm font-semibold text-green-600">₦{a.earnings.toLocaleString()}</p>
          {a.pendingEarnings > 0 && (
            <p className="text-xs text-amber-600">+₦{a.pendingEarnings.toLocaleString()} pending</p>
          )}
        </div>
      ),
    },
    {
      key: 'regFee', header: 'Reg. Fee',
      render: (a: Agent) => <span className="text-sm">₦{a.registrationFee.toLocaleString()}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (a: Agent) => <Badge variant={a.isActive ? 'success' : 'default'}>{a.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'joined', header: 'Joined',
      render: (a: Agent) => <span className="text-xs text-gray-500">{fmtDate(a.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Agents">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#165B43]">{mockAgents.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Agents</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">₦{totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Paid Out</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{totalReferrals}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Referrals</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-amber-500">
            ₦{mockAgents.reduce((s, a) => s + a.pendingEarnings, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Payouts</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search agents..." className="w-64" />
        <p className="text-xs text-gray-500">{filtered.length} agent{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <Table columns={columns} data={filtered} rowKey={(a) => a.id} emptyText="No agents found" />
    </Layout>
  );
}
