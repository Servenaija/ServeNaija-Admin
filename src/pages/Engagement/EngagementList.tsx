import { useState } from 'react';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import { Badge } from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Avatar from '../../components/UI/Avatar';
import SearchInput from '../../components/UI/SearchInput';
import Pagination from '../../components/UI/Pagination';
import { CircleDot } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
type Tab = 'online' | 'active' | 'dormant';

const PAGE_SIZE = 25;

export default function EngagementList({ presence, activity, days, setDays, tab, setTab, loading, onContact }: {
  presence: Row | null; activity: Row | null; days: number; setDays: (d: number) => void;
  tab: Tab; setTab: (t: Tab) => void; loading: boolean;
  onContact: (actor: 'customer' | 'provider', id: string, name: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rows: Row[] = (() => {
    if (tab === 'online') {
      return [
        ...(presence?.onlineProviders || []).map((u: Row) => ({ ...u, actor: 'provider' as const })),
        ...(presence?.onlineCustomers || []).map((u: Row) => ({ ...u, actor: 'customer' as const })),
      ];
    }
    if (tab === 'active') {
      return [
        ...(activity?.providers?.active || []).map((u: Row) => ({ ...u, actor: 'provider' as const })),
        ...(activity?.customers?.active || []).map((u: Row) => ({ ...u, actor: 'customer' as const })),
      ];
    }
    return [
      ...(activity?.providers?.dormant || []).map((u: Row) => ({ ...u, actor: 'provider' as const })),
      ...(activity?.customers?.dormant || []).map((u: Row) => ({ ...u, actor: 'customer' as const })),
    ];
  })().filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pageRows = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  // reset to first page when the tab changes
  const switchTab = (t: Tab) => { setPage(0); setTab(t); };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex gap-2">
            {(['online', 'active', 'dormant'] as const).map((t) => (
              <button key={t} onClick={() => switchTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize ${tab === t ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-white text-gray-600 border-gray-200'}`}>{t}</button>
            ))}
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg">
              {[7, 14, 30, 60].map((d) => <option key={d} value={d}>last {d}d</option>)}
            </select>
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search users..." className="w-56" />
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {loading ? <p className="text-center py-10 text-sm text-gray-400">Loading...</p> : (
          <div className="divide-y divide-gray-50">
            {pageRows.map((u: Row) => (
              <div key={`${u.actor}:${u._id}`} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={u.fullName || '?'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email} · {u.phoneNumber || ''}</p>
                </div>
                <Badge variant={u.actor === 'provider' ? 'info' : 'gold'}>{u.actor}</Badge>
                {tab === 'online' && <CircleDot size={12} className="text-green-500" />}
                <Button variant="secondary" size="sm" onClick={() => onContact(u.actor, String(u._id), u.fullName)}>Contact</Button>
              </div>
            ))}
            {rows.length === 0 && <p className="text-center py-10 text-sm text-gray-400">No users in this view</p>}
          </div>
        )}
      </CardBody>
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-gray-100">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={rows.length} pageSize={PAGE_SIZE} />
        </div>
      )}
    </Card>
  );
}
