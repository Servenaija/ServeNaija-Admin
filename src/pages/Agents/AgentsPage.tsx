import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import Button from '../../components/UI/Button';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { listAgents } from '../../services/api';
import { getAgentPayoutQueue, releaseAgentPayout, releaseBulkAgentPayouts, type AgentPayoutRow } from '../../services/adminOps';
import toast from 'react-hot-toast';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtN = (n: number) => `₦${(n || 0).toLocaleString()}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function AgentsPage() {
  const [search, setSearch] = useState('');
  const [agents, setAgents] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Agent payout queue state
  const [payoutQueue, setPayoutQueue] = useState<AgentPayoutRow[]>([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [payMode, setPayMode] = useState<'all' | 'selected' | 'each' | null>(null);
  const [payToAgentId, setPayToAgentId] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    listAgents({ limit: 100 })
      .then((res) => { setAgents(res.agents as Row[]); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));

    loadPayoutQueue();
  }, []);

  const loadPayoutQueue = async () => {
    setPayoutLoading(true);
    try {
      const res = await getAgentPayoutQueue({ limit: 100 });
      setPayoutQueue(res.items as AgentPayoutRow[]);
      setPayoutTotal(res.payoutTotal);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPayoutLoading(false);
    }
  };

  const doPayEach = (agentId: string) => { setPayToAgentId(agentId); setPayMode('each'); };

  const doPaySelected = () => {
    if (!selected.length) return;
    setPayMode('selected');
  };

  const doPayAll = () => { setPayMode('all'); };

  const confirmPay = async () => {
    setReleasing(true);
    try {
      if (payMode === 'each' && payToAgentId) {
        const res = await releaseAgentPayout(payToAgentId, 'Agent payout via admin');
        toast.success(`Paid ₦{(res.result as any)?.amount || 0}.`);
        setPayToAgentId(null);
        setPayMode(null);
        await loadPayoutQueue();
      } else if (payMode === 'selected') {
        const res = await releaseBulkAgentPayouts({ items: selected, note: 'Agent payout via admin' });
        toast.success(res.message || 'Selected agents paid.');
        setSelected([]);
        setPayMode(null);
        await loadPayoutQueue();
      } else if (payMode === 'all') {
        const res = await releaseBulkAgentPayouts({ releaseAll: true, note: 'Agent payout via admin' });
        toast.success(res.message || 'All agents paid.');
        setSelected([]);
        setPayMode(null);
        await loadPayoutQueue();
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setReleasing(false);
      setPayMode(null);
      setPayToAgentId(null);
    }
  };

  const filtered = payoutQueue.filter((a) => {
    const q = search.toLowerCase();
    return !q ||
      (a.userDetails?.fullName || '').toLowerCase().includes(q) ||
      (a.agentCode || '').toLowerCase().includes(q);
  });

  const totalEarnings = agents.reduce((s: number, a: Row) => s + (a.earnings || 0), 0);
  const totalReferrals = agents.reduce((s: number, a: Row) => s + (a.totalCustomerReferrals || 0) + (a.totalProviderReferrals || 0), 0);

  const selTotal = payoutQueue
    .filter((a) => selected.includes(a.agentId))
    .reduce((s, a) => s + a.totalOwed, 0);

  const columns = [
    {
      key: 'select', header: '',
      width: '60px',
      render: (a: AgentPayoutRow) => {
        const isSelected = selected.includes(a.agentId);
        return (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {
              if (isSelected) setSelected(selected.filter((id) => id !== a.agentId));
              else setSelected([...selected, a.agentId]);
            }}
            className="w-4 h-4 accent-[#165B43]"
          />
        );
      },
    },
    {
      key: 'user', header: 'Agent',
      render: (a: AgentPayoutRow) => (
        <div className="flex items-center gap-3">
          <Avatar name={a.userDetails?.fullName || a.agentCode || '?'} size="sm" />
          <div>
            <p className="font-medium text-gray-800 text-sm">{a.userDetails?.fullName || a.agentCode}</p>
            <Badge variant={a.userType === 'provider' ? 'info' : 'gold'} className="text-[9px]">{a.userType}</Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'code', header: 'Referral Code',
      render: (a: AgentPayoutRow) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{a.agentCode || '—'}</span>
      ),
    },
    {
      key: 'referrals', header: 'Referrals',
      render: (a: AgentPayoutRow) => (
        <div>
          <p className="text-sm font-medium">{a.totalReferrals} total</p>
          <p className="text-xs text-gray-500">{a.totalCustomerReferrals}C · {a.totalProviderReferrals}P</p>
        </div>
      ),
    },
    {
      key: 'earnings', header: 'Earnings',
      render: (a: AgentPayoutRow) => (
        <div>
          <p className="text-sm font-semibold text-green-600">{fmtN(a.totalEarned)}</p>
          {a.pendingPayout > 0 && (
            <p className="text-xs text-amber-600">+{fmtN(a.pendingPayout)} pending</p>
          )}
        </div>
      ),
    },
    {
      key: 'owed', header: 'Total Owed',
      render: (a: AgentPayoutRow) => (
        <div>
          <p className="text-sm font-bold text-red-600">{fmtN(a.totalOwed)}</p>
          <p className="text-[10px] text-gray-400">
            {a.userType === 'provider' && a.bankDetails?.accountNumber
              ? `Bank: ${a.bankDetails.accountNumber}`
              : 'Wallet credit'}
          </p>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (a: AgentPayoutRow) => <Badge variant={a.isActive ? 'success' : 'default'}>{a.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'action', header: 'Pay',
      render: (a: AgentPayoutRow) => (
        <Button
          variant="primary"
          size="sm"
          disabled={releasing}
          onClick={(e) => { e.stopPropagation(); doPayEach(a.agentId); }}
        >
          Pay {fmtN(a.totalOwed)}
        </Button>
      ),
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
          <p className="text-2xl font-bold text-amber-500">{fmtN(payoutTotal)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Owed to Agents</p>
        </div>
      </div>

      {/* Payout action bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search agents..." className="w-64" />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">{loading ? 'Loading...' : `${filtered.length} agent${filtered.length !== 1 ? 's' : ''}`}</p>
          {selected.length > 0 && (
            <Button variant="secondary" size="sm" disabled={releasing} onClick={doPaySelected}>
              Pay selected ({selected.length}) · {fmtN(selTotal)}
            </Button>
          )}
          <Button variant="primary" size="sm" disabled={releasing || payoutQueue.length === 0} onClick={doPayAll}>
            Pay all · {fmtN(payoutTotal)}
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey={(a) => a.agentId}
        emptyText={payoutLoading ? 'Loading payout queue...' : 'No agents with pending earnings'}
      />

      {/* Confirmation dialogs */}
      {payMode === 'each' && payToAgentId && (
        <ConfirmDialog
          open={true}
          title="Pay agent?"
          message={`Pay ₦{(payoutQueue.find((a) => a.agentId === payToAgentId)?.totalOwed || 0).toLocaleString()} to this agent? Their earnings will be reset to zero.`}
          confirmLabel="Pay Now"
          onCancel={() => { setPayMode(null); setPayToAgentId(null); }}
          onConfirm={confirmPay}
          variant="primary"
          loading={releasing}
        />
      )}

      {payMode === 'selected' && (
        <ConfirmDialog
          open={true}
          title="Pay selected agents?"
          message={`Pay ${selected.length} agent(s) totalling ${fmtN(selTotal)}? Their earnings will be reset to zero.`}
          confirmLabel="Pay All Selected"
          onCancel={() => { setPayMode(null); }}
          onConfirm={confirmPay}
          variant="primary"
          loading={releasing}
        />
      )}

      {payMode === 'all' && (
        <ConfirmDialog
          open={true}
          title="Pay all agents?"
          message={`Pay all ${payoutQueue.length} agent(s) totalling ${fmtN(payoutTotal)}? All agent earnings will be reset to zero.`}
          confirmLabel="Pay All"
          onCancel={() => { setPayMode(null); }}
          onConfirm={confirmPay}
          variant="primary"
          loading={releasing}
        />
      )}
    </Layout>
  );
}
