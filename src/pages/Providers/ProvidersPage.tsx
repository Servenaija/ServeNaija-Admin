import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge, KYCStatusBadge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Button from '../../components/UI/Button';
import Avatar from '../../components/UI/Avatar';
import { useApp } from '../../context/AppContext';
import { Filter, UserCheck, Ban, CheckCircle } from 'lucide-react';
import type { Provider } from '../../types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ProvidersPage() {
  const { providers } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'kyc_pending' | 'provider' | 'business'>('all');

  const filtered = providers.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.fullName.toLowerCase().includes(q)
      || p.email.toLowerCase().includes(q) || p.phoneNumber.includes(q)
      || p.service.category.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? !p.isBanned :
      filter === 'banned' ? p.isBanned :
      filter === 'kyc_pending' ? p.kyc.status === 'pending' || p.kyc.status === 'submitted' :
      filter === 'provider' ? p.accountType === 'provider' :
      filter === 'business' ? p.accountType === 'business' : true;
    return matchSearch && matchFilter;
  });

  const columns = [
    {
      key: 'name', header: 'Provider', width: '220px',
      render: (p: Provider) => (
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
      render: (p: Provider) => <span className="text-sm font-mono">{p.phoneNumber}</span>,
    },
    {
      key: 'type', header: 'Type',
      render: (p: Provider) => (
        <Badge variant={p.accountType === 'business' ? 'gold' : 'info'}>{p.accountType}</Badge>
      ),
    },
    {
      key: 'category', header: 'Category',
      render: (p: Provider) => <span className="text-sm">{p.service.category || '—'}</span>,
    },
    {
      key: 'location', header: 'Location',
      render: (p: Provider) => <span className="text-sm text-gray-600">{p.location.city}, {p.location.state}</span>,
    },
    {
      key: 'kyc', header: 'KYC',
      render: (p: Provider) => <KYCStatusBadge status={p.kyc.status} />,
    },
    {
      key: 'rating', header: 'Rating',
      render: (p: Provider) => (
        <div>
          <span className="text-[#D6A643] font-semibold text-sm">★ {p.rating}</span>
          <span className="text-xs text-gray-400 ml-1">({p.reviewCount})</span>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (p: Provider) => (
        p.isBanned
          ? <Badge variant="danger"><Ban size={10} className="mr-1" />Banned</Badge>
          : <Badge variant="success"><CheckCircle size={10} className="mr-1" />Active</Badge>
      ),
    },
    {
      key: 'joined', header: 'Joined',
      render: (p: Provider) => <span className="text-xs text-gray-500">{fmtDate(p.createdAt)}</span>,
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
              {f === 'all' && <span className="ml-1 text-[10px] opacity-60">{providers.length}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search providers..." className="w-56" />
          <Button variant="secondary" size="sm" icon={<Filter size={14} />}>Filter</Button>
        </div>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-500">{filtered.length} provider{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey={(p) => p.id}
        onRowClick={(p) => navigate(`/providers/${p.id}`)}
        emptyText="No providers found"
      />
    </Layout>
  );
}
