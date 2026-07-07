import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import { mockStores } from '../../data/mock';
import type { Store } from '../../types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export default function StoresPage() {
  const [search, setSearch] = useState('');

  const filtered = mockStores.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.providerName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  const columns = [
    {
      key: 'name', header: 'Store',
      render: (s: Store) => (
        <div>
          <p className="font-medium text-gray-800">{s.name}</p>
          <p className="text-xs text-gray-500">{s.description}</p>
        </div>
      ),
    },
    {
      key: 'provider', header: 'Provider',
      render: (s: Store) => (
        <div className="flex items-center gap-2">
          <Avatar name={s.providerName} size="sm" />
          <span className="text-sm">{s.providerName}</span>
        </div>
      ),
    },
    {
      key: 'category', header: 'Category',
      render: (s: Store) => <span className="text-sm text-gray-600">{s.category}</span>,
    },
    {
      key: 'rating', header: 'Rating',
      render: (s: Store) => <span className="text-[#D6A643] font-semibold text-sm">★ {s.rating} ({s.reviewCount})</span>,
    },
    {
      key: 'orders', header: 'Total Orders',
      render: (s: Store) => <span className="text-sm font-medium">{s.totalOrders}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (s: Store) => <Badge variant={s.isActive ? 'success' : 'default'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'created', header: 'Created',
      render: (s: Store) => <span className="text-xs text-gray-500">{fmtDate(s.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Stores">
      <div className="flex items-center justify-between mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search stores..." className="w-64" />
        <p className="text-xs text-gray-500">{filtered.length} store{filtered.length !== 1 ? 's' : ''}</p>
      </div>
      <Table columns={columns} data={filtered} rowKey={(s) => s.id} emptyText="No stores found" />
    </Layout>
  );
}
