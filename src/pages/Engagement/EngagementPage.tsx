import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import EngagementStats from './EngagementStats';
import EngagementList from './EngagementList';
import ContactModal from './ContactModal';
import { getOnlinePresence, getUserActivity, getUserContact } from '../../services/adminOps';
import toast from 'react-hot-toast';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function EngagementPage() {
  const [presence, setPresence] = useState<Row | null>(null);
  const [activity, setActivity] = useState<Row | null>(null);
  const [days, setDays] = useState(14);
  const [tab, setTab] = useState<'online' | 'active' | 'dormant'>('online');
  const [contact, setContact] = useState<Row | null>(null);
  const [contactFor, setContactFor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getOnlinePresence(), getUserActivity({ days: 14 })])
      .then(([p, a]) => { setPresence(p); setActivity(a); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { getUserActivity({ days }).then(setActivity).catch(() => {}); }, [days]);

  const openContact = async (actor: 'customer' | 'provider', id: string, name: string) => {
    try {
      const res = await getUserContact(actor, id);
      setContact({ ...res.contact, actor });
      setContactFor(name);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Layout title="Engagement">
      <EngagementStats presence={presence} activity={activity} days={days} />
      <EngagementList presence={presence} activity={activity} days={days} setDays={setDays} tab={tab} setTab={setTab} loading={loading} onContact={openContact} />
      <ContactModal contact={contact} contactFor={contactFor} onClose={() => setContact(null)} />
    </Layout>
  );
}
