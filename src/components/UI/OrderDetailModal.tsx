import { useEffect, useState } from 'react';
import Modal from './Modal';
import { Badge } from './Badge';
import Avatar from './Avatar';
import { getMarketplaceOrderDetail } from '../../services/adminOps';
import { fmtN } from '../../pages/Finance/FinanceCards';
import toast from 'react-hot-toast';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default' | 'gold'> = {
  pending: 'warning', confirmed: 'info', processing: 'gold',
  shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'gold',
};

export default function OrderDetailModal({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const [order, setOrder] = useState<Row | null>(null);
  const [reviews, setReviews] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    getMarketplaceOrderDetail(orderId)
      .then((res) => { setOrder(res.order); setReviews(res.reviews || []); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!orderId) return null;

  const items: Row[] = order?.items || [];

  return (
    <Modal open={!!orderId} onClose={onClose} title={`Order ${orderId.slice(-8)}`} size="lg">
      {loading || !order ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#165B43] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[order.status] || 'default'}>{order.status}</Badge>
            <Badge variant={order.paymentStatus === 'released' || order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'refunded' ? 'gold' : 'warning'}>
              payment: {order.paymentStatus}
            </Badge>
            {order.paymentMethod && <Badge variant="info">{order.paymentMethod}</Badge>}
            {order.disputed && <Badge variant="danger">disputed</Badge>}
          </div>

          {/* Items — what was bought */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Items ({items.length})</p>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-3">
                  {it.image || it.product?.images?.[0] ? (
                    <img src={it.image || it.product.images[0]} alt={it.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">IMG</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{it.name || it.product?.name}</p>
                    <p className="text-xs text-gray-500">
                      {it.product ? 'in catalogue' : 'product removed'}
                      {it.product?.category ? ` · ${it.product.category}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{fmtN(it.price)} × {it.quantity}</p>
                    <p className="text-xs text-gray-500">{fmtN((it.price || 0) * (it.quantity || 1))}</p>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No items on this order</p>}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
            <Row2 label="Subtotal" value={fmtN(order.subtotal)} />
            <Row2 label="Delivery fee" value={fmtN(order.deliveryFee)} />
            {order.serviceFee ? <Row2 label="Service fee" value={fmtN(order.serviceFee)} /> : null}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span>Total</span><span>{fmtN(order.total)}</span>
            </div>
          </div>
          {/* PART2 */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Buyer</p>
            <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
              <Avatar name={order.buyer?.fullName || '?'} src={order.buyer?.profilePhoto} size="md" />
              <div className="flex-1">
                <p className="text-sm font-medium">{order.buyer?.fullName}</p>
                <p className="text-xs text-gray-500">{order.buyer?.phoneNumber} · {order.buyer?.email}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Seller</p>
            <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
              <Avatar name={order.store?.provider?.fullName || order.store?.name || '?'} src={order.store?.logo || order.store?.provider?.profilePhoto} size="md" />
              <div className="flex-1">
                <p className="text-sm font-medium">{order.store?.name}</p>
                <p className="text-xs text-gray-500">{order.store?.provider?.fullName} · {order.store?.provider?.phoneNumber}</p>
              </div>
            </div>
          </div>

          {order.deliveryAddress && (
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Delivery address</p>
              <div className="border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700">
                <p>{order.deliveryAddress.street}</p>
                <p className="text-gray-500 text-xs">{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                <p className="text-gray-500 text-xs">{order.deliveryAddress.phone}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Info label="Paystack ref" value={order.paystackReference || '—'} />
            <Info label="Ordered" value={order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'} />
            <Info label="Delivered" value={order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : '—'} />
            <Info label="Escrow" value={order.escrowReleasedAt ? new Date(order.escrowReleasedAt).toLocaleString() : (order.paymentStatus === 'released' ? 'released' : 'held')} />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Reviews ({reviews.length})</p>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews on this order yet.</p>
            ) : (
              <div className="space-y-2">
                {reviews.map((r) => (
                  <div key={r._id} className="border border-gray-100 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{r.reviewerName || 'Anonymous'}</p>
                      <span className="text-[#D6A643] text-sm">{'★'.repeat(r.overall || 0)}</span>
                    </div>
                    {r.text && <p className="text-sm text-gray-600">{r.text}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function Row2({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-gray-500">{label}</span><span className="font-medium">{value}</span></div>;
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-lg px-3 py-2">
      <p className="text-gray-500 mb-0.5">{label}</p>
      <p className="font-medium text-gray-800 break-all">{value}</p>
    </div>
  );
}
