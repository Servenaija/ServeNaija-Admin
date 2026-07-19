import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import { listServices } from '../../services/api';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [services, setServices] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      listServices({ search: search || undefined, limit: 100, page: 0 })
        .then((res) => { setServices(res.services as Row[]); setTotal(res.total); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
  }, [search]);

  const filtered = services;

  const columns = [
    {
      key: 'name', header: 'Service Name',
      render: (s: Row) => (
        <div>
          <p className="font-medium text-gray-800 text-sm">{s.name}</p>
          <p className="text-xs text-gray-500">{s.description}</p>
        </div>
      ),
    },
    {
      key: 'provider', header: 'Provider',
      render: (s: Row) => (
        <div className="flex items-center gap-2">
          <Avatar name={s.providerName || s.provider?.fullName || '?'} size="sm" />
          <span className="text-sm text-gray-700">{s.providerName || s.provider?.fullName}</span>
        </div>
      ),
    },
    {
      key: 'price', header: 'Price',
      render: (s: Row) => <span className="font-semibold text-[#165B43]">₦{(s.price || 0).toLocaleString()}</span>,
    },
    {
      key: 'duration', header: 'Duration',
      render: (s: Row) => <span className="text-sm text-gray-600">{s.duration || '—'}</span>,
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
    <Layout title="Services">
      <div className="flex items-center justify-between mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search services..." className="w-64" />
        <p className="text-xs text-gray-500">{loading ? 'Loading...' : `${total} service${total !== 1 ? 's' : ''}`}</p>
      </div>
      <Table columns={columns} data={filtered} rowKey={(s) => s._id || s.id} emptyText={loading ? 'Loading services...' : 'No services found'} />
    </Layout>
  );
}
