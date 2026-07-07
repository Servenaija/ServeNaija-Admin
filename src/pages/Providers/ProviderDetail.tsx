import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import { Badge, KYCStatusBadge, BookingStatusBadge } from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Avatar from '../../components/UI/Avatar';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { useApp } from '../../context/AppContext';
import { mockBookings, mockServices, mockTransactions } from '../../data/mock';
import {
  Phone, Mail, MapPin, Shield, Star, Briefcase, Building2,
  CreditCard, Ban, CheckCircle, MessageSquare, ArrowLeft, ExternalLink,
} from 'lucide-react';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtCurrency = (n: number) => `₦${n.toLocaleString()}`;

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { providers, setProviders } = useApp();

  const provider = providers.find((p) => p.id === id);
  const [tab, setTab] = useState<'overview' | 'bookings' | 'services' | 'transactions' | 'kyc'>('overview');
  const [showBanConfirm, setShowBanConfirm] = useState(false);

  if (!provider) {
    return (
      <Layout title="Provider Not Found">
        <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => navigate('/providers')}>Back</Button>
        <p className="mt-4 text-gray-500">Provider not found.</p>
      </Layout>
    );
  }

  const providerBookings = mockBookings.filter(b => b.provider.id === id);
  const providerServices = mockServices.filter(s => s.providerId === id);
  const providerTxns = mockTransactions.filter(t => t.owner === id);

  const handleBanToggle = () => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, isBanned: !p.isBanned } : p));
    setShowBanConfirm(false);
  };

  const tabs = ['overview', 'bookings', 'services', 'transactions', 'kyc'] as const;

  return (
    <Layout title={provider.fullName}>
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/providers')}>
          Back to Providers
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary" size="sm"
            icon={<MessageSquare size={14} />}
            onClick={() => navigate('/chat')}
          >
            Message
          </Button>
          <Button
            variant={provider.isBanned ? 'primary' : 'danger'}
            size="sm"
            icon={provider.isBanned ? <CheckCircle size={14} /> : <Ban size={14} />}
            onClick={() => setShowBanConfirm(true)}
          >
            {provider.isBanned ? 'Unban Provider' : 'Ban Provider'}
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="mb-5">
        <CardBody>
          <div className="flex items-start gap-5">
            <Avatar name={provider.fullName} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-gray-800">{provider.fullName}</h2>
                {provider.isBanned && <Badge variant="danger"><Ban size={10} />Banned</Badge>}
                <Badge variant={provider.accountType === 'business' ? 'gold' : 'info'}>{provider.accountType}</Badge>
                <KYCStatusBadge status={provider.kyc.status} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <a href={`mailto:${provider.email}`} className="flex items-center gap-1 hover:text-[#165B43]">
                  <Mail size={14} />{provider.email}
                </a>
                <a href={`tel:${provider.phoneNumber}`} className="flex items-center gap-1 hover:text-[#165B43] font-mono">
                  <Phone size={14} />{provider.phoneNumber}
                </a>
                <span className="flex items-center gap-1">
                  <MapPin size={14} />{provider.location.city}, {provider.location.state}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-[#D6A643]">★ {provider.rating}</p>
                  <p className="text-xs text-gray-500">{provider.reviewCount} reviews</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">{provider.totalJobs}</p>
                  <p className="text-xs text-gray-500">Total Jobs</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{fmtCurrency(provider.walletBalance)}</p>
                  <p className="text-xs text-gray-500">Wallet Balance</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">{fmtDate(provider.createdAt)}</p>
                  <p className="text-xs text-gray-500">Joined</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
              tab === t
                ? 'border-[#165B43] text-[#165B43]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Service Info */}
          <Card>
            <CardHeader><p className="font-semibold text-sm flex items-center gap-2"><Briefcase size={15} />Service Info</p></CardHeader>
            <CardBody className="space-y-3">
              <Row label="Category" value={provider.service.category || '—'} />
              <Row label="Experience" value={provider.service.experience || '—'} />
              {provider.service.businessName && <Row label="Business Name" value={provider.service.businessName} />}
              <Row label="Description" value={provider.service.description || '—'} />
              <Row label="Service Radius" value={provider.location.radius} />
              <Row label="Travel Outside Area" value={provider.location.travelOutsideArea ? 'Yes' : 'No'} />
            </CardBody>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader><p className="font-semibold text-sm flex items-center gap-2"><CreditCard size={15} />Bank Details</p></CardHeader>
            <CardBody className="space-y-3">
              <Row label="Account Name" value={provider.bankDetails.accountName || '—'} />
              <Row label="Bank Name" value={provider.bankDetails.bankName || '—'} />
              <Row label="Account Number" value={provider.bankDetails.accountNumber || '—'} />
              <Row label="Verified" value={provider.bankDetails.isVerified ? '✓ Verified' : 'Not Verified'} />
            </CardBody>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader><p className="font-semibold text-sm flex items-center gap-2"><MapPin size={15} />Location</p></CardHeader>
            <CardBody className="space-y-3">
              <Row label="State" value={provider.location.state || '—'} />
              <Row label="City" value={provider.location.city || '—'} />
              <Row label="Area" value={provider.location.area || '—'} />
              <Row label="Address" value={provider.location.address || '—'} />
            </CardBody>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader><p className="font-semibold text-sm flex items-center gap-2"><Shield size={15} />Account Status</p></CardHeader>
            <CardBody className="space-y-3">
              <Row label="Email Verified" value={provider.isEmailVerified ? '✓ Yes' : '✗ No'} />
              <Row label="Phone Verified" value={provider.isPhoneVerified ? '✓ Yes' : '✗ No'} />
              <Row label="Available" value={provider.isAvailable ? 'Online' : 'Offline'} />
              <Row label="Last Login" value={provider.lastLogin ? fmtDate(provider.lastLogin) : '—'} />
              <Row label="Referral Code" value={provider.referralCode || '—'} />
            </CardBody>
          </Card>

          {/* Business Info (if business account) */}
          {provider.accountType === 'business' && (
            <Card className="lg:col-span-2">
              <CardHeader><p className="font-semibold text-sm flex items-center gap-2"><Building2 size={15} />Business Info</p></CardHeader>
              <CardBody className="grid grid-cols-2 gap-3">
                <Row label="Registration No." value={provider.business.registrationNumber || '—'} />
                <Row label="Owner Name" value={provider.business.ownerFullName || '—'} />
                <Row label="Business Email" value={provider.business.businessEmail || '—'} />
                <Row label="Contact Phone" value={provider.business.contactPhone || '—'} />
                <Row label="Staff Size" value={provider.business.staffSize || '—'} />
                <Row label="Landmark" value={provider.business.landmark || '—'} />
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <Card>
          <CardHeader><p className="font-semibold text-sm">Booking History ({providerBookings.length})</p></CardHeader>
          <CardBody className="p-0">
            {providerBookings.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">No bookings yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {providerBookings.map((bk) => (
                  <div key={bk.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/bookings/${bk.id}`)}>
                    <Avatar name={bk.customer.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{bk.service.name}</p>
                      <p className="text-xs text-gray-500">Customer: {bk.customer.name} · {fmtDate(bk.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <BookingStatusBadge status={bk.status} />
                      <p className="text-xs text-gray-500 mt-0.5">₦{bk.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Services Tab */}
      {tab === 'services' && (
        <Card>
          <CardHeader><p className="font-semibold text-sm">Services Offered ({providerServices.length})</p></CardHeader>
          <CardBody className="p-0">
            {providerServices.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">No services listed yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {providerServices.map((svc) => (
                  <div key={svc.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{svc.name}</p>
                      <p className="text-xs text-gray-500">{svc.description} · {svc.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#165B43]">₦{svc.price.toLocaleString()}</p>
                      <Badge variant={svc.isActive ? 'success' : 'default'}>{svc.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <Card>
          <CardHeader><p className="font-semibold text-sm">Transactions ({providerTxns.length})</p></CardHeader>
          <CardBody className="p-0">
            {providerTxns.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">No transactions yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {providerTxns.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">{txn.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">{txn.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${txn.type === 'debit' || txn.type === 'withdrawal' || txn.type === 'escrow_hold' ? 'text-red-500' : 'text-green-600'}`}>
                        {txn.type === 'debit' || txn.type === 'withdrawal' || txn.type === 'escrow_hold' ? '-' : '+'}₦{txn.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{fmtDate(txn.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* KYC Tab */}
      {tab === 'kyc' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">KYC Verification</p>
              <KYCStatusBadge status={provider.kyc.status} />
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <Row label="Status" value={provider.kyc.status.replace(/_/g, ' ')} />
                <Row label="Reviewed At" value={provider.kyc.reviewedAt ? fmtDate(provider.kyc.reviewedAt) : '—'} />
                {provider.kyc.rejectionReason && <Row label="Rejection Reason" value={provider.kyc.rejectionReason} />}
              </div>
              <div className="space-y-3">
                {provider.kyc.documentUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Document</p>
                    <a href={provider.kyc.documentUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-sm text-[#165B43] hover:underline">
                      <ExternalLink size={14} />View Document
                    </a>
                  </div>
                )}
                {provider.kyc.selfieUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Selfie</p>
                    <a href={provider.kyc.selfieUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-sm text-[#165B43] hover:underline">
                      <ExternalLink size={14} />View Selfie
                    </a>
                  </div>
                )}
              </div>
            </div>
            {(provider.kyc.status === 'pending' || provider.kyc.status === 'submitted') && (
              <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
                <Button variant="primary" size="sm" icon={<Star size={14} />}>Approve KYC</Button>
                <Button variant="danger" size="sm">Reject KYC</Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <ConfirmDialog
        open={showBanConfirm}
        title={provider.isBanned ? 'Unban Provider?' : 'Ban Provider?'}
        message={provider.isBanned
          ? `This will restore ${provider.fullName}'s access to the platform.`
          : `This will block ${provider.fullName} from accessing the platform.`}
        confirmLabel={provider.isBanned ? 'Unban' : 'Ban'}
        onConfirm={handleBanToggle}
        onCancel={() => setShowBanConfirm(false)}
        variant={provider.isBanned ? 'primary' : 'danger'}
      />
    </Layout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-xs text-gray-500 flex-shrink-0 w-32">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
}
