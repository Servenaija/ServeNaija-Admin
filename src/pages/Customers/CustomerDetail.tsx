import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import { Badge, BookingStatusBadge } from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Avatar from '../../components/UI/Avatar';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import {
  getCustomer, banCustomer, getCustomerBookings,
  getCustomerOrders, getCustomerTransactions,
} from '../../services/api';
import { Phone, Mail, MapPin, Shield, Ban, CheckCircle, MessageSquare, ArrowLeft, UserCheck } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerBookings, setCustomerBookings] = useState<Row[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Row[]>([]);
  const [customerTxns, setCustomerTxns] = useState<Row[]>([]);
  const [tab, setTab] = useState<'overview' | 'bookings' | 'orders' | 'transactions'>('overview');
  const [showBanConfirm, setShowBanConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCustomer(id)
      .then((res) => setCustomer(res.customer))
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (tab === 'bookings') {
      getCustomerBookings(id, { limit: 50 }).then((r) => setCustomerBookings(r.bookings as Row[])).catch(() => {});
    } else if (tab === 'orders') {
      getCustomerOrders(id, { limit: 50 }).then((r) => setCustomerOrders(r.orders as Row[])).catch(() => {});
    } else if (tab === 'transactions') {
      getCustomerTransactions(id, { limit: 50 }).then((r) => setCustomerTxns(r.transactions as Row[])).catch(() => {});
    }
  }, [id, tab]);

  const handleBanToggle = async () => {
    if (!id) return;
    try {
      const res = await banCustomer(id);
      setCustomer((prev: Row) => prev ? { ...prev, isBanned: res.isBanned } : prev);
    } catch { /* ignore */ }
    setShowBanConfirm(false);
  };

  const tabs = ['overview', 'bookings', 'orders', 'transactions'] as const;

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#165B43] border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout title="Customer Not Found">
        <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => navigate('/customers')}>Back</Button>
        <p className="mt-4 text-gray-500">Customer not found.</p>
      </Layout>
    );
  }

  return (
    <Layout title={customer.fullName}>
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/customers')}>
          Back to Customers
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<MessageSquare size={14} />} onClick={() => navigate('/chat')}>
            Message
          </Button>
          <Button
            variant={customer.isBanned ? 'primary' : 'danger'}
            size="sm"
            icon={customer.isBanned ? <CheckCircle size={14} /> : <Ban size={14} />}
            onClick={() => setShowBanConfirm(true)}
          >
            {customer.isBanned ? 'Unban Customer' : 'Ban Customer'}
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="mb-5">
        <CardBody>
          <div className="flex items-start gap-5">
            <Avatar name={customer.fullName} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-gray-800">{customer.fullName}</h2>
                {customer.isBanned && <Badge variant="danger"><Ban size={10} />Banned</Badge>}
                {customer.isAgent && <Badge variant="gold"><UserCheck size={10} />Agent</Badge>}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <a href={`mailto:${customer.email}`} className="flex items-center gap-1 hover:text-[#165B43]">
                  <Mail size={14} />{customer.email}
                </a>
                <a href={`tel:${customer.phoneNumber}`} className="flex items-center gap-1 hover:text-[#165B43] font-mono">
                  <Phone size={14} />{customer.phoneNumber}
                </a>
                {customer.location?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />{customer.location.city}, {customer.location?.state}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">{customer.totalBookings ?? 0}</p>
                  <p className="text-xs text-gray-500">Bookings</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">{customer.totalOrders ?? 0}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">₦{(customer.walletBalance ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Wallet Balance</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">{fmtDate(customer.createdAt)}</p>
                  <p className="text-xs text-gray-500">Joined</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
              tab === t ? 'border-[#165B43] text-[#165B43]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader><p className="font-semibold text-sm flex items-center gap-2"><Shield size={15} />Account Info</p></CardHeader>
            <CardBody className="space-y-3">
              <InfoRow label="Birthday" value={customer.birthday ? fmtDate(customer.birthday) : '—'} />
              <InfoRow label="Email Verified" value={customer.isEmailVerified ? '✓ Yes' : '✗ No'} />
              <InfoRow label="Phone Verified" value={customer.isPhoneVerified ? '✓ Yes' : '✗ No'} />
              <InfoRow label="Is Agent" value={customer.isAgent ? 'Yes' : 'No'} />
              <InfoRow label="Agent Code Used" value={customer.agentCode || '—'} />
              <InfoRow label="Own Referral Code" value={customer.referralCode || '—'} />
              <InfoRow label="Last Login" value={customer.lastLogin ? fmtDate(customer.lastLogin) : '—'} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader><p className="font-semibold text-sm flex items-center gap-2"><MapPin size={15} />Address</p></CardHeader>
            <CardBody className="space-y-3">
              <InfoRow label="State" value={customer.location?.state || '—'} />
              <InfoRow label="City" value={customer.location?.city || '—'} />
              <InfoRow label="Address" value={customer.location?.address || '—'} />
              <InfoRow label="Landmark" value={customer.location?.landmark || '—'} />
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'bookings' && (
        <Card>
          <CardHeader><p className="font-semibold text-sm">Booking History ({customerBookings.length})</p></CardHeader>
          <CardBody className="p-0">
            {customerBookings.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">No bookings yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {customerBookings.map((bk: Row) => (
                  <div key={bk._id || bk.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/bookings/${bk._id || bk.id}`)}>
                    <Avatar name={bk.provider?.fullName || bk.provider?.name || '?'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{bk.service?.name}</p>
                      <p className="text-xs text-gray-500">Provider: {bk.provider?.fullName || bk.provider?.name} · {fmtDate(bk.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <BookingStatusBadge status={bk.status} />
                      <p className="text-xs text-gray-500 mt-0.5">₦{(bk.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'orders' && (
        <Card>
          <CardHeader><p className="font-semibold text-sm">Order History ({customerOrders.length})</p></CardHeader>
          <CardBody className="p-0">
            {customerOrders.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">No orders yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {customerOrders.map((ord: Row) => (
                  <div key={ord._id || ord.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{ord.store?.name || '—'}</p>
                      <p className="text-xs text-gray-500">{(ord.items || []).length} items · {fmtDate(ord.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={ord.status === 'delivered' ? 'success' : ord.status === 'cancelled' ? 'danger' : 'info'}>
                        {ord.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-0.5">₦{(ord.total || ord.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'transactions' && (
        <Card>
          <CardHeader><p className="font-semibold text-sm">Transactions ({customerTxns.length})</p></CardHeader>
          <CardBody className="p-0">
            {customerTxns.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">No transactions yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {customerTxns.map((txn: Row) => (
                  <div key={txn._id || txn.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">{(txn.type || '').replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">{txn.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${txn.type === 'escrow_hold' || txn.type === 'debit' ? 'text-red-500' : 'text-green-600'}`}>
                        {txn.type === 'escrow_hold' || txn.type === 'debit' ? '-' : '+'}₦{(txn.amount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{fmtDate(txn.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <ConfirmDialog
        open={showBanConfirm}
        title={customer.isBanned ? 'Unban Customer?' : 'Ban Customer?'}
        message={customer.isBanned
          ? `Restore ${customer.fullName}'s access to the platform.`
          : `Block ${customer.fullName} from accessing the platform.`}
        confirmLabel={customer.isBanned ? 'Unban' : 'Ban'}
        onConfirm={handleBanToggle}
        onCancel={() => setShowBanConfirm(false)}
        variant={customer.isBanned ? 'primary' : 'danger'}
      />
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-xs text-gray-500 flex-shrink-0 w-32">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
}
