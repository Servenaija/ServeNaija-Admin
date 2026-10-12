import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import Pagination from '../../components/UI/Pagination';
import AdminCancelButton from '../../components/UI/AdminCancelButton';
import OrderDetailModal from '../../components/UI/OrderDetailModal';
import { listOrders } from '../../services/api';
import type { OrderStatus } from '../../types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default' | 'gold'> = {
  pending: 'warning', confirmed: 'info', processing: 'gold',
  shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'gold',
};

const STATUS_FILTERS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const PAGE_SIZE = 25;

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setPage(0); }, [search, statusFilter]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      listOrders({ search: search || undefined, status: statusFilter !== 'all' ? statusFilter : undefined, limit: PAGE_SIZE, page })
        .then((res) => {
          setOrders(res.orders as Row[]);
          setTotal(res.total);
          setTotalPages(Math.max(1, Math.ceil((res.total || 0) / PAGE_SIZE)));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
  }, [search, statusFilter, page]);

  const filtered = orders;

  const columns = [
    {
      key: 'id', header: 'Order ID', width: '100px',
      render: (o: Row) => <span className="text-xs font-mono text-gray-500">{String(o._id || o.id).slice(-8)}</span>,
    },
    {
      key: 'buyer', header: 'Buyer',
      render: (o: Row) => (
        <div className="flex items-center gap-2">
          <Avatar name={o.buyer?.fullName || o.buyer?.name || '?'} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{o.buyer?.fullName || o.buyer?.name}</p>
            <a href={`tel:${o.buyer?.phoneNumber || o.buyer?.phone}`} className="text-xs font-mono text-gray-500 hover:text-[#165B43]">{o.buyer?.phoneNumber || o.buyer?.phone}</a>
          </div>
        </div>
      ),
    },
    {
      key: 'store', header: 'Store',
      render: (o: Row) => <span className="text-sm text-gray-700">{o.store?.name || '—'}</span>,
    },
    {
      key: 'items', header: 'Items',
      render: (o: Row) => <span className="text-sm">{(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}</span>,
    },
    {
      key: 'total', header: 'Total',
      render: (o: Row) => (
        <div>
          <p className="text-sm font-semibold">₦{(o.total || o.totalAmount || 0).toLocaleString()}</p>
          <Badge variant={o.paymentStatus === 'paid' ? 'success' : o.paymentStatus === 'failed' ? 'danger' : 'warning'} className="text-[10px]">
            {o.paymentStatus}
          </Badge>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (o: Row) => <Badge variant={statusVariant[o.status] || 'default'}>{o.status}</Badge>,
    },
    {
      key: 'date', header: 'Date',
      render: (o: Row) => <span className="text-xs text-gray-500">{fmtDate(o.createdAt)}</span>,
    },
    {
      key: 'adminAction', header: 'Admin',
      render: (o: Row) => (
        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <AdminCancelButton
            kind="order"
            id={String(o._id || o.id)}
            status={o.status}
            onDone={() => window.location.reload()}
          />
        </div>
      ),
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
            All <span className="ml-1 opacity-60">{total}</span>
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

      <Table
        columns={columns}
        data={filtered}
        rowKey={(o) => o._id || o.id}
        onRowClick={(o) => setDetailId(String(o._id || o.id))}
        emptyText={loading ? 'Loading orders...' : 'No orders found'}
      />

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>
      )}

      <OrderDetailModal orderId={detailId} onClose={() => setDetailId(null)} />
    </Layout>
  );
}
