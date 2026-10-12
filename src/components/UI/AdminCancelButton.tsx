import { useState } from 'react';
import Button from '../../components/UI/Button';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { adminCancelBooking, adminCancelOrder } from '../../services/adminOps';
import { XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCancelButton({ kind, id, status, onDone }: {
  kind: 'booking' | 'order'; id: string; status: string; onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const blocked = kind === 'booking' ? status === 'completed' : false;
  // orders: only block when delivered AND released — we don't know paymentStatus here,
  // so allow admin to attempt; API enforces the completed(released) rule.
  if (blocked || status === 'cancelled' || status === 'refunded') return null;

  const doCancel = async () => {
    setLoading(true);
    try {
      if (kind === 'booking') await adminCancelBooking(id, reason || undefined);
      else await adminCancelOrder(id, reason || undefined);
      toast.success(`${kind === 'booking' ? 'Booking' : 'Order'} cancelled + refunded`);
      setOpen(false);
      setReason('');
      onDone?.();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="danger" size="sm" icon={<XCircle size={14} />} onClick={() => setOpen(true)}>
        Cancel {kind}
      </Button>
      <ConfirmDialog
        open={open}
        title={`Cancel ${kind}?`}
        message={`This cancels the ${kind} in ANY state (except completed) and refunds the customer wallet. Continue?`}
        confirmLabel="Cancel + refund"
        onConfirm={doCancel}
        onCancel={() => setOpen(false)}
        variant="danger"
        loading={loading}
      />
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mb-24">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason (optional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
