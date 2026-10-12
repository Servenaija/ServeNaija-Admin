import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import { Badge } from '../../components/UI/Badge';
import { getMarketplaceOverview } from '../../services/adminOps';
import toast from 'react-hot-toast';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function MarketplaceLivePage() {
  const [data, setData] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const load = () => getMarketplaceOverview().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <Layout title="Marketplace Live">
      {loading && !data ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#165B43] border-t-transparent" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Stores (active/total)</p><p className="text-xl font-bold">{data?.stores?.active ?? 0} / {data?.stores?.total ?? 0}</p></div>
            <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Active products</p><p className="text-xl font-bold">{data?.products?.active ?? 0}</p></div>
            <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Low stock</p><p className="text-xl font-bold">{(data?.products?.lowStock || []).length}</p></div>
            <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Live</p><p className="text-xl font-bold text-green-600">● updating</p></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader><p className="font-semibold text-sm">Orders by status</p></CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {(data?.statusCounts || []).map((s: Row) => (
                    <div key={s._id} className="flex items-center justify-between text-sm">
                      <Badge variant={s._id === 'delivered' ? 'success' : s._id === 'cancelled' ? 'danger' : 'info'}>{s._id}</Badge>
                      <span className="text-gray-600">{s.count} · ₦{(s.volume || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader><p className="font-semibold text-sm">Latest orders (live)</p></CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-gray-50">
                  {(data?.recentOrders || []).slice(0, 12).map((o: Row) => (
                    <div key={o._id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium">{o.store?.name || '—'} · {o.buyer?.fullName || ''}</p>
                        <p className="text-xs text-gray-500">{(o.items || []).length} items · ₦{(o.total || 0).toLocaleString()}</p>
                      </div>
                      <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'danger' : 'info'}>{o.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </Layout>
  );
}
