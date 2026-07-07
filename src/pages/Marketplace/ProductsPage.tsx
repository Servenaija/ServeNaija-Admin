import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import { mockProducts } from '../../data/mock';
import type { Product } from '../../types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ProductsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockProducts.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.storeName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const columns = [
    {
      key: 'name', header: 'Product',
      render: (p: Product) => (
        <div>
          <p className="font-medium text-gray-800">{p.name}</p>
          <p className="text-xs text-gray-500">{p.description}</p>
        </div>
      ),
    },
    {
      key: 'store', header: 'Store',
      render: (p: Product) => <span className="text-sm text-gray-700">{p.storeName}</span>,
    },
    {
      key: 'category', header: 'Category',
      render: (p: Product) => <span className="text-sm text-gray-600">{p.category}</span>,
    },
    {
      key: 'price', header: 'Price',
      render: (p: Product) => (
        <div>
          <p className="text-sm font-semibold text-[#165B43]">₦{p.price.toLocaleString()}</p>
          {p.originalPrice && <p className="text-xs text-gray-400 line-through">₦{p.originalPrice.toLocaleString()}</p>}
        </div>
      ),
    },
    {
      key: 'stock', header: 'Stock',
      render: (p: Product) => (
        <Badge variant={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'danger'}>
          {p.stock} left
        </Badge>
      ),
    },
    {
      key: 'sold', header: 'Sold',
      render: (p: Product) => <span className="text-sm">{p.soldCount}</span>,
    },
    {
      key: 'rating', header: 'Rating',
      render: (p: Product) => <span className="text-[#D6A643] font-semibold text-sm">★ {p.rating}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (p: Product) => <Badge variant={p.isActive ? 'success' : 'default'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'created', header: 'Added',
      render: (p: Product) => <span className="text-xs text-gray-500">{fmtDate(p.createdAt)}</span>,
    },
  ];

  return (
    <Layout title="Products">
      <div className="flex items-center justify-between mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products..." className="w-64" />
        <p className="text-xs text-gray-500">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
      </div>
      <Table columns={columns} data={filtered} rowKey={(p) => p.id} emptyText="No products found" />
    </Layout>
  );
}
