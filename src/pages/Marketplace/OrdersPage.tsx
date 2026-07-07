import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import { mockOrders } from '../../data/mock';
import type { Order, OrderStatus } from '../../types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const statusVariant: Record<OrderStatus, 'success' | 'info' | 'warning' | 'danger' | 'default' | 'gold'> = {
  pending: 'warning', confirmed: 'info', processing: 'gold',
  shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'gold',
};

const STATUS_FILTERS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = mockOrders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.buyer.name.toLowerCase().includes(q) || o.store.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'id', header: 'Order ID', width: '100px',
      render: (o: Order) => <span className="text-xs font-mono text-gray-500">{o.id}</span>,
    },
    {
      key: 'buyer', header: 'Buyer',
      render: (o: Order) => (
        <div className="flex items-center gap-2">
          <Avatar name={o.buyer.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{o.buyer.name}</p>
            <a href={`tel:${o.buyer.phone}`} className="text-xs font-mono text-gray-500 hover:text-[#165B43]">{o.buyer.phone}</a>
          </div>
        </div>
      ),
    },
    {
      key: 'store', header: 'Store',
      render: (o: Order) => <span className="text-sm text-gray-700">{o.store.name}</span>,
    },
    {
      key: 'items', header: 'Items',
      render: (o: Order) => <span className="text-sm">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</span>,
    },
    {
      key: 'total', header: 'Total',
      render: (o: Order) => (
        <div>
          <p className="text-sm font-semibold">₦{o.total.toLocaleString()}</p>
          <Badge variant={o.paymentStatus === 'paid' ? 'success' : o.paymentStatus === 'failed' ? 'danger' : 'warning'} className="text-[10px]">
            {o.paymentStatus}
          </Badge>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (o: Order) => <Badge variant={statusVariant[o.status]}>{o.status}</Badge>,
    },
    {
      key: 'date', header: 'Date',
      render: (o: Order) => <span className="text-xs text-gray-500">{fmtDate(o.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Marketplace Orders">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${statusFilter === 'all' ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            All <span className="ml-1 opacity-60">{mockOrders.length}</span>
          </button>
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${statusFilter === s ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search orders..." className="w-56" />
      </div>

      <Table columns={columns} data={filtered} rowKey={(o) => o.id} emptyText="No orders found" />
    </Layout>
  );
}
