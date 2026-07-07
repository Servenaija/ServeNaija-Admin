import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import { mockTransactions } from '../../data/mock';
import type { Transaction } from '../../types';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const txnColor = (type: string) => {
  if (['credit', 'escrow_release', 'refund'].includes(type)) return 'text-green-600';
  return 'text-red-500';
};

const txnSign = (type: string) => ['credit', 'escrow_release', 'refund'].includes(type) ? '+' : '-';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const types = ['all', 'credit', 'debit', 'escrow_hold', 'escrow_release', 'refund', 'withdrawal'];

  const filtered = mockTransactions.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.ownerName.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalVolume = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
  const credits = mockTransactions.filter(t => t.type === 'credit' || t.type === 'escrow_release');
  const debits = mockTransactions.filter(t => t.type === 'debit' || t.type === 'withdrawal' || t.type === 'escrow_hold');

  const columns = [
    {
      key: 'ref', header: 'Reference',
      render: (t: Transaction) => <span className="text-xs font-mono text-gray-600">{t.reference}</span>,
    },
    {
      key: 'owner', header: 'User',
      render: (t: Transaction) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{t.ownerName}</p>
          <Badge variant={t.ownerType === 'provider' ? 'info' : 'gold'} className="text-[9px]">{t.ownerType}</Badge>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type',
      render: (t: Transaction) => (
        <div className="flex items-center gap-1.5">
          {['credit', 'escrow_release', 'refund'].includes(t.type)
            ? <ArrowDownLeft size={12} className="text-green-500" />
            : <ArrowUpRight size={12} className="text-red-500" />}
          <span className="text-sm capitalize">{t.type.replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      key: 'amount', header: 'Amount',
      render: (t: Transaction) => (
        <span className={`text-sm font-semibold ${txnColor(t.type)}`}>
          {txnSign(t.type)}₦{t.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'description', header: 'Description',
      render: (t: Transaction) => <span className="text-xs text-gray-600">{t.description}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (t: Transaction) => (
        <Badge variant={t.status === 'success' ? 'success' : t.status === 'failed' ? 'danger' : 'warning'}>
          {t.status}
        </Badge>
      ),
    },
    {
      key: 'date', header: 'Date',
      render: (t: Transaction) => <span className="text-xs text-gray-500">{fmtDate(t.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Transactions">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#165B43]/10"><CreditCard size={18} className="text-[#165B43]" /></div>
          <div>
            <p className="text-xl font-bold text-gray-800">{mockTransactions.length}</p>
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

      <Table columns={columns} data={filtered} rowKey={(t) => t.id} emptyText="No transactions found" />
    </Layout>
  );
}
