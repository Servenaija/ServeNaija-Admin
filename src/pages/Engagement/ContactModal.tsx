import { useState } from 'react';
import Modal from '../../components/UI/Modal';
import Button from '../../components/UI/Button';
import { sendDirectMessage, targetedPush } from '../../services/adminOps';
import { Phone, Mail, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function ContactModal({ contact, contactFor, onClose }: { contact: Row | null; contactFor: string; onClose: () => void }) {
  const [msgText, setMsgText] = useState('');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');

  const handleDirect = async () => {
    if (!msgText.trim() || !contact) return;
    try {
      await sendDirectMessage(String(contact._id), contact.actor, msgText.trim());
      toast.success('Message sent');
      setMsgText('');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handlePush = async () => {
    if (!pushTitle.trim() || !pushBody.trim() || !contact) return;
    try {
      await targetedPush({ userId: String(contact._id), actorType: contact.actor, title: pushTitle.trim(), body: pushBody.trim() });
      toast.success('Push sent');
      setPushTitle('');
      setPushBody('');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Modal open={!!contact} onClose={onClose} title={`Contact — ${contactFor}`}>
      {contact && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <a href={`tel:${contact.phoneNumber}`} className="flex items-center gap-2 text-[#165B43]"><Phone size={14} /> {contact.phoneNumber || 'No phone'}</a>
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-[#165B43]"><Mail size={14} /> {contact.email}</a>
            <p className="text-xs text-gray-500">Push: {contact.expoPushToken ? 'registered' : 'none'} · Last login: {contact.lastLogin ? new Date(contact.lastLogin).toLocaleString() : 'never'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1 flex items-center gap-1"><MessageSquare size={12} /> Direct message</p>
            <div className="flex gap-2">
              <input value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder="Write a message..." className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              <Button size="sm" icon={<Send size={13} />} onClick={handleDirect} disabled={!msgText.trim()}>Send</Button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1">Targeted push</p>
            <input value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-2" />
            <textarea value={pushBody} onChange={(e) => setPushBody(e.target.value)} placeholder="Body" rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none" />
            <Button size="sm" className="mt-2" icon={<Send size={13} />} onClick={handlePush} disabled={!pushTitle.trim() || !pushBody.trim()}>Send push</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
