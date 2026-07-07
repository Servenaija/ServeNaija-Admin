import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import { Badge } from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import SearchInput from '../../components/UI/SearchInput';
import { useApp } from '../../context/AppContext';
import type { NotificationType, UserType } from '../../types';
import { Bell, Send, CheckCheck, Trash2, Users, UserCheck } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const typeVariant: Record<NotificationType, 'info' | 'success' | 'warning' | 'gold' | 'danger' | 'default'> = {
  booking: 'info', payment: 'success', kyc: 'warning',
  chat: 'gold', call: 'info', system: 'default', promotion: 'gold',
};

const emptyBroadcast = { title: '', body: '', type: 'system' as NotificationType, target: 'all' as 'all' | 'providers' | 'customers' };

export default function NotificationsPage() {
  const { notifications, setNotifications, providers, customers } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcast, setBroadcast] = useState(emptyBroadcast);
  const [sent, setSent] = useState(false);

  const filtered = notifications.filter((n) => {
    const q = search.toLowerCase();
    const matchSearch = !q || n.recipientName.toLowerCase().includes(q) || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || n.type === typeFilter;
    return matchSearch && matchType;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })));
  };

  const handleSendBroadcast = () => {
    if (!broadcast.title.trim() || !broadcast.body.trim()) return;

    const recipients = broadcast.target === 'all'
      ? [...providers.map(p => ({ id: p.id, name: p.fullName, type: 'provider' as UserType })),
         ...customers.map(c => ({ id: c.id, name: c.fullName, type: 'customer' as UserType }))]
      : broadcast.target === 'providers'
        ? providers.map(p => ({ id: p.id, name: p.fullName, type: 'provider' as UserType }))
        : customers.map(c => ({ id: c.id, name: c.fullName, type: 'customer' as UserType }));

    const newNotifs = recipients.map((r) => ({
      id: `notif-${Date.now()}-${r.id}`,
      recipient: r.id,
      recipientName: r.name,
      recipientType: r.type,
      title: broadcast.title,
      body: broadcast.body,
      type: broadcast.type,
      data: {},
      isRead: false,
      readAt: null,
      pushStatus: 'sent' as const,
      pushError: null,
      createdAt: new Date().toISOString(),
    }));

    setNotifications((prev) => [...newNotifs, ...prev]);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setShowBroadcast(false);
      setBroadcast(emptyBroadcast);
    }, 1500);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const types: (NotificationType | 'all')[] = ['all', 'booking', 'payment', 'kyc', 'chat', 'call', 'system', 'promotion'];

  return (
    <Layout title="Notifications">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-sm text-gray-600">
            {unreadCount > 0 && <span className="font-semibold text-[#165B43]">{unreadCount} unread</span>}
          </h2>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" icon={<CheckCheck size={14} />} onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search notifications..." className="w-56" />
          <Button icon={<Send size={14} />} onClick={() => setShowBroadcast(true)}>
            Send Broadcast
          </Button>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${typeFilter === t ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <Card>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-20" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.isRead ? 'bg-gray-300' : 'bg-[#165B43] animate-pulse-ring'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{notif.body}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant={typeVariant[notif.type]}>{notif.type}</Badge>
                          <span className="text-xs text-gray-400">→ {notif.recipientName}</span>
                          <Badge variant={notif.recipientType === 'provider' ? 'info' : 'gold'} className="text-[9px]">
                            {notif.recipientType}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-gray-400">{fmtDate(notif.createdAt)}</span>
                        <div className="mt-1">
                          <Badge variant={notif.pushStatus === 'sent' ? 'success' : notif.pushStatus === 'failed' ? 'danger' : 'warning'} className="text-[9px]">
                            {notif.pushStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Broadcast Modal */}
      <Modal open={showBroadcast} onClose={() => setShowBroadcast(false)} title="Send Broadcast Notification" size="md">
        {sent ? (
          <div className="text-center py-8">
            <CheckCheck size={40} className="text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-800">Broadcast Sent!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Target */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Send To</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'Everyone', icon: Users },
                  { value: 'providers', label: 'Providers', icon: UserCheck },
                  { value: 'customers', label: 'Customers', icon: Users },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setBroadcast(b => ({ ...b, target: value as typeof b.target }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${broadcast.target === value ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <Icon size={15} />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Notification Type</label>
              <select
                value={broadcast.type}
                onChange={(e) => setBroadcast(b => ({ ...b, type: e.target.value as NotificationType }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20"
              >
                {(['system', 'promotion', 'booking', 'payment', 'kyc'] as NotificationType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={broadcast.title}
                onChange={(e) => setBroadcast(b => ({ ...b, title: e.target.value }))}
                placeholder="Notification title..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={broadcast.body}
                onChange={(e) => setBroadcast(b => ({ ...b, body: e.target.value }))}
                placeholder="Notification body message..."
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowBroadcast(false)}>Cancel</Button>
              <Button
                className="flex-1"
                icon={<Send size={14} />}
                onClick={handleSendBroadcast}
                disabled={!broadcast.title.trim() || !broadcast.body.trim()}
              >
                Send Broadcast
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
