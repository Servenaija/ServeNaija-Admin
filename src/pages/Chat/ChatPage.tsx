// src/pages/Chat/ChatPage.tsx
// Support-ticket-only page. Direct 1:1 chat removed from admin console.
// Admin sees and resolves support tickets with real-time updates and sound.

import { useState, useRef, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import { useSocket } from '../../context/SocketContext';
import {
  getAdminTickets,
  getAdminTicket,
  sendAdminMessage,
  resolveTicket,
  adminCloseTicket,
  assignTicket,
} from '../../services/support';
import { Send, CheckCheck, Check, LifeBuoy } from 'lucide-react';
import toast from 'react-hot-toast';

/* ---------- helpers ---------- */
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

const fmtConvDate = (d: string) => {
  const date = new Date(d);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' });
};

/* ---------- types (match backend) ---------- */
type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

type TicketMessage = {
  _id?: string;
  senderId: string;
  senderType: 'user' | 'admin';
  senderName: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  readBy: string[];
};

type Ticket = {
  _id: string;
  user: { userId: string; userType: 'customer' | 'provider'; name: string; email: string };
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
  assignedTo: string | null;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  report?: { reportedUserId?: string | null; reason?: string; description?: string };
};

const getStatusBadge = (status: TicketStatus): string => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-700';
    case 'in-progress': return 'bg-amber-100 text-amber-700';
    case 'resolved': return 'bg-green-100 text-green-700';
    case 'closed': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default function ChatPage() {
  const { socket } = useSocket();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [ticketInput, setTicketInput] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketNotifications, setTicketNotifications] = useState<Record<string, number>>({});
  const [unreadTicketCount, setUnreadTicketCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) audioRef.current = new Audio('/notification.mp3');
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch { /* ignore */ }
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await getAdminTickets({ limit: 50 });
      const ticketsData = (res?.data || []) as Ticket[];
      setTickets(ticketsData);
      const unread = ticketsData.reduce((acc: number, t: Ticket) => acc + (t.unreadCount || 0), 0);
      setUnreadTicketCount(unread);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
    setLoadingTickets(false);
  }, []);

  const loadTicketDetails = useCallback(async (ticketId: string) => {
    try {
      const res = await getAdminTicket(ticketId);
      const ticket = res?.data as Ticket;
      setActiveTicket(ticket);
      setTicketNotifications(prev => ({ ...prev, [ticketId]: 0 }));
      setUnreadTicketCount(prev => Math.max(0, prev - (ticket?.unreadCount || 0)));
    } catch (error) {
      console.error('Failed to load ticket:', error);
      toast.error('Failed to load ticket details');
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (activeTicketId) loadTicketDetails(activeTicketId);
  }, [activeTicketId, loadTicketDetails]);

  useEffect(() => {
    if (!socket) return;

    const onNewTicket = () => {
      toast.success('New support ticket');
      playNotificationSound();
      fetchTickets();
      setUnreadTicketCount(prev => prev + 1);
    };

    const onNewMessage = (data: { ticketId?: string; message?: TicketMessage }) => {
      if (data?.message?.senderType === 'user') {
        playNotificationSound();
        toast.success(
          data.message.senderName ? `New message from ${data.message.senderName}` : 'New message',
        );
        if (activeTicketId && data.ticketId === activeTicketId) loadTicketDetails(activeTicketId);
        else fetchTickets();
      }
    };

    const onTicketUpdated = () => { playNotificationSound(); fetchTickets(); };
    const onResolved = () => { playNotificationSound(); toast.success('Ticket resolved'); fetchTickets(); };
    const onClosed = () => { toast.success('Ticket closed'); fetchTickets(); };
    const onNotification = (notif: { title?: string; body?: string }) => {
      playNotificationSound();
      toast(notif?.title ? `${notif.title}: ${notif.body || ''}` : 'New notification');
    };

    socket.on('new_ticket', onNewTicket);
    socket.on('new_ticket_message', onNewMessage);
    socket.on('ticket_updated', onTicketUpdated);
    socket.on('ticket_resolved', onResolved);
    socket.on('ticket_closed', onClosed);
    socket.on('new_notification', onNotification);

    return () => {
      socket.off('new_ticket', onNewTicket);
      socket.off('new_ticket_message', onNewMessage);
      socket.off('ticket_updated', onTicketUpdated);
      socket.off('ticket_resolved', onResolved);
      socket.off('ticket_closed', onClosed);
      socket.off('new_notification', onNotification);
    };
  }, [socket, activeTicketId, fetchTickets, loadTicketDetails, playNotificationSound]);

  const handleSendTicketMessage = async () => {
    if (!ticketInput.trim() || !activeTicketId) return;
    const text = ticketInput.trim();
    setTicketInput('');
    try {
      // Server expects { message }, not { text }.
      const res = await sendAdminMessage(activeTicketId, { message: text });
      const updated = res?.data?.ticket as Ticket | undefined;
      if (updated) {
        setActiveTicket(updated);
        setTickets(prev =>
          prev.map(t => (t._id === activeTicketId ? { ...t, lastMessageAt: updated.lastMessageAt } : t)),
        );
      } else {
        // Fall back to a local append if the response shape ever changes.
        const localMsg: TicketMessage = {
          _id: `local-${Date.now()}`,
          senderId: 'me',
          senderType: 'admin',
          senderName: 'Admin',
          text,
          createdAt: new Date().toISOString(),
          readBy: [],
        };
        setActiveTicket(prev => (prev ? { ...prev, messages: [...prev.messages, localMsg] } : prev));
      }
      toast.success('Replied to ticket');
      fetchTickets();
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleResolveTicket = async () => {
    if (!activeTicketId) return;
    try {
      // ✅ No body — the controller ignores extra args.
      await resolveTicket(activeTicketId);
      setTickets(prev => prev.map(t => (t._id === activeTicketId ? { ...t, status: 'resolved' as const } : t)));
      setActiveTicket(prev => (prev ? { ...prev, status: 'resolved' as const } : prev));
      toast.success('Ticket resolved');
      fetchTickets();
    } catch {
      toast.error('Failed to resolve ticket');
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicketId) return;
    try {
      // ✅ No second arg.
      await adminCloseTicket(activeTicketId);
      setTickets(prev => prev.map(t => (t._id === activeTicketId ? { ...t, status: 'closed' as const } : t)));
      setActiveTicketId(null);
      setActiveTicket(null);
      toast.success('Ticket closed');
      fetchTickets();
    } catch {
      toast.error('Failed to close ticket');
    }
  };

  const handleAssignToMe = async () => {
    if (!activeTicketId) return;
    try {
      // ✅ Backend assigns to the requesting admin.
      await assignTicket(activeTicketId);
      toast.success('Ticket assigned to you');
      loadTicketDetails(activeTicketId);
      fetchTickets();
    } catch {
      toast.error('Failed to assign ticket');
    }
  };

  return (
    <Layout title='Support Tickets'>
      <div className='flex h-full'>
        {/* ── Left pane: ticket list ────────────────────────────── */}
        <div className='w-full lg:w-96 border-r border-gray-200 flex flex-col'>
          <div className='px-4 py-3 border-b border-gray-100 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-gray-800'>
              Tickets
              {unreadTicketCount > 0 && (
                <span className='ml-2 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full'>
                  {unreadTicketCount > 9 ? '9+' : unreadTicketCount}
                </span>
              )}
            </h2>
          </div>

          <div className='flex-1 overflow-y-auto p-3'>
            {loadingTickets ? (
              <div className='text-center py-8 text-gray-400 text-xs'>Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className='text-center py-8 text-gray-400'>
                <LifeBuoy size={32} className='mx-auto mb-2 opacity-20' />
                <p className='text-sm'>No support tickets</p>
                <p className='text-xs mt-1'>Users will open tickets here</p>
              </div>
            ) : (
              tickets
                .slice()
                .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
                .map((ticket) => {
                  const isActive = ticket._id === activeTicketId;
                  const unread = ticketNotifications[ticket._id] ?? ticket.unreadCount ?? 0;
                  return (
                    <button
                      key={ticket._id}
                      onClick={() => setActiveTicketId(ticket._id)}
                      className={`flex items-start gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${isActive ? 'bg-[#165B43]/5 border-l-2 border-l-[#165B43]' : ''}`}
                    >
                      <div className='relative'>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs ${ticket.user.userType === 'provider' ? 'bg-blue-500' : 'bg-amber-500'}`}>
                          {ticket.user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {unread > 0 && (
                          <span className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center'>
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between mb-0.5'>
                          <p className='text-xs font-semibold text-gray-800 truncate'>{ticket.user.name}</p>
                          <span className='text-[10px] text-gray-400 flex-shrink-0 ml-2'>{fmtConvDate(ticket.lastMessageAt)}</span>
                        </div>
                        <p className='text-[11px] text-gray-500 truncate'>{ticket.subject}</p>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${getStatusBadge(ticket.status)}`}>
                            {ticket.status.replace('-', ' ').toUpperCase()}
                          </span>
                          {ticket.assignedTo && <span className='text-[9px] text-gray-400'>• Assigned</span>}
                        </div>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* ── Right pane: active ticket ─────────────────────────── */}
        <div className='flex-1 flex flex-col'>
          {activeTicket ? (
            <>
              <div className='px-4 py-3 border-b border-gray-100 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs ${activeTicket.user.userType === 'provider' ? 'bg-blue-500' : 'bg-amber-500'}`}>
                    {activeTicket.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-gray-800'>{activeTicket.user.name}</p>
                    <p className='text-[10px] text-gray-400'>{activeTicket.user.userType}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${getStatusBadge(activeTicket.status)}`}>
                    {activeTicket.status.replace('-', ' ').toUpperCase()}
                  </span>
                  {activeTicket.assignedTo && (
                    <span className='text-[10px] text-gray-500'>
                      Assigned to: {activeTicket.assignedTo.slice(0, 6)}...
                    </span>
                  )}
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-4 space-y-3'>
                {activeTicket.messages.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-full text-gray-400'>
                    <LifeBuoy size={40} className='mb-2 opacity-20' />
                    <p className='text-sm'>No messages yet</p>
                  </div>
                ) : (
                  activeTicket.messages.map((msg, i) => {
                    const isAdmin = msg.senderType === 'admin';
                    return (
                      <div key={msg._id || `m-${i}`} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {!isAdmin && (
                          <div className='w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs flex-shrink-0'>
                            {msg.senderName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className={`max-w-xs lg:max-w-md mx-2 ${isAdmin ? 'order-first' : ''}`}>
                          {!isAdmin && <p className='text-[10px] text-gray-500 mb-1 ml-1'>{msg.senderName}</p>}
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${isAdmin
                            ? 'bg-[#165B43] text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'}`}>
                            <p className='leading-relaxed'>{msg.text}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-0.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <span className='text-[10px] text-gray-400'>{fmtTime(msg.createdAt)}</span>
                            {isAdmin && (
                              (msg.readBy?.length ?? 0) > 0
                                ? <CheckCheck size={11} className='text-[#D6A643]' />
                                : <Check size={11} className='text-gray-400' />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {activeTicket.status !== 'closed' && activeTicket.status !== 'resolved' && (
                <div className='px-4 py-3 border-t border-gray-100'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='text'
                      value={ticketInput}
                      onChange={(e) => setTicketInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendTicketMessage(); } }}
                      placeholder='Reply to support ticket...'
                      className='flex-1 px-4 py-2.5 text-sm bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#165B43]/20'
                    />
                    <Button variant='primary' size='sm' icon={<Send size={14} />} onClick={handleSendTicketMessage} disabled={!ticketInput.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              )}

              <div className='px-4 pb-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3'>
                {(activeTicket.status === 'open' || activeTicket.status === 'in-progress') && (
                  <>
                    {!activeTicket.assignedTo && (
                      <Button variant='secondary' size='sm' onClick={handleAssignToMe}>
                        Assign to me
                      </Button>
                    )}
                    <Button variant='primary' size='sm' onClick={handleResolveTicket}>
                      Resolve
                    </Button>
                    <Button variant='secondary' size='sm' onClick={handleCloseTicket}>
                      Close
                    </Button>
                  </>
                )}
                {(activeTicket.status === 'resolved' || activeTicket.status === 'closed') && (
                  <Button variant='ghost' size='sm' onClick={handleCloseTicket}>
                    Close
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className='flex-1 flex items-center justify-center'>
              <div className='text-center'>
                <LifeBuoy size={48} className='mx-auto mb-3 opacity-20' />
                <p className='text-sm text-gray-400'>Select a support ticket to view</p>
                <p className='text-xs text-gray-300 mt-1'>All user support requests appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}