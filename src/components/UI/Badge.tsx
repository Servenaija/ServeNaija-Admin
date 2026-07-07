import React from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold';

const styles: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  gold: 'bg-amber-100 text-amber-700',
};

export function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Booking status badge
export function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    pending: 'warning', accepted: 'info', declined: 'danger',
    'on-the-way': 'info', arrived: 'info', assessment: 'info',
    'in-progress': 'gold', completed: 'success', cancelled: 'danger', disputed: 'danger',
  };
  return <Badge variant={map[status] ?? 'default'}>{status.replace(/-/g, ' ')}</Badge>;
}

// KYC status badge
export function KYCStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    not_started: 'default', submitted: 'info', pending: 'warning',
    approved: 'success', rejected: 'danger',
  };
  return <Badge variant={map[status] ?? 'default'}>{status.replace(/_/g, ' ')}</Badge>;
}

// Payment status badge
export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    pending: 'warning', held: 'info', released: 'success', refunded: 'gold',
    paid: 'success', failed: 'danger',
  };
  return <Badge variant={map[status] ?? 'default'}>{status}</Badge>;
}

// Call status badge
export function CallStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    ringing: 'info', accepted: 'success', rejected: 'danger',
    ended: 'default', missed: 'warning', busy: 'warning',
  };
  return <Badge variant={map[status] ?? 'default'}>{status}</Badge>;
}
