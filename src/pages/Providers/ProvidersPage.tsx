import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge, KYCStatusBadge, normalizeKycStatus } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Button from '../../components/UI/Button';
import Avatar from '../../components/UI/Avatar';
import Pagination from '../../components/UI/Pagination';
import { listProviders } from '../../services/api';
import { Filter, UserCheck, Ban, CheckCircle } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const PAGE_SIZE = 25;

export default function ProvidersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'kyc_pending' | 'provider' | 'business'>('all');
  const [providers, setProviders] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // reset to first page whenever a filter/search changes
  useEffect(() => { setPage(0); }, [search, filter]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      listProviders({ search: search || undefined, filter: filter !== 'all' ? filter : undefined, limit: PAGE_SIZE, page })
        .then((res) => {
          setProviders(res.providers as Row[]);
          setTotal(res.total);
          setTotalPages(res.totalPages ?? Math.ceil((res.total || 0) / PAGE_SIZE));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
  }, [search, filter, page]);

  const filtered = providers;

  const columns = [
    {
      key: 'name', header: 'Provider', width: '220px',
      render: (p: Row) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.fullName} size="sm" />
          <div>
            <p className="font-medium text-gray-800 text-sm">{p.fullName}</p>
            <p className="text-xs text-gray-500">{p.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone', header: 'Phone',
      render: (p: Row) => <span className="text-sm font-mono">{p.phoneNumber}</span>,
    },
    {
      key: 'type', header: 'Type',
      render: (p: Row) => (
        <Badge variant={p.accountType === 'business' ? 'gold' : 'info'}>{p.accountType}</Badge>
      ),
    },
    {
      key: 'category', header: 'Category',
      render: (p: Row) => <span className="text-sm">{p.service?.category || '—'}</span>,
    },
    {
      key: 'location', header: 'Location',
      render: (p: Row) => <span className="text-sm text-gray-600">{p.location?.city}, {p.location?.state}</span>,
    },
    {
      key: 'kyc', header: 'KYC',
      render: (p: Row) => <KYCStatusBadge status={normalizeKycStatus(p)} />,
    },
    {
      key: 'rating', header: 'Rating',
      render: (p: Row) => (
        <div>
          <span className="text-[#D6A643] font-semibold text-sm">★ {p.rating ?? '—'}</span>
          <span className="text-xs text-gray-400 ml-1">({p.reviewCount ?? 0})</span>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (p: Row) => (
        p.isBanned
          ? <Badge variant="danger"><Ban size={10} className="mr-1" />Banned</Badge>
          : <Badge variant="success"><CheckCircle size={10} className="mr-1" />Active</Badge>
      ),
    },
    {
      key: 'joined', header: 'Joined',
      render: (p: Row) => <span className="text-xs text-gray-500">{fmtDate(p.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Providers">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'active', 'banned', 'kyc_pending', 'provider', 'business'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filter === f
                  ? 'bg-[#165B43] text-white border-[#165B43]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'kyc_pending' ? 'KYC Pending' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && <span className="ml-1 text-[10px] opacity-60">{total}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search providers..." className="w-56" />
          <Button variant="secondary" size="sm" icon={<Filter size={14} />}>Filter</Button>
        </div>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-500">{loading ? 'Loading...' : `${total} provider${total !== 1 ? 's' : ''} found`}</p>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey={(p) => p._id || p.id}
        onRowClick={(p) => navigate(`/providers/${p._id || p.id}`)}
        emptyText={loading ? 'Loading providers...' : 'No providers found'}
      />

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>
      )}
    </Layout>
  );
}
