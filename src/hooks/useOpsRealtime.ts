// hooks/useOpsRealtime.ts — global realtime listener for admin.
// Listens to socket events + polls unread counts for navbar badge.
// Plays a sound even when admin is NOT on /chat.
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { getUnreadCounts } from '../services/adminOps';

export function useOpsRealtime() {
  const { socket } = useSocket();
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadTickets, setUnreadTickets] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    try {
      if (!audioRef.current) audioRef.current = new Audio('/notification.mp3');
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch { /* ignore */ }
  };

  const refresh = async () => {
    try {
      const c = await getUnreadCounts();
      setUnreadChat(c.conversationsUnread || 0);
      setUnreadTickets(c.ticketsUnread || 0);
      setUnreadTotal(c.total || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onMsg = (m: unknown) => {
      const msg = m as { text?: string; senderName?: string; senderType?: string; conversation?: string };
      // only toast+sound for inbound (non-admin) messages
      if (msg?.senderType && msg.senderType !== 'admin') {
        playSound();
        toast.success(msg.senderName ? `New message from ${msg.senderName}` : 'New message');
        refresh();
      }
    };
    const onTicket = (d: unknown) => {
      const data = d as { message?: { senderType?: string; senderName?: string } };
      if (data?.message?.senderType === 'user') {
        playSound();
        toast.success(data.message.senderName ? `Support reply from ${data.message.senderName}` : 'New support reply');
        refresh();
      }
    };
    const onNotif = (n: unknown) => {
      const notif = n as { title?: string; body?: string };
      playSound();
      toast(notif?.title ? `${notif.title}: ${notif.body || ''}` : 'New notification');
      refresh();
    };
    socket.on('new_message', onMsg);
    socket.on('new_ticket_message', onTicket);
    socket.on('new_ticket', onTicket);
    socket.on('notification', onNotif);
    socket.on('booking_updated', refresh);
    socket.on('order_updated', refresh);
    socket.on('broadcast_sent', refresh);
    return () => {
      socket.off('new_message', onMsg);
      socket.off('new_ticket_message', onTicket);
      socket.off('new_ticket', onTicket);
      socket.off('notification', onNotif);
      socket.off('booking_updated', refresh);
      socket.off('order_updated', refresh);
      socket.off('broadcast_sent', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return { unreadTotal, unreadChat, unreadTickets, refresh };
}
