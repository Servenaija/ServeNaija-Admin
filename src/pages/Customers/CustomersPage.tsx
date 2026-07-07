import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Button from '../../components/UI/Button';
import Avatar from '../../components/UI/Avatar';
import { useApp } from '../../context/AppContext';
import { Filter, Ban, CheckCircle, UserCheck } from 'lucide-react';
import type { Customer } from '../../types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export default function CustomersPage() {
  const { customers } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'agents' | 'unverified'>('all');

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.fullName.toLowerCase().includes(q)
      || c.email.toLowerCase().includes(q) || c.phoneNumber.includes(q);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? !c.isBanned :
      filter === 'banned' ? c.isBanned :
      filter === 'agents' ? c.isAgent :
      filter === 'unverified' ? !c.isEmailVerified || !c.isPhoneVerified : true;
    return matchSearch && matchFilter;
  });

  const columns = [
    {
      key: 'name', header: 'Customer', width: '220px',
      render: (c: Customer) => (
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
      render: (c: Customer) => (
        <a href={`tel:${c.phoneNumber}`} className="text-sm font-mono hover:text-[#165B43]">{c.phoneNumber}</a>
      ),
    },
    {
      key: 'location', header: 'Location',
      render: (c: Customer) => <span className="text-sm text-gray-600">{c.location.city || '—'}, {c.location.state || '—'}</span>,
    },
    {
      key: 'bookings', header: 'Bookings',
      render: (c: Customer) => <span className="text-sm font-medium">{c.totalBookings}</span>,
    },
    {
      key: 'wallet', header: 'Wallet',
      render: (c: Customer) => <span className="text-sm font-semibold text-green-600">₦{c.walletBalance.toLocaleString()}</span>,
    },
    {
      key: 'verified', header: 'Verified',
      render: (c: Customer) => (
        <div className="flex gap-1">
          <Badge variant={c.isEmailVerified ? 'success' : 'warning'}>Email</Badge>
          <Badge variant={c.isPhoneVerified ? 'success' : 'warning'}>Phone</Badge>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (c: Customer) => (
        c.isBanned
          ? <Badge variant="danger"><Ban size={10} className="mr-1" />Banned</Badge>
          : <Badge variant="success"><CheckCircle size={10} className="mr-1" />Active</Badge>
      ),
    },
    {
      key: 'joined', header: 'Joined',
      render: (c: Customer) => <span className="text-xs text-gray-500">{fmtDate(c.createdAt)}</span>,
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
              {f === 'all' && <span className="ml-1 text-[10px] opacity-60">{customers.length}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." className="w-56" />
          <Button variant="secondary" size="sm" icon={<Filter size={14} />}>Filter</Button>
        </div>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-500">{filtered.length} customer{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey={(c) => c.id}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
        emptyText="No customers found"
      />
    </Layout>
  );
}
