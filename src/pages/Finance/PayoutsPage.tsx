import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import SearchInput from '../../components/UI/SearchInput';
import Button from '../../components/UI/Button';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import PayoutQueueTable from './PayoutQueueTable';
import { getPayoutQueue, releaseBulkPayouts, releaseAllPayouts } from '../../services/adminOps';
import { ArrowDownLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fmtN } from './FinanceCards';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function PayoutsPage() {
  const [queue, setQueue] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmAll, setConfirmAll] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setQueue(await getPayoutQueue(100));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const items: Row[] = (queue?.items || []).filter((i: Row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (i.label || '').toLowerCase().includes(q);
  });
  const selTotal = items
    .filter((i) => selected.includes(`${i.targetType}:${i.targetId}`))
    .reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const doSelected = async () => {
    if (!selected.length) return;
    setReleasing(true);
    try {
      const payload = selected.map((k) => {
        const [targetType, targetId] = k.split(':');
        return { targetType, targetId };
      });
      const res = await releaseBulkPayouts(payload);
      toast.success(res.message || 'Bulk release done');
      setSelected([]);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setReleasing(false);
    }
  };

  const doAll = async () => {
    setReleasing(true);
    try {
      const res = await releaseAllPayouts();
      toast.success(res.message || 'All released');
      setSelected([]);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setReleasing(false);
      setConfirmAll(false);
    }
  };

  return (
    <Layout title="Payouts">
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#165B43] border-t-transparent" /></div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div>
                <p className="font-semibold text-sm">Payout Queue</p>
                <p className="text-xs text-gray-500">
                  Total <b>{fmtN(queue?.payoutTotal ?? 0)}</b>
                  {queue?.sufficient === false && <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-semibold"><AlertTriangle size={12} /> Shortfall {fmtN(queue?.shortfall ?? 0)}</span>}
                  {queue?.sufficient === true && <span className="ml-2 inline-flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 size={12} /> Sufficient</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SearchInput value={search} onChange={setSearch} placeholder="Search..." className="w-52" />
                <Button variant="secondary" size="sm" disabled={!selected.length || releasing} onClick={doSelected}>Pay selected ({selected.length}) · {fmtN(selTotal)}</Button>
                <Button variant="primary" size="sm" disabled={releasing || !items.length} onClick={() => setConfirmAll(true)}><ArrowDownLeft size={14} /> Release all</Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <PayoutQueueTable items={items} selected={selected} setSelected={setSelected} releasing={releasing} onReload={load} />
          </CardBody>
        </Card>
      )}
      <ConfirmDialog open={confirmAll} title="Release all?" message={`Release ${items.length} payouts totalling ${fmtN(queue?.payoutTotal ?? 0)}?`} confirmLabel="Release all" onConfirm={doAll} onCancel={() => setConfirmAll(false)} variant="primary" />
    </Layout>
  );
}
