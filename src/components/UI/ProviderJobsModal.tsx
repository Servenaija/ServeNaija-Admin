import { useEffect, useState } from 'react';
import Modal from './Modal';
import { Badge } from './Badge';
import Avatar from './Avatar';
import Pagination from './Pagination';
import { getProviderJobs } from '../../services/adminOps';
import { fmtN } from '../../pages/Finance/FinanceCards';
import { Star, ShoppingBag, Briefcase } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const bookingVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default' | 'gold'> = {
  pending: 'warning', accepted: 'info', completed: 'success', cancelled: 'danger',
  'in-progress': 'gold', disputed: 'danger', declined: 'danger',
};
const orderVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default' | 'gold'> = {
  pending: 'warning', confirmed: 'info', processing: 'gold', shipped: 'info',
  delivered: 'success', cancelled: 'danger', refunded: 'gold',
};
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString() : '—');

const PAGE_SIZE = 10;

export default function ProviderJobsModal({ providerId, onClose }: { providerId: string | null; onClose: () => void }) {
  const [data, setData] = useState<Row | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'jobs' | 'orders' | 'reviews'>('jobs');
  const [jobPage, setJobPage] = useState(0);
  const [orderPage, setOrderPage] = useState(0);

  // Jobs + orders are fetched together; page controls which offset. We refetch
  // when either changes using the max of the two pages so both lists stay fresh.
  const activePage = Math.max(jobPage, orderPage);
  const load = () => {
    if (!providerId) return;
    setLoading(true);
    getProviderJobs(providerId, { page: activePage, limit: PAGE_SIZE })
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setJobPage(0); setOrderPage(0); setTab('jobs'); }, [providerId]);
  useEffect(() => { load(); }, [providerId, activePage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!providerId) return null;
  const p = data?.provider || {};

  return (
    <Modal open={!!providerId} onClose={onClose} title={p.fullName ? `${p.fullName} — all work` : 'Provider work'} size="xl">
      {loading || !data ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#165B43] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header summary */}
          <div className="flex items-center gap-4">
            <Avatar name={p.fullName || '?'} src={p.profilePhoto || p.profile?.photo} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{p.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{p.email} · {p.phoneNumber}</p>
            </div>
            <div className="flex gap-4 text-center">
              <div><p className="text-lg font-bold text-gray-800">{data.totals?.jobs ?? 0}</p><p className="text-[11px] text-gray-500">Jobs</p></div>
              <div><p className="text-lg font-bold text-gray-800">{data.totals?.orders ?? 0}</p><p className="text-[11px] text-gray-500">Orders</p></div>
              <div><p className="text-lg font-bold text-[#D6A643]">{data.totals?.reviews ?? 0}</p><p className="text-[11px] text-gray-500">Reviews</p></div>
              {(p.avgRating != null || p.rating != null) && (
                <div><p className="text-lg font-bold text-[#D6A643] flex items-center gap-1 justify-center"><Star size={14} />{Number(p.avgRating ?? p.rating ?? 0).toFixed(1)}</p><p className="text-[11px] text-gray-500">Rating</p></div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-100">
            {([
              ['jobs', `Jobs (${data.jobsPagination?.total ?? 0})`, Briefcase],
              ['orders', `Orders (${data.ordersPagination?.total ?? 0})`, ShoppingBag],
              ['reviews', `Reviews (${data.reviews?.length ?? 0})`, Star],
            ] as const).map(([key, label, Icon]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px ${tab === key ? 'border-[#165B43] text-[#165B43]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          {tab === 'jobs' && (
            <div className="space-y-2">
              {(data.jobs || []).length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No jobs yet.</p> :
                data.jobs.map((j: Row) => (
                  <div key={j._id} className="border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{j.service?.name || 'Service'}</p>
                      <p className="text-xs text-gray-500">{j.customer?.fullName || 'Customer'} · {fmtDate(j.createdAt)}</p>
                    </div>
                    <span className="text-sm font-semibold">{fmtN(j.serviceFee || j.totalAmount)}</span>
                    <Badge variant={bookingVariant[j.status] || 'default'}>{String(j.status).replace(/-/g, ' ')}</Badge>
                  </div>
                ))}
              {(data.jobsPagination?.totalPages ?? 1) > 1 && (
                <Pagination page={jobPage} totalPages={data.jobsPagination.totalPages} onChange={setJobPage} />
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-2">
              {(data.orders || []).length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No marketplace orders yet.</p> :
                data.orders.map((o: Row) => (
                  <div key={o._id} className="border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{(o.items || []).length} item(s) · {o.buyer?.fullName || 'Buyer'}</p>
                      <p className="text-xs text-gray-500">{fmtDate(o.createdAt)}</p>
                    </div>
                    <span className="text-sm font-semibold">{fmtN(o.total)}</span>
                    <Badge variant={orderVariant[o.status] || 'default'}>{o.status}</Badge>
                  </div>
                ))}
              {(data.ordersPagination?.totalPages ?? 1) > 1 && (
                <Pagination page={orderPage} totalPages={data.ordersPagination.totalPages} onChange={setOrderPage} />
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-2">
              {(data.reviews || []).length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No reviews yet.</p> :
                data.reviews.map((r: Row) => (
                  <div key={r._id} className="border border-gray-100 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{r.reviewerName || 'Anonymous'}</p>
                      <span className="text-[#D6A643] text-sm">{'★'.repeat(r.overall || r.rating || 0)}</span>
                    </div>
                    {r.text && <p className="text-sm text-gray-600">{r.text}</p>}
                    <p className="text-[11px] text-gray-400 mt-1">{fmtDate(r.createdAt)}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
