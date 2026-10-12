// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function EngagementStats({ presence, activity, days }: { presence: Row | null; activity: Row | null; days: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Online providers</p><p className="text-xl font-bold">{presence?.counts?.onlineProviders ?? '—'}</p></div>
      <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Online customers</p><p className="text-xl font-bold">{presence?.counts?.onlineCustomers ?? '—'}</p></div>
      <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Dormant providers ({days}d)</p><p className="text-xl font-bold">{activity?.providers?.dormantCount ?? '—'}</p></div>
      <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Dormant customers ({days}d)</p><p className="text-xl font-bold">{activity?.customers?.dormantCount ?? '—'}</p></div>
    </div>
  );
}
