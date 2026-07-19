import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { CallStatusBadge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import { listCalls, type CallLog } from '../../services/api';
import { Phone, Video, PhoneCall, PhoneMissed, PhoneOff } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtDuration = (secs: number) => {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function CallsPage() {
  const [search, setSearch] = useState('');
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await listCalls({ limit: 100, page: 0 });
      setCalls(res.calls || []);
      setLoading(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const filtered = calls.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.initiatorName.toLowerCase().includes(q) || c.recipientName.toLowerCase().includes(q);
  });

  const statusIcon = (status: string, type: string) => {
    if (status === 'ended') return type === 'voice' ? <PhoneCall size={14} className="text-green-500" /> : <Video size={14} className="text-green-500" />;
    if (status === 'missed') return <PhoneMissed size={14} className="text-yellow-500" />;
    if (status === 'rejected') return <PhoneOff size={14} className="text-red-500" />;
    return <Phone size={14} className="text-gray-400" />;
  };

  const columns = [
    {
      key: 'from', header: 'From',
      render: (c: CallLog) => (
        <div className="flex items-center gap-2">
          <Avatar name={c.initiatorName} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{c.initiatorName}</p>
            <a href={`tel:${c.initiatorPhone}`} className="text-xs font-mono text-gray-500 hover:text-[#165B43]">
              {c.initiatorPhone || '—'}
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'to', header: 'To',
      render: (c: CallLog) => (
        <div className="flex items-center gap-2">
          <Avatar name={c.recipientName} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{c.recipientName}</p>
            <a href={`tel:${c.recipientPhone}`} className="text-xs font-mono text-gray-500 hover:text-[#165B43]">
              {c.recipientPhone || '—'}
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type',
      render: (c: CallLog) => (
        <div className="flex items-center gap-1.5">
          {c.type === 'voice' ? <Phone size={13} className="text-gray-500" /> : <Video size={13} className="text-gray-500" />}
          <span className="text-sm capitalize">{c.type}</span>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (c: CallLog) => (
        <div className="flex items-center gap-1.5">
          {statusIcon(c.status, c.type)}
          <CallStatusBadge status={c.status} />
        </div>
      ),
    },
    {
      key: 'duration', header: 'Duration',
      render: (c: CallLog) => <span className="text-sm font-mono">{fmtDuration(c.duration)}</span>,
    },
    {
      key: 'date', header: 'Date',
      render: (c: CallLog) => <span className="text-xs text-gray-500">{fmtDate(c.createdAt)}</span>,
    },
    {
      key: 'action', header: 'Action',
      render: (c: CallLog) => (
        <a href={`tel:${c.recipientPhone}`}>
          <button className="flex items-center gap-1 px-2.5 py-1.5 bg-[#165B43]/10 text-[#165B43] rounded-lg text-xs font-medium hover:bg-[#165B43]/20 transition-colors">
            <Phone size={11} />Call Back
          </button>
        </a>
      ),
    },
  ];

  return (
    <Layout title="Call Logs">
      <div className="flex items-center justify-between mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search calls..." className="w-64" />
        <p className="text-xs text-gray-500">{filtered.length} call{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Calls', value: calls.length, color: '#165B43' },
          { label: 'Answered', value: calls.filter(c => c.status === 'ended').length, color: '#10b981' },
          { label: 'Missed', value: calls.filter(c => c.status === 'missed').length, color: '#f59e0b' },
          { label: 'Rejected', value: calls.filter(c => c.status === 'rejected').length, color: '#ef4444' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">Loading call logs...</div>
      ) : (
        <Table columns={columns} data={filtered} rowKey={(c) => c._id} emptyText="No call logs found" />
      )}
    </Layout>
  );
}
