import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import { listAgents } from '../../services/api';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function AgentsPage() {
  const [search, setSearch] = useState('');
  const [agents, setAgents] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAgents({ limit: 100 })
      .then((res) => { setAgents(res.agents as Row[]); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = agents.filter((a: Row) => {
    const q = search.toLowerCase();
    return !q || (a.userName || '').toLowerCase().includes(q) || (a.referralCode || '').toLowerCase().includes(q);
  });

  const totalEarnings = agents.reduce((s: number, a: Row) => s + (a.earnings || 0), 0);
  const totalReferrals = agents.reduce((s: number, a: Row) => s + (a.totalCustomerReferrals || 0) + (a.totalProviderReferrals || 0), 0);

  const columns = [
    {
      key: 'user', header: 'Agent',
      render: (a: Row) => (
        <div className="flex items-center gap-3">
          <Avatar name={a.userName || a.userEmail || '?'} size="sm" />
          <div>
            <p className="font-medium text-gray-800 text-sm">{a.userName}</p>
            <Badge variant={a.userType === 'provider' ? 'info' : 'gold'} className="text-[9px]">{a.userType}</Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'code', header: 'Referral Code',
      render: (a: Row) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{a.referralCode || '—'}</span>
      ),
    },
    {
      key: 'referrals', header: 'Referrals',
      render: (a: Row) => (
        <div>
          <p className="text-sm font-medium">{(a.totalCustomerReferrals || 0) + (a.totalProviderReferrals || 0)} total</p>
          <p className="text-xs text-gray-500">{a.totalCustomerReferrals || 0}C · {a.totalProviderReferrals || 0}P</p>
        </div>
      ),
    },
    {
      key: 'earnings', header: 'Earnings',
      render: (a: Row) => (
        <div>
          <p className="text-sm font-semibold text-green-600">₦{(a.earnings || 0).toLocaleString()}</p>
          {(a.pendingEarnings || 0) > 0 && (
            <p className="text-xs text-amber-600">+₦{(a.pendingEarnings || 0).toLocaleString()} pending</p>
          )}
        </div>
      ),
    },
    {
      key: 'regFee', header: 'Reg. Fee',
      render: (a: Row) => <span className="text-sm">₦{(a.registrationFee || 0).toLocaleString()}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (a: Row) => <Badge variant={a.isActive ? 'success' : 'default'}>{a.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'joined', header: 'Joined',
      render: (a: Row) => <span className="text-xs text-gray-500">{fmtDate(a.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Agents">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#165B43]">{loading ? '...' : total}</p>
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
            ₦{agents.reduce((s: number, a: Row) => s + (a.pendingEarnings || 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Payouts</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search agents..." className="w-64" />
        <p className="text-xs text-gray-500">{loading ? 'Loading...' : `${filtered.length} agent${filtered.length !== 1 ? 's' : ''}`}</p>
      </div>

      <Table columns={columns} data={filtered} rowKey={(a) => a._id || a.id} emptyText={loading ? 'Loading agents...' : 'No agents found'} />
    </Layout>
  );
}
