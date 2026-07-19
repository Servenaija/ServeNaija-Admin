import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Button from '../../components/UI/Button';
import Avatar from '../../components/UI/Avatar';
import { listCustomers } from '../../services/api';
import { Filter, Ban, CheckCircle } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'agents' | 'unverified'>('all');
  const [customers, setCustomers] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      listCustomers({ search: search || undefined, filter: filter !== 'all' ? filter : undefined, limit: 100, page: 0 })
        .then((res) => { setCustomers(res.customers as Row[]); setTotal(res.total); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
  }, [search, filter]);

  const filtered = customers;

  const columns = [
    {
      key: 'name', header: 'Customer', width: '220px',
      render: (c: Row) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.fullName} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-gray-800 text-sm">{c.fullName}</p>
              {c.isAgent && <Badge variant="gold" className="text-[9px] py-0 px-1.5">Agent</Badge>}
            </div>
            <p className="text-xs text-gray-500">{c.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone', header: 'Phone',
      render: (c: Row) => (
        <a href={`tel:${c.phoneNumber}`} className="text-sm font-mono hover:text-[#165B43]">{c.phoneNumber}</a>
      ),
    },
    {
      key: 'location', header: 'Location',
      render: (c: Row) => <span className="text-sm text-gray-600">{c.location?.city || '—'}, {c.location?.state || '—'}</span>,
    },
    {
      key: 'bookings', header: 'Bookings',
      render: (c: Row) => <span className="text-sm font-medium">{c.totalBookings ?? 0}</span>,
    },
    {
      key: 'wallet', header: 'Wallet',
      render: (c: Row) => <span className="text-sm font-semibold text-green-600">₦{(c.walletBalance ?? 0).toLocaleString()}</span>,
    },
    {
      key: 'verified', header: 'Verified',
      render: (c: Row) => (
        <div className="flex gap-1">
          <Badge variant={c.isEmailVerified ? 'success' : 'warning'}>Email</Badge>
          <Badge variant={c.isPhoneVerified ? 'success' : 'warning'}>Phone</Badge>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (c: Row) => (
        c.isBanned
          ? <Badge variant="danger"><Ban size={10} className="mr-1" />Banned</Badge>
          : <Badge variant="success"><CheckCircle size={10} className="mr-1" />Active</Badge>
      ),
    },
    {
      key: 'joined', header: 'Joined',
      render: (c: Row) => <span className="text-xs text-gray-500">{fmtDate(c.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Customers">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'active', 'banned', 'agents', 'unverified'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filter === f
                  ? 'bg-[#165B43] text-white border-[#165B43]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && <span className="ml-1 text-[10px] opacity-60">{total}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." className="w-56" />
          <Button variant="secondary" size="sm" icon={<Filter size={14} />}>Filter</Button>
        </div>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-500">{loading ? 'Loading...' : `${total} customer${total !== 1 ? 's' : ''} found`}</p>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey={(c) => c._id || c.id}
        onRowClick={(c) => navigate(`/customers/${c._id || c.id}`)}
        emptyText={loading ? 'Loading customers...' : 'No customers found'}
      />
    </Layout>
  );
}
