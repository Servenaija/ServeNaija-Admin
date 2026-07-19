import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import { listTransactions } from '../../services/api';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const txnColor = (type: string) => {
  if (['credit', 'escrow_release', 'refund'].includes(type)) return 'text-green-600';
  return 'text-red-500';
};

const txnSign = (type: string) => ['credit', 'escrow_release', 'refund'].includes(type) ? '+' : '-';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [transactions, setTransactions] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const types = ['all', 'credit', 'debit', 'escrow_hold', 'escrow_release', 'refund', 'withdrawal'];

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      listTransactions({ search: search || undefined, type: typeFilter !== 'all' ? typeFilter : undefined, limit: 100, page: 0 })
        .then((res) => { setTransactions(res.transactions as Row[]); setTotal(res.total); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
  }, [search, typeFilter]);

  const filtered = transactions;
  const credits = filtered.filter((t: Row) => t.type === 'credit' || t.type === 'escrow_release');
  const debits = filtered.filter((t: Row) => t.type === 'debit' || t.type === 'withdrawal' || t.type === 'escrow_hold');
  const totalVolume = filtered.reduce((sum: number, t: Row) => sum + (t.amount || 0), 0);

  const columns = [
    {
      key: 'ref', header: 'Reference',
      render: (t: Row) => <span className="text-xs font-mono text-gray-600">{t.reference}</span>,
    },
    {
      key: 'owner', header: 'User',
      render: (t: Row) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{t.ownerName || t.owner}</p>
          <Badge variant={(t.ownerType || '') === 'provider' ? 'info' : 'gold'} className="text-[9px]">{t.ownerType || 'user'}</Badge>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type',
      render: (t: Row) => (
        <div className="flex items-center gap-1.5">
          {['credit', 'escrow_release', 'refund'].includes(t.type)
            ? <ArrowDownLeft size={12} className="text-green-500" />
            : <ArrowUpRight size={12} className="text-red-500" />}
          <span className="text-sm capitalize">{(t.type || '').replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      key: 'amount', header: 'Amount',
      render: (t: Row) => (
        <span className={`text-sm font-semibold ${txnColor(t.type)}`}>
          {txnSign(t.type)}₦{(t.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'description', header: 'Description',
      render: (t: Row) => <span className="text-xs text-gray-600">{t.description}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (t: Row) => (
        <Badge variant={t.status === 'success' ? 'success' : t.status === 'failed' ? 'danger' : 'warning'}>
          {t.status}
        </Badge>
      ),
    },
    {
      key: 'date', header: 'Date',
      render: (t: Row) => <span className="text-xs text-gray-500">{fmtDate(t.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Transactions">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#165B43]/10"><CreditCard size={18} className="text-[#165B43]" /></div>
          <div>
            <p className="text-xl font-bold text-gray-800">{loading ? '...' : total}</p>
            <p className="text-xs text-gray-500">Total Transactions</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-50"><TrendingUp size={18} className="text-green-500" /></div>
          <div>
            <p className="text-xl font-bold text-green-600">₦{credits.reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Credits</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50"><TrendingDown size={18} className="text-red-500" /></div>
          <div>
            <p className="text-xl font-bold text-red-500">₦{debits.reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Debits</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50"><DollarSign size={18} className="text-blue-500" /></div>
          <div>
            <p className="text-xl font-bold text-gray-800">₦{totalVolume.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Volume</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {types.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${typeFilter === t ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search transactions..." className="w-64" />
      </div>

      <Table columns={columns} data={filtered} rowKey={(t) => t._id || t.id} emptyText={loading ? 'Loading transactions...' : 'No transactions found'} />
    </Layout>
  );
}
