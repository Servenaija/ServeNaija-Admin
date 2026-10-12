import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Avatar from '../../components/UI/Avatar';
import { Badge } from '../../components/UI/Badge';
import { releaseSinglePayout } from '../../services/adminOps';
import toast from 'react-hot-toast';
import { fmtN } from './FinanceCards';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function PayoutQueueTable({ items, selected, setSelected, releasing, onReload }: {
  items: Row[]; selected: string[]; setSelected: (v: string[]) => void; releasing: boolean; onReload: () => void;
}) {
  const toggle = (key: string) => {
    setSelected(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };
  const doSingle = async (item: Row) => {
    try {
      await releaseSinglePayout(item.targetType, item.targetId);
      toast.success('Payment released');
      setSelected(selected.filter((k) => k !== `${item.targetType}:${item.targetId}`));
      onReload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const columns = [
    {
      key: 'select', header: '',
      render: (i: Row) => {
        const key = `${i.targetType}:${i.targetId}`;
        return <input type="checkbox" checked={selected.includes(key)} onChange={() => toggle(key)} className="w-4 h-4 accent-[#165B43]" />;
      },
    },
    {
      key: 'provider', header: 'Provider',
      render: (i: Row) => (
        <div className="flex items-center gap-3">
          <Avatar name={i.provider?.fullName || '?'} src={i.provider?.profilePhoto} size="md" />
          <div>
            <p className="text-sm font-medium text-gray-800">{i.provider?.fullName || '—'}</p>
            <p className="text-xs text-gray-500">{i.provider?.phoneNumber || i.provider?.email || ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'bank', header: 'Bank account',
      render: (i: Row) => (
        i.bankDetails?.accountNumber ? (
          <div>
            <p className="text-sm text-gray-800">{i.bankDetails.accountName}</p>
            <p className="text-xs font-mono text-gray-500">{i.bankDetails.accountNumber}{i.bankDetails.bankName ? ` · ${i.bankDetails.bankName}` : ''}</p>
            {!i.bankDetails.isVerified && <Badge variant="warning" className="text-[9px] mt-0.5">unverified</Badge>}
          </div>
        ) : <span className="text-xs text-amber-600">No bank details on file</span>
      ),
    },
    {
      key: 'amount', header: 'Total owed',
      render: (i: Row) => (
        <div>
          <p className="text-sm font-bold">{fmtN(i.amount)}</p>
          <p className="text-[10px] text-gray-400">
            wallet {fmtN(i.walletBalance || 0)}
            {(i.bookingEscrow || 0) > 0 && <> · jobs {fmtN(i.bookingEscrow)}</>}
            {(i.orderEscrow || 0) > 0 && <> · orders {fmtN(i.orderEscrow)}</>}
          </p>
        </div>
      ),
    },
    {
      key: 'action', header: 'Release',
      render: (i: Row) => (
        <Button variant="primary" size="sm" disabled={releasing} onClick={(e) => { e.stopPropagation(); doSingle(i); }}>
          Release
        </Button>
      ),
    },
  ];
  return <Table columns={columns} data={items} rowKey={(i) => `${i.targetType}:${i.targetId}`} emptyText="No provider wallets with a balance" />;
}
