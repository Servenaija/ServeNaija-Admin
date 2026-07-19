import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import { KYCStatusBadge } from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import SearchInput from '../../components/UI/SearchInput';
import Avatar from '../../components/UI/Avatar';
import Modal from '../../components/UI/Modal';
import { listKYC, approveKYC, rejectKYC } from '../../services/api';
import type { KYCStatus } from '../../types';
import { CheckCircle, XCircle, ExternalLink, ShieldCheck, Clock, Eye } from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_FILTERS: KYCStatus[] = ['submitted', 'pending', 'approved', 'rejected', 'not_started'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function KYCPage() {
  const [kycRecords, setKycRecords] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<KYCStatus | 'all'>('all');
  const [viewRecord, setViewRecord] = useState<Row | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRecords = () => {
    setLoading(true);
    listKYC({ search: search || undefined, status: statusFilter !== 'all' ? statusFilter : undefined, limit: 100, page: 0 })
      .then((res) => { setKycRecords(res.records as Row[]); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(loadRecords, 300);
  }, [search, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = kycRecords;

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await approveKYC(id);
      setKycRecords((prev: Row[]) => prev.map((r) => r._id === id || r.id === id ? { ...r, status: 'approved', reviewedAt: new Date().toISOString() } : r));
      setViewRecord(null);
    } catch { /* ignore */ } finally { setActionLoading(false); }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await rejectKYC(id, rejectReason.trim());
      setKycRecords((prev: Row[]) => prev.map((r) => r._id === id || r.id === id ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString(), rejectionReason: rejectReason.trim() } : r));
      setViewRecord(null);
      setRejectReason('');
      setShowRejectInput(false);
    } catch { /* ignore */ } finally { setActionLoading(false); }
  };

  const pendingCount = kycRecords.filter((r: Row) => r.status === 'pending' || r.status === 'submitted').length;
  const approvedCount = kycRecords.filter((r: Row) => r.status === 'approved').length;
  const rejectedCount = kycRecords.filter((r: Row) => r.status === 'rejected').length;

  return (
    <Layout title="KYC Verification">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total', value: kycRecords.length, color: '#165B43', icon: ShieldCheck },
          { label: 'Pending Review', value: pendingCount, color: '#f59e0b', icon: Clock },
          { label: 'Approved', value: approvedCount, color: '#10b981', icon: CheckCircle },
          { label: 'Rejected', value: rejectedCount, color: '#ef4444', icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${statusFilter === 'all' ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            All <span className="ml-1 opacity-60">{total}</span>
          </button>
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${statusFilter === s ? 'bg-[#165B43] text-white border-[#165B43]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search KYC records..." className="w-64" />
      </div>

      {/* KYC Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rec) => (
          <Card key={rec._id || rec.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setViewRecord(rec); setShowRejectInput(false); setRejectReason(''); }}>
            <CardBody>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={rec.userName} size="md" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{rec.userName}</p>
                    <p className="text-xs text-gray-500 capitalize">{rec.userType}</p>
                  </div>
                </div>
                <KYCStatusBadge status={rec.status} />
              </div>

              <div className="space-y-2 text-xs">
                {rec.documentType && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Document</span>
                    <span className="font-medium capitalize">{rec.documentType.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {rec.livenessScore !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Liveness</span>
                    <span className={`font-medium ${rec.livenessScore > 0.8 ? 'text-green-600' : 'text-red-500'}`}>
                      {(rec.livenessScore * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {rec.faceMatchScore !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Face Match</span>
                    <span className={`font-medium ${rec.faceMatchScore > 0.8 ? 'text-green-600' : 'text-red-500'}`}>
                      {(rec.faceMatchScore * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted</span>
                  <span>{fmtDate(rec.createdAt)}</span>
                </div>
                {rec.rejectionReason && (
                  <div className="p-2 bg-red-50 rounded-lg">
                    <span className="text-red-600">Rejected: {rec.rejectionReason}</span>
                  </div>
                )}
              </div>

              {(rec.status === 'pending' || rec.status === 'submitted') && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApprove(rec._id || rec.id); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle size={12} />Approve
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setViewRecord(rec); setShowRejectInput(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    <XCircle size={12} />Reject
                  </button>
                </div>
              )}
            </CardBody>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p>No KYC records found</p>
          </div>
        )}
      </div>

      {/* KYC Detail Modal */}
      <Modal open={!!viewRecord} onClose={() => setViewRecord(null)} title="KYC Details" size="md">
        {viewRecord && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={viewRecord.userName} size="lg" />
              <div>
                <p className="font-bold text-gray-800">{viewRecord.userName}</p>
                <p className="text-sm text-gray-500 capitalize">{viewRecord.userType}</p>
                <KYCStatusBadge status={viewRecord.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Document Type" value={viewRecord.documentType?.replace(/_/g, ' ') ?? '—'} />
              <InfoRow label="Document Number" value={viewRecord.documentNumber ?? '—'} />
              {viewRecord.dojahJobId && <InfoRow label="Dojah Job ID" value={viewRecord.dojahJobId} />}
              {viewRecord.livenessScore !== null && <InfoRow label="Liveness Score" value={`${(viewRecord.livenessScore * 100).toFixed(1)}%`} />}
              {viewRecord.faceMatchScore !== null && <InfoRow label="Face Match Score" value={`${(viewRecord.faceMatchScore * 100).toFixed(1)}%`} />}
              {viewRecord.faceMatchPassed !== null && <InfoRow label="Face Match Passed" value={viewRecord.faceMatchPassed ? '✓ Yes' : '✗ No'} />}
              <InfoRow label="Submitted" value={fmtDate(viewRecord.createdAt)} />
              {viewRecord.reviewedAt && <InfoRow label="Reviewed" value={fmtDate(viewRecord.reviewedAt)} />}
            </div>

            <div className="flex gap-3">
              {viewRecord.documentImageUrl && (
                <a href={viewRecord.documentImageUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-sm text-[#165B43] hover:underline px-3 py-2 bg-gray-50 rounded-lg">
                  <ExternalLink size={13} />View Document
                </a>
              )}
              {viewRecord.selfieImageUrl && (
                <a href={viewRecord.selfieImageUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-sm text-[#165B43] hover:underline px-3 py-2 bg-gray-50 rounded-lg">
                  <Eye size={13} />View Selfie
                </a>
              )}
            </div>

            {viewRecord.rejectionReason && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-xs text-red-600 font-semibold mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{viewRecord.rejectionReason}</p>
              </div>
            )}

            {(viewRecord.status === 'pending' || viewRecord.status === 'submitted') && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {showRejectInput && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain why this KYC is being rejected..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="primary" icon={<CheckCircle size={14} />} onClick={() => handleApprove(viewRecord._id || viewRecord.id)} disabled={actionLoading}>
                    Approve KYC
                  </Button>
                  {!showRejectInput ? (
                    <Button variant="danger" icon={<XCircle size={14} />} onClick={() => setShowRejectInput(true)}>
                      Reject KYC
                    </Button>
                  ) : (
                    <Button variant="danger" icon={<XCircle size={14} />} onClick={() => handleReject(viewRecord._id || viewRecord.id)} disabled={!rejectReason.trim() || actionLoading}>
                      Confirm Reject
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
