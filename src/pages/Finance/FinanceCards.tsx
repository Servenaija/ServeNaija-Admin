import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import { Badge } from '../../components/UI/Badge';
import Avatar from '../../components/UI/Avatar';
import { getFinanceOverview } from '../../services/adminOps';
import ProviderJobsModal from '../../components/UI/ProviderJobsModal';
import { Wallet, ArrowUpRight, Users, TrendingUp, Crown, Star } from 'lucide-react';
import toast from 'react-hot-toast';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
export const fmtN = (n: number) => `₦${(Number(n) || 0).toLocaleString()}`;

const rankColors = ['#D6A643', '#9ca3af', '#b45309'];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span
        className="min-w-7 h-7 px-2 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ backgroundColor: rankColors[rank - 1] }}
      >
        #{rank}
      </span>
    );
  }
  return <span className="min-w-7 h-7 px-2 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">#{rank}</span>;
}

export function FinanceCards({ finance }: { finance: Row | null }) {
  const [showAll, setShowAll] = useState(false);
  const [jobsFor, setJobsFor] = useState<string | null>(null);
  if (!finance) return null;
  const ranked: Row[] = finance.rankedProviders || [];
  const visibleRanks = showAll ? ranked : ranked.slice(0, 10);
  const customerWallets: Row[] = finance.customerWallets || [];
  const totalJobs = ranked.reduce((s, r) => s + (r.jobs || 0), 0);
  const totalOrders = ranked.reduce((s, r) => s + (r.orders || 0), 0);
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1"><Wallet size={16} className="text-[#165B43]" /><p className="text-xs font-semibold text-gray-600">Paystack Available</p></div>
          <p className="text-xl font-bold text-gray-800">{fmtN(finance?.paystack?.available ?? 0)}</p>
          {finance?.paystack?.unavailable && <p className="text-[11px] text-amber-600">Live balance unavailable</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1"><ArrowUpRight size={16} className="text-red-500" /><p className="text-xs font-semibold text-gray-600">Total Withdrawn</p></div>
          <p className="text-xl font-bold text-gray-800">{fmtN(finance?.totals?.totalWithdrawn ?? 0)}</p>
          <p className="text-[11px] text-gray-500">{finance?.totals?.withdrawalCount ?? 0} withdrawals</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-green-600" /><p className="text-xs font-semibold text-gray-600">All-Time Volume</p></div>
          <p className="text-xl font-bold text-gray-800">{fmtN(finance?.totals?.allTimeVolume ?? 0)}</p>
          <p className="text-[11px] text-gray-500">{finance?.totals?.allTimeCount ?? 0} credits</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1"><Users size={16} className="text-blue-500" /><p className="text-xs font-semibold text-gray-600">Wallet Totals</p></div>
          <p className="text-sm text-gray-700">Customers: <b>{fmtN(finance?.totals?.customerBalanceTotal ?? 0)}</b></p>
          <p className="text-sm text-gray-700">Providers: <b>{fmtN(finance?.totals?.providerBalanceTotal ?? 0)}</b></p>
        </div>
      </div>
      {/* Ranked earners — ALL providers, with photos */}
      <Card className="mb-5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm flex items-center gap-1"><Crown size={14} className="text-[#D6A643]" /> Earnings Ranking — {ranked.length} providers · {totalJobs} jobs · {totalOrders} orders</p>
            {ranked.length > 10 && (
              <button onClick={() => setShowAll(!showAll)} className="text-xs text-[#165B43] font-semibold hover:underline">
                {showAll ? 'Show top 10' : `Show all ${ranked.length}`}
              </button>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {ranked.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No job or order volume yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {visibleRanks.map((r: Row) => (
                <div key={r.provider?._id} onClick={() => setJobsFor(r.provider?._id)} className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <RankBadge rank={r.rank} />
                  <Avatar name={r.provider?.fullName || '?'} src={r.provider?.profilePhoto} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.provider?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{r.jobs} jobs · {r.orders} orders · {fmtN(r.volume)} volume</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#D6A643]">{r.totalWork} total</p>
                    {r.provider?.rating != null && (
                      <p className="text-xs text-gray-400 flex items-center gap-0.5 justify-end"><Star size={10} className="text-[#D6A643]" /> {Number(r.provider.rating).toFixed(1)}</p>
                    )}
                  </div>
                  {r.rank === 1 && <Badge variant="gold" className="text-[9px]">Top earner</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Customer wallet balances */}
      <Card>
        <CardHeader><p className="font-semibold text-sm">Customer wallet balances ({customerWallets.length})</p></CardHeader>
        <CardBody className="p-0">
          {customerWallets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No customer wallets holding a balance.</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {customerWallets.map((c: Row) => (
                <div key={c.customerId} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={c.fullName || '?'} src={c.profilePhoto} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{c.phoneNumber || c.email}</p>
                  </div>
                  <p className="text-sm font-bold text-green-600">{fmtN(c.balance)}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <ProviderJobsModal providerId={jobsFor} onClose={() => setJobsFor(null)} />
    </>
  );
}

export function useFinance() {
  const [finance, setFinance] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      setFinance(await getFinanceOverview());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  return { finance, loading, reload: load };
}

export default function FinanceOverviewPage() {
  const { finance, loading } = useFinance();
  return (
    <Layout title="Finance Overview">
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#165B43] border-t-transparent" /></div>
      ) : <FinanceCards finance={finance} />}
    </Layout>
  );
}
