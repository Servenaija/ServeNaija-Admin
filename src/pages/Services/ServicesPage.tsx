import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import { mockServices } from '../../data/mock';
import type { Service } from '../../types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ServicesPage() {
  const [search, setSearch] = useState('');

  const filtered = mockServices.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.providerName.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  const columns = [
    {
      key: 'name', header: 'Service Name',
      render: (s: Service) => (
        <div>
          <p className="font-medium text-gray-800 text-sm">{s.name}</p>
          <p className="text-xs text-gray-500">{s.description}</p>
        </div>
      ),
    },
    {
      key: 'provider', header: 'Provider',
      render: (s: Service) => (
        <div className="flex items-center gap-2">
          <Avatar name={s.providerName} size="sm" />
          <span className="text-sm text-gray-700">{s.providerName}</span>
        </div>
      ),
    },
    {
      key: 'price', header: 'Price',
      render: (s: Service) => <span className="font-semibold text-[#165B43]">₦{s.price.toLocaleString()}</span>,
    },
    {
      key: 'duration', header: 'Duration',
      render: (s: Service) => <span className="text-sm text-gray-600">{s.duration || '—'}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (s: Service) => <Badge variant={s.isActive ? 'success' : 'default'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'created', header: 'Created',
      render: (s: Service) => <span className="text-xs text-gray-500">{fmtDate(s.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Services">
      <div className="flex items-center justify-between mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search services..." className="w-64" />
        <p className="text-xs text-gray-500">{filtered.length} service{filtered.length !== 1 ? 's' : ''}</p>
      </div>
      <Table columns={columns} data={filtered} rowKey={(s) => s.id} emptyText="No services found" />
    </Layout>
  );
}
