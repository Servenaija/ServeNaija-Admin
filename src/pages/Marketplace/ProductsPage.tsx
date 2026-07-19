import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import { listProducts } from '../../services/api';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      listProducts({ search: search || undefined, limit: 100, page: 0 })
        .then((res) => { setProducts(res.products as Row[]); setTotal(res.total); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
  }, [search]);

  const filtered = products;

  const columns = [
    {
      key: 'name', header: 'Product',
      render: (p: Row) => (
        <div>
          <p className="font-medium text-gray-800">{p.name}</p>
          <p className="text-xs text-gray-500">{p.description}</p>
        </div>
      ),
    },
    {
      key: 'store', header: 'Store',
      render: (p: Row) => <span className="text-sm text-gray-700">{p.storeName || p.store?.name || '—'}</span>,
    },
    {
      key: 'category', header: 'Category',
      render: (p: Row) => <span className="text-sm text-gray-600">{p.category || '—'}</span>,
    },
    {
      key: 'price', header: 'Price',
      render: (p: Row) => (
        <div>
          <p className="text-sm font-semibold text-[#165B43]">₦{(p.price || 0).toLocaleString()}</p>
          {p.originalPrice && <p className="text-xs text-gray-400 line-through">₦{p.originalPrice.toLocaleString()}</p>}
        </div>
      ),
    },
    {
      key: 'stock', header: 'Stock',
      render: (p: Row) => (
        <Badge variant={(p.stock || 0) > 10 ? 'success' : (p.stock || 0) > 0 ? 'warning' : 'danger'}>
          {p.stock ?? 0} left
        </Badge>
      ),
    },
    {
      key: 'sold', header: 'Sold',
      render: (p: Row) => <span className="text-sm">{p.soldCount ?? 0}</span>,
    },
    {
      key: 'rating', header: 'Rating',
      render: (p: Row) => <span className="text-[#D6A643] font-semibold text-sm">★ {p.rating ?? '—'}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (p: Row) => <Badge variant={p.isActive ? 'success' : 'default'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'created', header: 'Created',
      render: (p: Row) => <span className="text-xs text-gray-500">{fmtDate(p.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Products">
      <div className="flex items-center justify-between mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products..." className="w-64" />
        <p className="text-xs text-gray-500">{loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''}`}</p>
      </div>
      <Table columns={columns} data={filtered} rowKey={(p) => p._id || p.id} emptyText={loading ? 'Loading products...' : 'No products found'} />
    </Layout>
  );
}

