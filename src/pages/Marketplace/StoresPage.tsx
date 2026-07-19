import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import { listStores } from '../../services/api';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function StoresPage() {
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      listStores({ search: search || undefined, limit: 100, page: 0 })
        .then((res) => { setStores(res.stores as Row[]); setTotal(res.total); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
  }, [search]);

  const filtered = stores;

  const columns = [
    {
      key: 'name', header: 'Store',
      render: (s: Row) => (
        <div>
          <p className="font-medium text-gray-800">{s.name}</p>
          <p className="text-xs text-gray-500">{s.description}</p>
        </div>
      ),
    },
    {
      key: 'provider', header: 'Provider',
      render: (s: Row) => (
        <div className="flex items-center gap-2">
          <Avatar name={s.providerName || s.provider?.fullName || '?'} size="sm" />
          <span className="text-sm">{s.providerName || s.provider?.fullName}</span>
        </div>
      ),
    },
    {
      key: 'category', header: 'Category',
      render: (s: Row) => <span className="text-sm text-gray-600">{s.category || '—'}</span>,
    },
    {
      key: 'rating', header: 'Rating',
      render: (s: Row) => <span className="text-[#D6A643] font-semibold text-sm">★ {s.rating ?? '—'} ({s.reviewCount ?? 0})</span>,
    },
    {
      key: 'orders', header: 'Total Orders',
      render: (s: Row) => <span className="text-sm font-medium">{s.totalOrders ?? 0}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (s: Row) => <Badge variant={s.isActive ? 'success' : 'default'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'created', header: 'Created',
      render: (s: Row) => <span className="text-xs text-gray-500">{fmtDate(s.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Stores">
      <div className="flex items-center justify-between mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search stores..." className="w-64" />
        <p className="text-xs text-gray-500">{loading ? 'Loading...' : `${total} store${total !== 1 ? 's' : ''}`}</p>
      </div>
      <Table columns={columns} data={filtered} rowKey={(s) => s._id || s.id} emptyText={loading ? 'Loading stores...' : 'No stores found'} />
    </Layout>
  );
}

