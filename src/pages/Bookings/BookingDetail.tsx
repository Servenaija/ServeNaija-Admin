import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Avatar from '../../components/UI/Avatar';
import { getBooking } from '../../services/api';
import { ArrowLeft, Phone, MapPin, MessageSquare, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getBooking(id)
      .then((res) => setBooking(res.booking))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  const timelineIcons: Record<string, React.ElementType> = {
    pending: Clock, accepted: CheckCircle2, completed: CheckCircle2,
    cancelled: XCircle, disputed: AlertTriangle,
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#165B43] border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout title="Booking Not Found">
        <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => navigate('/bookings')}>Back</Button>
        <p className="mt-4 text-gray-500">Booking not found.</p>
      </Layout>
    );
  }

  const bookingId = booking._id || booking.id;

  return (
    <Layout title={`Booking ${String(bookingId).slice(-8)}`}>
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/bookings')}>
          Back to Bookings
        </Button>
        <div className="flex gap-2">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Parties */}
          <Card>
            <CardHeader><p className="font-semibold text-sm">Parties</p></CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Customer</p>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={booking.customer?.fullName || booking.customer?.name || '?'} size="md" />
                    <div>
                      <p className="font-semibold text-gray-800">{booking.customer?.fullName || booking.customer?.name}</p>
                      <a href={`tel:${booking.customer?.phoneNumber || booking.customer?.phone}`} className="flex items-center gap-1 text-sm text-[#165B43] hover:underline font-mono">
                        <Phone size={12} />{booking.customer?.phoneNumber || booking.customer?.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={<MessageSquare size={12} />} onClick={() => navigate('/chat')}>Message</Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Provider</p>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={booking.provider?.fullName || booking.provider?.name || '?'} size="md" />
                    <div>
                      <p className="font-semibold text-gray-800">{booking.provider?.fullName || booking.provider?.name}</p>
                      <a href={`tel:${booking.provider?.phoneNumber || booking.provider?.phone}`} className="flex items-center gap-1 text-sm text-[#165B43] hover:underline font-mono">
                        <Phone size={12} />{booking.provider?.phoneNumber || booking.provider?.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={<MessageSquare size={12} />} onClick={() => navigate('/chat')}>Message</Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader><p className="font-semibold text-sm">Service Details</p></CardHeader>
            <CardBody className="space-y-3">
              <InfoRow label="Service" value={booking.service?.name || '—'} />
              <InfoRow label="Category" value={booking.service?.category || '—'} />
              <InfoRow label="Description" value={booking.description || '—'} />
              <InfoRow label="Scheduled Date" value={booking.scheduledDate ? fmtDate(booking.scheduledDate) : '—'} />
              <InfoRow label="Time Slot" value={booking.timeSlot || '—'} />
              <div className="flex items-start gap-3">
                <span className="text-xs text-gray-500 w-32 flex-shrink-0 flex items-center gap-1"><MapPin size={11} />Address</span>
                <span className="text-sm text-gray-800">{booking.address?.full || booking.address?.address || '—'}</span>
              </div>
            </CardBody>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader><p className="font-semibold text-sm">Payment</p></CardHeader>
            <CardBody className="space-y-3">
              <InfoRow label="Service Fee" value={`₦${(booking.serviceFee || 0).toLocaleString()}`} />
              <InfoRow label="Platform Fee" value={`₦${(booking.platformFee || 0).toLocaleString()}`} />
              <div className="border-t border-gray-100 pt-3">
                <InfoRow label="Total Amount" value={`₦${(booking.totalAmount || 0).toLocaleString()}`} />
              </div>
              <InfoRow label="Payment Status" value={booking.paymentStatus || '—'} />
              <InfoRow label="Paystack Ref" value={booking.paystackReference || '—'} />
            </CardBody>
          </Card>

          {/* Rating */}
          {booking.rating && (
            <Card>
              <CardHeader><p className="font-semibold text-sm">Customer Rating</p></CardHeader>
              <CardBody>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl font-bold text-[#D6A643]">★ {booking.rating.overall}</span>
                  <span className="text-sm text-gray-500">Overall</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {(['quality', 'punctuality', 'professionalism', 'communication'] as const).map((cat) => (
                    <div key={cat} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600 capitalize">{cat}</span>
                      <span className="text-xs font-semibold text-[#D6A643]">★ {booking.rating[cat]}</span>
                    </div>
                  ))}
                </div>
                {booking.rating.review && (
                  <p className="text-sm text-gray-700 italic">"{booking.rating.review}"</p>
                )}
              </CardBody>
            </Card>
          )}

          {/* Disputed Actions */}
          {booking.status === 'disputed' && (
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <p className="font-semibold text-sm text-red-700">Dispute Resolution</p>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-gray-600 mb-4">
                  This booking is under dispute. Review both sides and take appropriate action.
                </p>
                <div className="flex gap-3">
                  <Button variant="primary" size="sm" icon={<CheckCircle2 size={14} />}>Resolve - Release to Provider</Button>
                  <Button variant="danger" size="sm" icon={<XCircle size={14} />}>Resolve - Refund Customer</Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column — Timeline */}
        <div>
          <Card className="sticky top-24">
            <CardHeader><p className="font-semibold text-sm">Timeline</p></CardHeader>
            <CardBody className="p-4">
              <div className="space-y-0">
                {(booking.timeline || []).map((entry: Row, idx: number) => {
                  const Icon = timelineIcons[entry.status] || Clock;
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#165B4320' }}>
                          <Icon size={13} className="text-[#165B43]" />
                        </div>
                        {idx < (booking.timeline || []).length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: 16 }} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium capitalize text-gray-800">{(entry.status || '').replace(/-/g, ' ')}</p>
                        <p className="text-xs text-gray-500">{entry.note}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtDate(entry.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
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
