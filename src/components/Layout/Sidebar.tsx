import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Tag, CalendarCheck, Wrench,
  ShoppingBag, Package, CreditCard, ShieldCheck, MessageSquare, Phone,
  Bell, UserCog, Settings, LogOut, Store, X, Wallet, Radio, Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOpsRealtime } from '../../hooks/useOpsRealtime';
import logoIcon from '../../assets/logo.png';
import logoText from '../../assets/serveNaija-text.png';

type BadgeKey = null | 'chat' | 'total';
type NavItem = { to: string; icon: typeof LayoutDashboard; label: string; badgeKey?: BadgeKey };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/finance', icon: Wallet, label: 'Finance' },
      { to: '/payouts', icon: CreditCard, label: 'Payouts' },
      { to: '/engagement', icon: Activity, label: 'Engagement' },
    ],
  },
  {
    label: 'User Management',
    items: [
      { to: '/providers', icon: UserCheck, label: 'Providers' },
      { to: '/customers', icon: Users, label: 'Customers' },
      { to: '/agents', icon: UserCog, label: 'Agents' },
    ],
  },
  {
    label: 'Service Config',
    items: [
      { to: '/categories', icon: Tag, label: 'Categories' },
      { to: '/services', icon: Wrench, label: 'Services' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
      { to: '/marketplace/orders', icon: ShoppingBag, label: 'Orders' },
      { to: '/marketplace/live', icon: Radio, label: 'Market Live' },
      { to: '/marketplace/stores', icon: Store, label: 'Stores' },
      { to: '/marketplace/products', icon: Package, label: 'Products' },
      { to: '/transactions', icon: CreditCard, label: 'Transactions' },
    ],
  },
  {
    label: 'Verification',
    items: [
      { to: '/kyc', icon: ShieldCheck, label: 'KYC / Verification' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/chat', icon: MessageSquare, label: 'Chat', badgeKey: 'chat' as BadgeKey },
      { to: '/calls', icon: Phone, label: 'Calls' },
      { to: '/notifications', icon: Bell, label: 'Notifications', badgeKey: 'total' as BadgeKey },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { unreadChat, unreadTotal } = useOpsRealtime();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full flex flex-col z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{
        width: 'var(--sidebar-width)',
        background: 'linear-gradient(180deg, #0f3d2a 0%, #0a2a1d 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <img src={logoIcon} alt="ServeNaija" className="w-9 h-9 rounded-full object-cover flex-shrink-0" style={{ boxShadow: '0 0 0 2px rgba(214,166,67,0.5)' }} />
        <div className="flex-1 min-w-0">
          <img src={logoText} alt="ServeNaija" className="h-5 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin Console</p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden ml-auto p-1 rounded-md"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p
              className="px-3 mb-1.5"
              style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label, badgeKey }) => {
                const badge = badgeKey === 'chat' ? unreadChat : badgeKey === 'total' ? unreadTotal : 0;
                return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all border-l-2 ${
                      isActive ? 'sidebar-link-active' : 'border-transparent hover:bg-white/[0.06]'
                    }`
                  }
                  style={({ isActive }) => ({ color: isActive ? '#D6A643' : 'rgba(255,255,255,0.55)' })}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  {badge > 0 && (
                    <span className="min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4 pt-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'rgba(255,255,255,0.06)'; el.style.color = 'rgba(255,255,255,0.85)'; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = ''; el.style.color = 'rgba(255,255,255,0.4)'; }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
