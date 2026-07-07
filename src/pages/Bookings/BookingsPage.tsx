import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import { mockBookings } from '../../data/mock';
import type { Booking, BookingStatus } from '../../types';
import { AlertTriangle } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_FILTERS: BookingStatus[] = ['pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'disputed'];

export default function BookingsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const filtered = mockBookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || b.customer.name.toLowerCase().includes(q)
      || b.provider.name.toLowerCase().includes(q)
      || b.service.name.toLowerCase().includes(q)
      || b.id.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'id', header: 'Booking ID', width: '110px',
      render: (b: Booking) => <span className="text-xs font-mono text-gray-500">{b.id}</span>,
    },
    {
      key: 'customer', header: 'Customer',
      render: (b: Booking) => (
        <div className="flex items-center gap-2">
          <Avatar name={b.customer.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{b.customer.name}</p>
            <a href={`tel:${b.customer.phone}`} className="text-xs font-mono text-gray-500 hover:text-[#165B43]">{b.customer.phone}</a>
          </div>
        </div>
      ),
    },
    {
      key: 'provider', header: 'Provider',
      render: (b: Booking) => (
        <div className="flex items-center gap-2">
          <Avatar name={b.provider.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{b.provider.name}</p>
            <a href={`tel:${b.provider.phone}`} className="text-xs font-mono text-gray-500 hover:text-[#165B43]">{b.provider.phone}</a>
          </div>
        </div>
      ),
    },
    {
      key: 'service', header: 'Service',
      render: (b: Booking) => (
        <div>
          <p className="text-sm text-gray-800">{b.service.name}</p>
          <p className="text-xs text-gray-500">{b.service.category}</p>
        </div>
      ),
    },
    {
      key: 'amount', header: 'Amount',
      render: (b: Booking) => (
        <div>
          <p className="text-sm font-semibold text-gray-800">₦{b.totalAmount.toLocaleString()}</p>
          <PaymentStatusBadge status={b.paymentStatus} />
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (b: Booking) => (
        <div className="flex items-center gap-1">
          {b.status === 'disputed' && <AlertTriangle size={12} className="text-red-500" />}
          <BookingStatusBadge status={b.status} />
        </div>
      ),
    },
    {
      key: 'date', header: 'Date',
      render: (b: Booking) => <span className="text-xs text-gray-500">{fmtDate(b.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Bookings">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              statusFilter === 'all' ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            All <span className="ml-1 opacity-60">{mockBookings.length}</span>
          </button>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                statusFilter === s ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search bookings..." className="w-56" />
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-500">{filtered.length} booking{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey={(b) => b.id}
        onRowClick={(b) => navigate(`/bookings/${b.id}`)}
        emptyText="No bookings found"
      />
    </Layout>
  );
}
