import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import { Badge } from '../../components/UI/Badge';
import SearchInput from '../../components/UI/SearchInput';
import Button from '../../components/UI/Button';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { listContacts, updateContactStatus, deleteContact, type ContactMessage } from '../../services/api';
import toast from 'react-hot-toast';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ContactPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isReadFilter, setIsReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [readId, setReadId] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [readValue, setReadValue] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [page, limit, isReadFilter, search]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await listContacts({
        page,
        limit,
        isRead: isReadFilter === 'all' ? undefined : isReadFilter === 'read',
      });
      setContacts(res.data);
      setTotal(res.pagination.total);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.topic.toLowerCase().includes(q);
  });

  const unreadCount = contacts.filter((c) => !c.isRead).length;

  const toggleRead = (id: string, isRead: boolean) => {
    setReadId(id);
    setReadValue(!isRead);
  };

  const confirmRead = async () => {
    if (!readId) return;
    setReading(true);
    try {
      await updateContactStatus(readId, readValue);
      toast.success(`Marked as ${readValue ? 'read' : 'unread'}.`);
      setReadId(null);
      await loadContacts();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setReading(false);
      setReadId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteContact(deleteId);
      toast.success('Contact message deleted.');
      setDeleteId(null);
      await loadContacts();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: 'name', header: 'Name',
      render: (c: ContactMessage) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{c.name}</p>
          <p className="text-xs text-gray-500">{c.email}</p>
        </div>
      ),
    },
    {
      key: 'topic', header: 'Topic',
      render: (c: ContactMessage) => (
        <span className="text-sm text-gray-700">{c.topic}</span>
      ),
    },
    {
      key: 'message', header: 'Message',
      render: (c: ContactMessage) => (
        <p className="text-sm text-gray-600 line-clamp-2">{c.message}</p>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (c: ContactMessage) => (
        <Badge variant={c.isRead ? 'success' : 'default'} className="text-[10px]">
          {c.isRead ? 'Read' : 'Unread'}
        </Badge>
      ),
    },
    {
      key: 'date', header: 'Date',
      render: (c: ContactMessage) => <span className="text-xs text-gray-500">{fmtDate(c.createdAt)}</span>,
    },
    {
      key: 'actions', header: 'Actions',
      render: (c: ContactMessage) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRead(c._id, c.isRead)}
          >
            {c.isRead ? 'Mark Unread' : 'Mark Read'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => { setDeleteId(c._id); }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Contact Messages">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#165B43]">{loading ? '...' : total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Messages</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unread</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{contacts.filter((c) => c.isRead).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Read</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#165B43]">{page}</p>
          <p className="text-xs text-gray-500 mt-0.5">Page</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search messages..." className="w-64" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Filter:</span>
            <Button variant="ghost" size="sm" onClick={() => setIsReadFilter('all')}>
              All
            </Button>
            <Button
              variant={isReadFilter === 'unread' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setIsReadFilter('unread')}
            >
              Unread
            </Button>
            <Button
              variant={isReadFilter === 'read' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setIsReadFilter('read')}
            >
              Read
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPage(1);
              setLimit(20);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey={(c) => c._id}
        emptyText={loading ? 'Loading messages...' : 'No contact messages found'}
      />

      <div className="flex items-center justify-between mt-6">
        <div className="text-xs text-gray-500">
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page * limit >= total || loading}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {readId && (
        <ConfirmDialog
          open={true}
          title={readValue ? 'Mark as read?' : 'Mark as unread?'}
          message="Are you sure you want to change the read status of this message?"
          confirmLabel={readValue ? 'Mark Read' : 'Mark Unread'}
          onCancel={() => { setReadId(null); }}
          onConfirm={confirmRead}
          variant="primary"
          loading={reading}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          open={true}
          title="Delete message?"
          message="This action cannot be undone. The contact message will be permanently deleted."
          confirmLabel="Delete"
          onCancel={() => { setDeleteId(null); }}
          onConfirm={confirmDelete}
          variant="danger"
          loading={deleting}
        />
      )}
    </Layout>
  );
}