import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import StatCard from '../components/UI/StatCard';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import { BookingStatusBadge } from '../components/UI/Badge';
import Avatar from '../components/UI/Avatar';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, UserCheck, CalendarCheck, DollarSign, ShieldCheck, ShoppingBag,
  AlertTriangle, TrendingUp, Clock, CheckCircle2,
} from 'lucide-react';
import { getDashboard, listBookings, listProviders } from '../services/api';
import type { DashboardData } from '../services/api';

const COLORS = ['#165B43', '#D6A643', '#ef4444', '#f97316'];
const fmt = (n: number) => n >= 1000000 ? `₦${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n / 1000).toFixed(0)}K` : `₦${n}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [recentBookings, setRecentBookings] = useState<Row[]>([]);
  const [topProviders, setTopProviders] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboard(),
      listBookings({ limit: 4, page: 0 }),
      listProviders({ limit: 5, page: 0 }),
    ])
      .then(([dashData, bookingsRes, providersRes]) => {
        setStats(dashData);
        setRecentBookings((bookingsRes.bookings as Row[]).slice(0, 4));
        setTopProviders((providersRes.providers as Row[]).slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#165B43] border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout title="Dashboard">
        <p className="text-gray-500 text-sm">Unable to load dashboard data. Make sure the API server is running.</p>
      </Layout>
    );
  }

  const s = stats;

  return (
    <Layout title="Dashboard">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Providers" value={s.totalProviders} icon={UserCheck} color="#165B43" trend={12} sub={`${s.activeProviders} active · ${s.pendingKYC} KYC pending`} />
        <StatCard title="Total Customers" value={s.totalCustomers} icon={Users} color="#D6A643" trend={18} sub={`${s.activeCustomers} active`} />
        <StatCard title="Total Bookings" value={s.totalBookings} icon={CalendarCheck} color="#3b82f6" trend={8} sub={`${s.pendingBookings} pending · ${s.disputedBookings} disputed`} />
        <StatCard title="Platform Revenue" value={fmt(s.totalRevenue)} icon={DollarSign} color="#10b981" trend={15} sub={`Today: ${fmt(s.todayRevenue)}`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Platform Fees" value={fmt(s.platformFees)} icon={TrendingUp} color="#8b5cf6" />
        <StatCard title="Completed Bookings" value={s.completedBookings} icon={CheckCircle2} color="#10b981" />
        <StatCard title="Total Orders" value={s.totalOrders} icon={ShoppingBag} color="#f97316" />
        <StatCard title="Disputed Bookings" value={s.disputedBookings} icon={AlertTriangle} color="#ef4444" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <p className="font-semibold text-gray-800 text-sm">Revenue & Bookings Overview</p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={s.revenueChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#165B43" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#165B43" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v, n) => [n === 'revenue' ? fmt(v as number) : v, n === 'revenue' ? 'Revenue' : 'Bookings']} />
                <Area type="monotone" dataKey="revenue" stroke="#165B43" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Booking Status Pie */}
        <Card>
          <CardHeader>
            <p className="font-semibold text-gray-800 text-sm">Booking Status</p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={s.bookingStatusChart} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {s.bookingStatusChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* User Growth Line Chart */}
        <Card>
          <CardHeader>
            <p className="font-semibold text-gray-800 text-sm">User Growth</p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={s.userGrowthChart}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="providers" stroke="#165B43" strokeWidth={2} dot={false} name="Providers" />
                <Line type="monotone" dataKey="customers" stroke="#D6A643" strokeWidth={2} dot={false} name="Customers" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Monthly Bookings Bar */}
        <Card>
          <CardHeader>
            <p className="font-semibold text-gray-800 text-sm">Monthly Bookings</p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={s.revenueChart}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#D6A643" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800 text-sm">Recent Bookings</p>
              <span className="text-xs text-[#165B43] font-medium cursor-pointer hover:underline">View all</span>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-50">
              {recentBookings.map((bk) => (
                <div key={bk._id || bk.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={bk.customer?.fullName || bk.customer?.name || '?'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{bk.customer?.fullName || bk.customer?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{bk.service?.name} · {bk.provider?.fullName || bk.provider?.name}</p>
                  </div>
                  <BookingStatusBadge status={bk.status} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Top Providers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800 text-sm">Top Providers</p>
              <span className="text-xs text-[#165B43] font-medium cursor-pointer hover:underline">View all</span>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-50">
              {topProviders.filter((p: Row) => !p.isBanned).slice(0, 4).map((prov: Row) => (
                <div key={prov._id || prov.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={prov.fullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{prov.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{prov.service?.category} · {prov.location?.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-[#D6A643]">★ {prov.rating ?? '—'}</p>
                    <p className="text-xs text-gray-400">{prov.totalJobs ?? 0} jobs</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Platform Health Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-green-500" />
            <p className="text-xs font-semibold text-gray-600">KYC Approved</p>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {Math.max(0, s.totalProviders - s.pendingKYC)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-yellow-500" />
            <p className="text-xs font-semibold text-gray-600">KYC Pending</p>
          </div>
          <p className="text-xl font-bold text-gray-800">{s.pendingKYC}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <p className="text-xs font-semibold text-gray-600">Disputed</p>
          </div>
          <p className="text-xl font-bold text-gray-800">{s.disputedBookings}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-blue-500" />
            <p className="text-xs font-semibold text-gray-600">Today's Bookings</p>
          </div>
          <p className="text-xl font-bold text-gray-800">{s.todayBookings}</p>
        </div>
      </div>
    </Layout>
  );
}
