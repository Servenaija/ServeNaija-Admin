import type {
  Provider, Customer, Category, Booking, Service, KYCRecord,
  Transaction, Conversation, Message, CallLog, Notification,
  Agent, Store, Product, Order, Review, DashboardStats
} from '../types';

// ─── Helper ───────────────────────────────────────────────────────────────────
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString();

// ─── Categories (Admin-managed) ───────────────────────────────────────────────
export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Electrician', icon: 'Zap', color: '#D6A643', description: 'Electrical installations and repairs', isActive: true, providerCount: 34, createdAt: daysAgo(120), updatedAt: daysAgo(5) },
  { id: 'cat-2', name: 'Barber', icon: 'Scissors', color: '#165B43', description: 'Haircuts, styling and grooming', isActive: true, providerCount: 21, createdAt: daysAgo(120), updatedAt: daysAgo(10) },
  { id: 'cat-3', name: 'Plumber', icon: 'Droplets', color: '#165B43', description: 'Plumbing installations and repairs', isActive: true, providerCount: 18, createdAt: daysAgo(115), updatedAt: daysAgo(3) },
  { id: 'cat-4', name: 'Cleaner', icon: 'Sparkles', color: '#165B43', description: 'Home and office cleaning', isActive: true, providerCount: 29, createdAt: daysAgo(110), updatedAt: daysAgo(7) },
  { id: 'cat-5', name: 'Mechanic', icon: 'Wrench', color: '#165B43', description: 'Auto repair and maintenance', isActive: true, providerCount: 15, createdAt: daysAgo(100), updatedAt: daysAgo(2) },
  { id: 'cat-6', name: 'Tailor', icon: 'Shirt', color: '#165B43', description: 'Sewing, alterations and clothing design', isActive: true, providerCount: 12, createdAt: daysAgo(95), updatedAt: daysAgo(14) },
  { id: 'cat-7', name: 'Painter', icon: 'PaintBucket', color: '#D6A643', description: 'Interior and exterior painting', isActive: true, providerCount: 10, createdAt: daysAgo(90), updatedAt: daysAgo(8) },
  { id: 'cat-8', name: 'Carpenter', icon: 'Hammer', color: '#165B43', description: 'Furniture, cabinets and woodwork', isActive: true, providerCount: 9, createdAt: daysAgo(85), updatedAt: daysAgo(6) },
  { id: 'cat-9', name: 'Security Guard', icon: 'Shield', color: '#165B43', description: 'Personal and property security', isActive: false, providerCount: 5, createdAt: daysAgo(60), updatedAt: daysAgo(30) },
  { id: 'cat-10', name: 'Photographer', icon: 'Camera', color: '#165B43', description: 'Photography and videography services', isActive: true, providerCount: 8, createdAt: daysAgo(55), updatedAt: daysAgo(4) },
];

// ─── Providers ────────────────────────────────────────────────────────────────
export const mockProviders: Provider[] = [
  {
    id: 'prov-1', fullName: 'Tunde Adeyemi', firstName: 'Tunde', lastName: 'Adeyemi',
    email: 'tunde@gmail.com', phoneNumber: '08012345678', accountType: 'provider',
    profilePhoto: null,
    service: { category: 'Electrician', experience: '5 years', businessName: '', description: 'Certified electrician with 5 years experience in Lagos.' },
    location: { state: 'Lagos', city: 'Ikeja', area: 'Allen Avenue', address: '14 Allen Avenue, Ikeja', radius: '10KM', travelOutsideArea: true, coordinates: { latitude: 6.6018, longitude: 3.3515 } },
    profile: { photo: null, bio: 'Expert in residential and commercial electrical work.' },
    business: { registrationNumber: '', ownerFullName: '', businessEmail: '', contactPhone: '', businessDescription: '', staffSize: '', landmark: '' },
    bankDetails: { accountName: 'Tunde Adeyemi', bankName: 'GTBank', accountNumber: '0123456789', isVerified: true },
    kyc: { status: 'approved', documentUrl: 'https://example.com/doc1.jpg', selfieUrl: 'https://example.com/selfie1.jpg', reviewedAt: daysAgo(20), rejectionReason: null },
    isEmailVerified: true, isPhoneVerified: true, isBanned: false, isAvailable: true,
    referralCode: 'TUNDE001', rating: 4.8, reviewCount: 42, totalJobs: 67, walletBalance: 145000,
    expoPushToken: 'ExponentPushToken[xxx]', lastLogin: hoursAgo(2), createdAt: daysAgo(90), updatedAt: hoursAgo(2),
  },
  {
    id: 'prov-2', fullName: 'Amaka Okonkwo', firstName: 'Amaka', lastName: 'Okonkwo',
    email: 'amaka@gmail.com', phoneNumber: '08098765432', accountType: 'business',
    profilePhoto: null,
    service: { category: 'Cleaner', experience: '3 years', businessName: 'Spotless Cleaners Ltd', description: 'Professional cleaning company.' },
    location: { state: 'Lagos', city: 'Victoria Island', area: 'VI', address: '25 Adeola Odeku, VI', radius: '15KM', travelOutsideArea: true, coordinates: { latitude: 6.4281, longitude: 3.4219 } },
    profile: { photo: null, bio: 'We provide top-quality cleaning for homes and offices.' },
    business: { registrationNumber: 'RC123456', ownerFullName: 'Amaka Okonkwo', businessEmail: 'amaka@spotlesscleaners.ng', contactPhone: '08098765432', businessDescription: 'Leading cleaning company in Lagos', staffSize: '10-50', landmark: 'Near Eko Hotel' },
    bankDetails: { accountName: 'Spotless Cleaners Ltd', bankName: 'Zenith Bank', accountNumber: '9876543210', isVerified: true },
    kyc: { status: 'approved', documentUrl: 'https://example.com/doc2.jpg', selfieUrl: 'https://example.com/selfie2.jpg', reviewedAt: daysAgo(30), rejectionReason: null },
    isEmailVerified: true, isPhoneVerified: true, isBanned: false, isAvailable: true,
    referralCode: 'AMAKA002', rating: 4.9, reviewCount: 78, totalJobs: 120, walletBalance: 320000,
    expoPushToken: 'ExponentPushToken[yyy]', lastLogin: hoursAgo(1), createdAt: daysAgo(120), updatedAt: hoursAgo(1),
  },
  {
    id: 'prov-3', fullName: 'Emeka Nwosu', firstName: 'Emeka', lastName: 'Nwosu',
    email: 'emeka@gmail.com', phoneNumber: '07034567890', accountType: 'provider',
    profilePhoto: null,
    service: { category: 'Plumber', experience: '7 years', businessName: '', description: 'Plumbing specialist.' },
    location: { state: 'Abuja', city: 'Wuse', area: 'Wuse 2', address: '3 Aminu Kano Crescent, Wuse 2', radius: '10KM', travelOutsideArea: false, coordinates: { latitude: 9.0765, longitude: 7.3986 } },
    profile: { photo: null, bio: '7 years of plumbing experience in Abuja.' },
    business: { registrationNumber: '', ownerFullName: '', businessEmail: '', contactPhone: '', businessDescription: '', staffSize: '', landmark: '' },
    bankDetails: { accountName: 'Emeka Nwosu', bankName: 'First Bank', accountNumber: '1122334455', isVerified: false },
    kyc: { status: 'pending', documentUrl: 'https://example.com/doc3.jpg', selfieUrl: 'https://example.com/selfie3.jpg', reviewedAt: null, rejectionReason: null },
    isEmailVerified: true, isPhoneVerified: false, isBanned: false, isAvailable: false,
    referralCode: 'EMEKA003', rating: 4.5, reviewCount: 29, totalJobs: 41, walletBalance: 87500,
    expoPushToken: null, lastLogin: daysAgo(3), createdAt: daysAgo(60), updatedAt: daysAgo(3),
  },
  {
    id: 'prov-4', fullName: 'Fatima Bello', firstName: 'Fatima', lastName: 'Bello',
    email: 'fatima@gmail.com', phoneNumber: '08055556666', accountType: 'provider',
    profilePhoto: null,
    service: { category: 'Tailor', experience: '10 years', businessName: 'Fatima Couture', description: 'Bespoke tailoring and alterations.' },
    location: { state: 'Kano', city: 'Kano Municipal', area: 'Sabon Gari', address: '7 Sabon Gari Road', radius: '5KM', travelOutsideArea: false, coordinates: null as unknown as { latitude: number; longitude: number } },
    profile: { photo: null, bio: 'Specializing in traditional and modern Nigerian attire.' },
    business: { registrationNumber: '', ownerFullName: '', businessEmail: '', contactPhone: '', businessDescription: '', staffSize: '', landmark: '' },
    bankDetails: { accountName: 'Fatima Bello', bankName: 'UBA', accountNumber: '5566778899', isVerified: true },
    kyc: { status: 'approved', documentUrl: 'https://example.com/doc4.jpg', selfieUrl: 'https://example.com/selfie4.jpg', reviewedAt: daysAgo(45), rejectionReason: null },
    isEmailVerified: true, isPhoneVerified: true, isBanned: false, isAvailable: true,
    referralCode: 'FATIMA004', rating: 4.7, reviewCount: 55, totalJobs: 89, walletBalance: 210000,
    expoPushToken: 'ExponentPushToken[zzz]', lastLogin: hoursAgo(5), createdAt: daysAgo(100), updatedAt: hoursAgo(5),
  },
  {
    id: 'prov-5', fullName: 'Chidi Okafor', firstName: 'Chidi', lastName: 'Okafor',
    email: 'chidi@gmail.com', phoneNumber: '08077778888', accountType: 'provider',
    profilePhoto: null,
    service: { category: 'Mechanic', experience: '8 years', businessName: '', description: 'Auto mechanic and roadside assistance.' },
    location: { state: 'Rivers', city: 'Port Harcourt', area: 'Trans Amadi', address: '12 Trans Amadi Industrial Estate', radius: '20KM', travelOutsideArea: true, coordinates: { latitude: 4.8156, longitude: 7.0498 } },
    profile: { photo: null, bio: 'Expert in Toyota, Honda and Hyundai vehicles.' },
    business: { registrationNumber: '', ownerFullName: '', businessEmail: '', contactPhone: '', businessDescription: '', staffSize: '', landmark: '' },
    bankDetails: { accountName: 'Chidi Okafor', bankName: 'Access Bank', accountNumber: '2233445566', isVerified: true },
    kyc: { status: 'rejected', documentUrl: 'https://example.com/doc5.jpg', selfieUrl: 'https://example.com/selfie5.jpg', reviewedAt: daysAgo(10), rejectionReason: 'Face match score too low' },
    isEmailVerified: true, isPhoneVerified: true, isBanned: true, isAvailable: false,
    referralCode: 'CHIDI005', rating: 3.2, reviewCount: 14, totalJobs: 18, walletBalance: 25000,
    expoPushToken: null, lastLogin: daysAgo(15), createdAt: daysAgo(50), updatedAt: daysAgo(15),
  },
];

// ─── Customers ────────────────────────────────────────────────────────────────
export const mockCustomers: Customer[] = [
  {
    id: 'cust-1', fullName: 'Ngozi Eze', firstName: 'Ngozi', lastName: 'Eze',
    email: 'ngozi@gmail.com', phoneNumber: '08011112222',
    birthday: '1992-05-14', profilePhoto: null,
    referralCode: 'NGOZI100', agentCode: null,
    location: { state: 'Lagos', city: 'Lekki', address: '5 Admiralty Way, Lekki Phase 1', landmark: 'Near Shoprite' },
    isEmailVerified: true, isPhoneVerified: true, isAgent: false, isBanned: false,
    walletBalance: 15000, totalBookings: 12, totalOrders: 4,
    expoPushToken: 'ExponentPushToken[cust1]', lastLogin: hoursAgo(3), createdAt: daysAgo(80), updatedAt: hoursAgo(3),
  },
  {
    id: 'cust-2', fullName: 'Bola Adesanya', firstName: 'Bola', lastName: 'Adesanya',
    email: 'bola@gmail.com', phoneNumber: '08033334444',
    birthday: '1988-11-22', profilePhoto: null,
    referralCode: 'BOLA101', agentCode: 'TUNDE001',
    location: { state: 'Lagos', city: 'Surulere', address: '18 Adeniran Ogunsanya Street', landmark: 'Near Itire Market' },
    isEmailVerified: true, isPhoneVerified: true, isAgent: true, isBanned: false,
    walletBalance: 32000, totalBookings: 25, totalOrders: 9,
    expoPushToken: 'ExponentPushToken[cust2]', lastLogin: hoursAgo(1), createdAt: daysAgo(110), updatedAt: hoursAgo(1),
  },
  {
    id: 'cust-3', fullName: 'Yusuf Ibrahim', firstName: 'Yusuf', lastName: 'Ibrahim',
    email: 'yusuf@gmail.com', phoneNumber: '08055556677',
    birthday: '1995-03-07', profilePhoto: null,
    referralCode: 'YUSUF102', agentCode: null,
    location: { state: 'Abuja', city: 'Garki', address: '3 Moshood Abiola Way, Garki', landmark: '' },
    isEmailVerified: true, isPhoneVerified: false, isAgent: false, isBanned: false,
    walletBalance: 8000, totalBookings: 5, totalOrders: 1,
    expoPushToken: null, lastLogin: daysAgo(7), createdAt: daysAgo(40), updatedAt: daysAgo(7),
  },
  {
    id: 'cust-4', fullName: 'Chioma Obi', firstName: 'Chioma', lastName: 'Obi',
    email: 'chioma@gmail.com', phoneNumber: '07099998888',
    birthday: '1990-08-30', profilePhoto: null,
    referralCode: 'CHIOMA103', agentCode: null,
    location: { state: 'Enugu', city: 'Enugu', address: '9 Ogui Road, Enugu', landmark: 'Near Polo Park' },
    isEmailVerified: false, isPhoneVerified: true, isAgent: false, isBanned: true,
    walletBalance: 0, totalBookings: 2, totalOrders: 0,
    expoPushToken: null, lastLogin: daysAgo(20), createdAt: daysAgo(30), updatedAt: daysAgo(20),
  },
  {
    id: 'cust-5', fullName: 'Akin Lawal', firstName: 'Akin', lastName: 'Lawal',
    email: 'akin@gmail.com', phoneNumber: '08122223333',
    birthday: '1985-01-15', profilePhoto: null,
    referralCode: 'AKIN104', agentCode: 'AMAKA002',
    location: { state: 'Oyo', city: 'Ibadan', address: '7 Ring Road, Ibadan', landmark: '' },
    isEmailVerified: true, isPhoneVerified: true, isAgent: false, isBanned: false,
    walletBalance: 55000, totalBookings: 31, totalOrders: 15,
    expoPushToken: 'ExponentPushToken[cust5]', lastLogin: hoursAgo(6), createdAt: daysAgo(150), updatedAt: hoursAgo(6),
  },
];

// ─── Services ─────────────────────────────────────────────────────────────────
export const mockServices: Service[] = [
  { id: 'svc-1', providerId: 'prov-1', providerName: 'Tunde Adeyemi', name: 'Wiring Installation', price: 15000, currency: 'NGN', description: 'Full house wiring installation', duration: '4-6 hours', isActive: true, createdAt: daysAgo(80) },
  { id: 'svc-2', providerId: 'prov-1', providerName: 'Tunde Adeyemi', name: 'Socket/Switch Repair', price: 5000, currency: 'NGN', description: 'Repair and replace sockets', duration: '1-2 hours', isActive: true, createdAt: daysAgo(80) },
  { id: 'svc-3', providerId: 'prov-2', providerName: 'Amaka Okonkwo', name: 'Deep House Clean', price: 25000, currency: 'NGN', description: 'Full deep cleaning', duration: '5-8 hours', isActive: true, createdAt: daysAgo(100) },
  { id: 'svc-4', providerId: 'prov-3', providerName: 'Emeka Nwosu', name: 'Pipe Repair', price: 8000, currency: 'NGN', description: 'Burst or leaking pipe repair', duration: '2-3 hours', isActive: true, createdAt: daysAgo(55) },
  { id: 'svc-5', providerId: 'prov-4', providerName: 'Fatima Bello', name: 'Agbada Sewing', price: 20000, currency: 'NGN', description: 'Traditional Agbada', duration: '3-5 days', isActive: true, createdAt: daysAgo(90) },
];

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const mockBookings: Booking[] = [
  {
    id: 'bk-001', customer: { id: 'cust-1', name: 'Ngozi Eze', phone: '08011112222', avatar: null },
    provider: { id: 'prov-1', name: 'Tunde Adeyemi', phone: '08012345678', avatar: null },
    service: { name: 'Wiring Installation', price: 15000, category: 'Electrician' },
    description: 'Need full rewiring of 3-bedroom flat', scheduledDate: daysAgo(-2), timeSlot: '9:00 AM',
    address: { full: '5 Admiralty Way, Lekki Phase 1', state: 'Lagos', city: 'Lekki', address: '5 Admiralty Way', landmark: 'Near Shoprite' },
    status: 'completed', serviceFee: 15000, platformFee: 500, totalAmount: 15500,
    paymentStatus: 'released', paystackReference: 'PSK_001_ref',
    rating: { overall: 5, quality: 5, punctuality: 4, professionalism: 5, communication: 5, review: 'Excellent work!' },
    timeline: [
      { status: 'pending', note: 'Booking created', timestamp: daysAgo(5) },
      { status: 'accepted', note: 'Provider accepted', timestamp: daysAgo(4) },
      { status: 'completed', note: 'Service completed', timestamp: daysAgo(-2) },
    ],
    completedAt: daysAgo(-2), createdAt: daysAgo(5), updatedAt: daysAgo(-2),
  },
  {
    id: 'bk-002', customer: { id: 'cust-2', name: 'Bola Adesanya', phone: '08033334444', avatar: null },
    provider: { id: 'prov-2', name: 'Amaka Okonkwo', phone: '08098765432', avatar: null },
    service: { name: 'Deep House Clean', price: 25000, category: 'Cleaner' },
    description: '3-bedroom apartment full clean', scheduledDate: daysAgo(0), timeSlot: '10:00 AM',
    address: { full: '18 Adeniran Ogunsanya Street, Surulere', state: 'Lagos', city: 'Surulere', address: '18 Adeniran Ogunsanya', landmark: 'Near Itire Market' },
    status: 'in-progress', serviceFee: 25000, platformFee: 500, totalAmount: 25500,
    paymentStatus: 'held', paystackReference: 'PSK_002_ref',
    timeline: [
      { status: 'pending', note: 'Booking created', timestamp: daysAgo(2) },
      { status: 'accepted', note: 'Provider accepted', timestamp: daysAgo(1) },
      { status: 'arrived', note: 'Provider arrived', timestamp: hoursAgo(2) },
      { status: 'in-progress', note: 'Service started', timestamp: hoursAgo(1) },
    ],
    createdAt: daysAgo(2), updatedAt: hoursAgo(1),
  },
  {
    id: 'bk-003', customer: { id: 'cust-5', name: 'Akin Lawal', phone: '08122223333', avatar: null },
    provider: { id: 'prov-3', name: 'Emeka Nwosu', phone: '07034567890', avatar: null },
    service: { name: 'Pipe Repair', price: 8000, category: 'Plumber' },
    description: 'Burst pipe in kitchen', scheduledDate: daysAgo(1), timeSlot: '2:00 PM',
    address: { full: '7 Ring Road, Ibadan', state: 'Oyo', city: 'Ibadan', address: '7 Ring Road', landmark: '' },
    status: 'disputed', serviceFee: 8000, platformFee: 500, totalAmount: 8500,
    paymentStatus: 'held', paystackReference: 'PSK_003_ref',
    timeline: [
      { status: 'pending', note: 'Booking created', timestamp: daysAgo(4) },
      { status: 'accepted', note: 'Provider accepted', timestamp: daysAgo(3) },
      { status: 'completed', note: 'Provider marked complete', timestamp: daysAgo(1) },
      { status: 'disputed', note: 'Customer raised dispute', timestamp: hoursAgo(5) },
    ],
    createdAt: daysAgo(4), updatedAt: hoursAgo(5),
  },
  {
    id: 'bk-004', customer: { id: 'cust-3', name: 'Yusuf Ibrahim', phone: '08055556677', avatar: null },
    provider: { id: 'prov-4', name: 'Fatima Bello', phone: '08055556666', avatar: null },
    service: { name: 'Agbada Sewing', price: 20000, category: 'Tailor' },
    description: 'Traditional Agbada for wedding', scheduledDate: daysAgo(-7), timeSlot: 'Flexible',
    address: { full: '3 Moshood Abiola Way, Garki, Abuja', state: 'Abuja', city: 'Garki', address: '3 Moshood Abiola Way', landmark: '' },
    status: 'pending', serviceFee: 20000, platformFee: 500, totalAmount: 20500,
    paymentStatus: 'pending', paystackReference: 'PSK_004_ref',
    timeline: [{ status: 'pending', note: 'Booking created', timestamp: hoursAgo(6) }],
    createdAt: hoursAgo(6), updatedAt: hoursAgo(6),
  },
  {
    id: 'bk-005', customer: { id: 'cust-1', name: 'Ngozi Eze', phone: '08011112222', avatar: null },
    provider: { id: 'prov-2', name: 'Amaka Okonkwo', phone: '08098765432', avatar: null },
    service: { name: 'Deep House Clean', price: 25000, category: 'Cleaner' },
    description: 'Monthly cleaning', scheduledDate: daysAgo(8), timeSlot: '9:00 AM',
    address: { full: '5 Admiralty Way, Lekki Phase 1', state: 'Lagos', city: 'Lekki', address: '5 Admiralty Way', landmark: '' },
    status: 'cancelled', serviceFee: 25000, platformFee: 500, totalAmount: 25500,
    paymentStatus: 'refunded', paystackReference: 'PSK_005_ref',
    cancelledBy: 'customer', cancellationReason: 'Travel plans changed',
    timeline: [
      { status: 'pending', note: 'Booking created', timestamp: daysAgo(10) },
      { status: 'accepted', note: 'Provider accepted', timestamp: daysAgo(9) },
      { status: 'cancelled', note: 'Customer cancelled', timestamp: daysAgo(8) },
    ],
    createdAt: daysAgo(10), updatedAt: daysAgo(8),
  },
];

// ─── KYC Records ──────────────────────────────────────────────────────────────
export const mockKYCRecords: KYCRecord[] = [
  {
    id: 'kyc-1', userId: 'prov-1', userName: 'Tunde Adeyemi', userType: 'provider',
    documentType: 'nin', documentNumber: '12345678901', documentImageUrl: 'https://example.com/doc1.jpg', selfieImageUrl: 'https://example.com/selfie1.jpg',
    dojahJobId: 'dojah-job-001', dojahRequestId: 'dojah-req-001', livenessScore: 0.97, faceMatchScore: 0.94, faceMatchPassed: true,
    status: 'approved', rejectionReason: null, reviewedAt: daysAgo(20), reviewedBy: 'admin', createdAt: daysAgo(25), updatedAt: daysAgo(20),
  },
  {
    id: 'kyc-2', userId: 'prov-2', userName: 'Amaka Okonkwo', userType: 'provider',
    documentType: 'bvn', documentNumber: '22233344455', documentImageUrl: 'https://example.com/doc2.jpg', selfieImageUrl: 'https://example.com/selfie2.jpg',
    dojahJobId: 'dojah-job-002', dojahRequestId: 'dojah-req-002', livenessScore: 0.99, faceMatchScore: 0.96, faceMatchPassed: true,
    status: 'approved', rejectionReason: null, reviewedAt: daysAgo(30), reviewedBy: 'admin', createdAt: daysAgo(35), updatedAt: daysAgo(30),
  },
  {
    id: 'kyc-3', userId: 'prov-3', userName: 'Emeka Nwosu', userType: 'provider',
    documentType: 'drivers_license', documentNumber: 'ABJ-123-456', documentImageUrl: 'https://example.com/doc3.jpg', selfieImageUrl: 'https://example.com/selfie3.jpg',
    dojahJobId: 'dojah-job-003', dojahRequestId: 'dojah-req-003', livenessScore: 0.85, faceMatchScore: 0.78, faceMatchPassed: false,
    status: 'pending', rejectionReason: null, reviewedAt: null, reviewedBy: null, createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
  {
    id: 'kyc-4', userId: 'prov-5', userName: 'Chidi Okafor', userType: 'provider',
    documentType: 'international_passport', documentNumber: 'A12345678', documentImageUrl: 'https://example.com/doc5.jpg', selfieImageUrl: 'https://example.com/selfie5.jpg',
    dojahJobId: 'dojah-job-005', dojahRequestId: 'dojah-req-005', livenessScore: 0.60, faceMatchScore: 0.55, faceMatchPassed: false,
    status: 'rejected', rejectionReason: 'Face match score too low', reviewedAt: daysAgo(10), reviewedBy: 'admin', createdAt: daysAgo(15), updatedAt: daysAgo(10),
  },
  {
    id: 'kyc-5', userId: 'cust-2', userName: 'Bola Adesanya', userType: 'customer',
    documentType: 'voters_card', documentNumber: 'VCN-789-012', documentImageUrl: 'https://example.com/doc6.jpg', selfieImageUrl: 'https://example.com/selfie6.jpg',
    dojahJobId: 'dojah-job-006', dojahRequestId: 'dojah-req-006', livenessScore: 0.95, faceMatchScore: 0.91, faceMatchPassed: true,
    status: 'submitted', rejectionReason: null, reviewedAt: null, reviewedBy: null, createdAt: hoursAgo(4), updatedAt: hoursAgo(4),
  },
];

// ─── Transactions ─────────────────────────────────────────────────────────────
export const mockTransactions: Transaction[] = [
  { id: 'txn-1', walletId: 'w1', owner: 'cust-1', ownerName: 'Ngozi Eze', ownerType: 'customer', type: 'escrow_hold', amount: 15500, balanceBefore: 15500, balanceAfter: 0, currency: 'NGN', description: 'Payment held for booking bk-001', reference: 'PSK_001_ref', status: 'success', bookingId: 'bk-001', createdAt: daysAgo(5) },
  { id: 'txn-2', walletId: 'w2', owner: 'prov-1', ownerName: 'Tunde Adeyemi', ownerType: 'provider', type: 'escrow_release', amount: 15000, balanceBefore: 130000, balanceAfter: 145000, currency: 'NGN', description: 'Earnings released for booking bk-001', reference: 'PSK_001_release', status: 'success', bookingId: 'bk-001', createdAt: daysAgo(-2) },
  { id: 'txn-3', walletId: 'w3', owner: 'cust-2', ownerName: 'Bola Adesanya', ownerType: 'customer', type: 'escrow_hold', amount: 25500, balanceBefore: 57500, balanceAfter: 32000, currency: 'NGN', description: 'Payment held for booking bk-002', reference: 'PSK_002_ref', status: 'success', bookingId: 'bk-002', createdAt: daysAgo(2) },
  { id: 'txn-4', walletId: 'w5', owner: 'cust-5', ownerName: 'Akin Lawal', ownerType: 'customer', type: 'refund', amount: 8500, balanceBefore: 46500, balanceAfter: 55000, currency: 'NGN', description: 'Refund for cancelled booking bk-005', reference: 'PSK_005_refund', status: 'success', bookingId: 'bk-005', createdAt: daysAgo(8) },
  { id: 'txn-5', walletId: 'w2', owner: 'prov-1', ownerName: 'Tunde Adeyemi', ownerType: 'provider', type: 'withdrawal', amount: 50000, balanceBefore: 195000, balanceAfter: 145000, currency: 'NGN', description: 'Withdrawal to GTBank 0123456789', reference: 'WDL_001_ref', status: 'success', createdAt: daysAgo(7) },
];

// ─── Conversations & Messages ─────────────────────────────────────────────────
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      { userId: 'prov-1', actorType: 'provider', name: 'Tunde Adeyemi', avatar: null },
      { userId: 'cust-1', actorType: 'customer', name: 'Ngozi Eze', avatar: null },
    ],
    lastMessage: { text: 'I will arrive by 9am tomorrow', imageUrl: null, senderId: 'prov-1', senderType: 'provider', timestamp: hoursAgo(3) },
    unreadCounts: { 'cust-1': 1, 'prov-1': 0 },
    bookingId: 'bk-001', isActive: true, createdAt: daysAgo(5), updatedAt: hoursAgo(3),
  },
  {
    id: 'conv-2',
    participants: [
      { userId: 'admin', actorType: 'admin', name: 'Admin', avatar: null },
      { userId: 'prov-5', actorType: 'provider', name: 'Chidi Okafor', avatar: null },
    ],
    lastMessage: { text: 'Please resubmit your KYC documents', imageUrl: null, senderId: 'admin', senderType: 'admin', timestamp: hoursAgo(12) },
    unreadCounts: { 'prov-5': 1, 'admin': 0 },
    bookingId: null, isActive: true, createdAt: daysAgo(10), updatedAt: hoursAgo(12),
  },
  {
    id: 'conv-3',
    participants: [
      { userId: 'admin', actorType: 'admin', name: 'Admin', avatar: null },
      { userId: 'cust-4', actorType: 'customer', name: 'Chioma Obi', avatar: null },
    ],
    lastMessage: { text: 'Your account has been temporarily suspended', imageUrl: null, senderId: 'admin', senderType: 'admin', timestamp: daysAgo(20) },
    unreadCounts: { 'cust-4': 0, 'admin': 0 },
    bookingId: null, isActive: true, createdAt: daysAgo(20), updatedAt: daysAgo(20),
  },
  {
    id: 'conv-4',
    participants: [
      { userId: 'prov-2', actorType: 'provider', name: 'Amaka Okonkwo', avatar: null },
      { userId: 'cust-2', actorType: 'customer', name: 'Bola Adesanya', avatar: null },
    ],
    lastMessage: { text: 'Cleaning is in progress, will be done in 2 hours', imageUrl: null, senderId: 'prov-2', senderType: 'provider', timestamp: hoursAgo(1) },
    unreadCounts: { 'cust-2': 2, 'prov-2': 0 },
    bookingId: 'bk-002', isActive: true, createdAt: daysAgo(2), updatedAt: hoursAgo(1),
  },
];

export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    { id: 'msg-1', conversationId: 'conv-1', senderId: 'cust-1', senderType: 'customer', senderName: 'Ngozi Eze', senderAvatar: null, text: 'Hi, I need electrical work done', imageUrl: null, type: 'text', readBy: ['prov-1'], deletedAt: null, createdAt: daysAgo(5) },
    { id: 'msg-2', conversationId: 'conv-1', senderId: 'prov-1', senderType: 'provider', senderName: 'Tunde Adeyemi', senderAvatar: null, text: 'Sure, I can help. What exactly needs to be done?', imageUrl: null, type: 'text', readBy: ['cust-1'], deletedAt: null, createdAt: daysAgo(5) },
    { id: 'msg-3', conversationId: 'conv-1', senderId: 'prov-1', senderType: 'provider', senderName: 'Tunde Adeyemi', senderAvatar: null, text: 'I will arrive by 9am tomorrow', imageUrl: null, type: 'text', readBy: [], deletedAt: null, createdAt: hoursAgo(3) },
  ],
  'conv-2': [
    { id: 'msg-4', conversationId: 'conv-2', senderId: 'admin', senderType: 'admin', senderName: 'Admin', senderAvatar: null, text: 'Hello Chidi, we noticed your KYC verification failed.', imageUrl: null, type: 'text', readBy: ['prov-5'], deletedAt: null, createdAt: daysAgo(10) },
    { id: 'msg-5', conversationId: 'conv-2', senderId: 'prov-5', senderType: 'provider', senderName: 'Chidi Okafor', senderAvatar: null, text: 'I see. What should I do?', imageUrl: null, type: 'text', readBy: ['admin'], deletedAt: null, createdAt: daysAgo(10) },
    { id: 'msg-6', conversationId: 'conv-2', senderId: 'admin', senderType: 'admin', senderName: 'Admin', senderAvatar: null, text: 'Please resubmit your KYC documents', imageUrl: null, type: 'text', readBy: [], deletedAt: null, createdAt: hoursAgo(12) },
  ],
  'conv-3': [
    { id: 'msg-7', conversationId: 'conv-3', senderId: 'admin', senderType: 'admin', senderName: 'Admin', senderAvatar: null, text: 'Your account has been temporarily suspended due to policy violation.', imageUrl: null, type: 'text', readBy: ['cust-4'], deletedAt: null, createdAt: daysAgo(20) },
  ],
  'conv-4': [
    { id: 'msg-8', conversationId: 'conv-4', senderId: 'cust-2', senderType: 'customer', senderName: 'Bola Adesanya', senderAvatar: null, text: 'Are you on your way?', imageUrl: null, type: 'text', readBy: ['prov-2'], deletedAt: null, createdAt: hoursAgo(2) },
    { id: 'msg-9', conversationId: 'conv-4', senderId: 'prov-2', senderType: 'provider', senderName: 'Amaka Okonkwo', senderAvatar: null, text: 'Cleaning is in progress, will be done in 2 hours', imageUrl: null, type: 'text', readBy: [], deletedAt: null, createdAt: hoursAgo(1) },
  ],
};

// ─── Call Logs ────────────────────────────────────────────────────────────────
export const mockCallLogs: CallLog[] = [
  { id: 'call-1', initiator: 'cust-1', initiatorName: 'Ngozi Eze', initiatorType: 'customer', recipient: 'prov-1', recipientName: 'Tunde Adeyemi', recipientType: 'provider', recipientPhone: '08012345678', type: 'voice', status: 'ended', conversationId: 'conv-1', duration: 185, startedAt: daysAgo(4), endedAt: daysAgo(4), createdAt: daysAgo(4) },
  { id: 'call-2', initiator: 'cust-2', initiatorName: 'Bola Adesanya', initiatorType: 'customer', recipient: 'prov-2', recipientName: 'Amaka Okonkwo', recipientType: 'provider', recipientPhone: '08098765432', type: 'voice', status: 'missed', conversationId: 'conv-4', duration: 0, startedAt: hoursAgo(3), endedAt: null, createdAt: hoursAgo(3) },
  { id: 'call-3', initiator: 'prov-2', initiatorName: 'Amaka Okonkwo', initiatorType: 'provider', recipient: 'cust-2', recipientName: 'Bola Adesanya', recipientType: 'customer', recipientPhone: '08033334444', type: 'voice', status: 'ended', conversationId: 'conv-4', duration: 62, startedAt: hoursAgo(2), endedAt: hoursAgo(2), createdAt: hoursAgo(2) },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  { id: 'notif-1', recipient: 'prov-1', recipientName: 'Tunde Adeyemi', recipientType: 'provider', title: 'New Booking', body: 'You have a new booking from Ngozi Eze', type: 'booking', data: { bookingId: 'bk-001' }, isRead: true, readAt: daysAgo(4), pushStatus: 'sent', pushError: null, createdAt: daysAgo(5) },
  { id: 'notif-2', recipient: 'cust-1', recipientName: 'Ngozi Eze', recipientType: 'customer', title: 'Booking Accepted', body: 'Tunde Adeyemi has accepted your booking', type: 'booking', data: { bookingId: 'bk-001' }, isRead: true, readAt: daysAgo(3), pushStatus: 'sent', pushError: null, createdAt: daysAgo(4) },
  { id: 'notif-3', recipient: 'prov-3', recipientName: 'Emeka Nwosu', recipientType: 'provider', title: 'KYC Pending Review', body: 'Your KYC documents are under review', type: 'kyc', data: { kycId: 'kyc-3' }, isRead: false, readAt: null, pushStatus: 'sent', pushError: null, createdAt: daysAgo(3) },
  { id: 'notif-4', recipient: 'prov-5', recipientName: 'Chidi Okafor', recipientType: 'provider', title: 'KYC Rejected', body: 'Your KYC verification was rejected. Please resubmit.', type: 'kyc', data: { kycId: 'kyc-4' }, isRead: false, readAt: null, pushStatus: 'sent', pushError: null, createdAt: daysAgo(10) },
  { id: 'notif-5', recipient: 'cust-2', recipientName: 'Bola Adesanya', recipientType: 'customer', title: 'Payment Held', body: '₦25,500 has been held in escrow for your booking', type: 'payment', data: { bookingId: 'bk-002' }, isRead: true, readAt: hoursAgo(20), pushStatus: 'sent', pushError: null, createdAt: daysAgo(2) },
];

// ─── Agents ───────────────────────────────────────────────────────────────────
export const mockAgents: Agent[] = [
  { id: 'agent-1', userId: 'cust-2', userName: 'Bola Adesanya', userType: 'customer', referralCode: 'AMAKA002', registrationFee: 5000, isActive: true, earnings: 12500, pendingEarnings: 2000, totalCustomerReferrals: 8, totalProviderReferrals: 2, createdAt: daysAgo(110) },
  { id: 'agent-2', userId: 'prov-1', userName: 'Tunde Adeyemi', userType: 'provider', referralCode: 'TUNDE001', registrationFee: 5000, isActive: true, earnings: 8000, pendingEarnings: 1000, totalCustomerReferrals: 4, totalProviderReferrals: 3, createdAt: daysAgo(85) },
];

// ─── Stores, Products, Orders ─────────────────────────────────────────────────
export const mockStores: Store[] = [
  { id: 'store-1', providerId: 'prov-2', providerName: 'Amaka Okonkwo', name: 'Spotless Home Store', description: 'Cleaning supplies and home essentials', category: 'Home & Garden', coverImage: null, logo: null, isActive: true, rating: 4.6, reviewCount: 18, totalOrders: 43, createdAt: daysAgo(90) },
  { id: 'store-2', providerId: 'prov-4', providerName: 'Fatima Bello', name: 'Fatima Fashion Hub', description: 'Fabrics, accessories and custom clothing', category: 'Fashion', coverImage: null, logo: null, isActive: true, rating: 4.8, reviewCount: 32, totalOrders: 67, createdAt: daysAgo(80) },
];

export const mockProducts: Product[] = [
  { id: 'prod-1', storeId: 'store-1', storeName: 'Spotless Home Store', providerId: 'prov-2', providerName: 'Amaka Okonkwo', name: 'Multi-Surface Cleaner 5L', description: 'Professional grade cleaner', price: 3500, originalPrice: 4000, stock: 50, category: 'Home & Garden', images: [], isActive: true, rating: 4.5, reviewCount: 12, soldCount: 28, createdAt: daysAgo(70) },
  { id: 'prod-2', storeId: 'store-2', storeName: 'Fatima Fashion Hub', providerId: 'prov-4', providerName: 'Fatima Bello', name: 'Premium Ankara Fabric 5 Yards', description: 'High quality wax print', price: 12000, originalPrice: null, stock: 20, category: 'Fashion', images: [], isActive: true, rating: 4.9, reviewCount: 21, soldCount: 41, createdAt: daysAgo(60) },
];

export const mockOrders: Order[] = [
  { id: 'ord-1', buyer: { id: 'cust-1', name: 'Ngozi Eze', phone: '08011112222' }, store: { id: 'store-2', name: 'Fatima Fashion Hub' }, items: [{ productId: 'prod-2', name: 'Premium Ankara Fabric', price: 12000, quantity: 2, image: '' }], subtotal: 24000, deliveryFee: 800, total: 24800, status: 'delivered', deliveryAddress: { street: '5 Admiralty Way', landmark: 'Near Shoprite', phone: '08011112222', state: 'Lagos', city: 'Lekki' }, paymentMethod: 'card', paymentStatus: 'paid', paystackReference: 'PSK_ORD_001', estimatedDelivery: daysAgo(3), createdAt: daysAgo(8) },
  { id: 'ord-2', buyer: { id: 'cust-5', name: 'Akin Lawal', phone: '08122223333' }, store: { id: 'store-1', name: 'Spotless Home Store' }, items: [{ productId: 'prod-1', name: 'Multi-Surface Cleaner', price: 3500, quantity: 3, image: '' }], subtotal: 10500, deliveryFee: 800, total: 11300, status: 'shipped', deliveryAddress: { street: '7 Ring Road', landmark: '', phone: '08122223333', state: 'Oyo', city: 'Ibadan' }, paymentMethod: 'wallet', paymentStatus: 'paid', paystackReference: 'PSK_ORD_002', estimatedDelivery: daysAgo(-2), createdAt: daysAgo(3) },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const mockReviews: Review[] = [
  { id: 'rev-1', reviewer: 'cust-1', reviewerName: 'Ngozi Eze', reviewerAvatar: null, target: 'prov-1', targetName: 'Tunde Adeyemi', targetType: 'provider', bookingId: 'bk-001', orderId: null, overall: 5, categories: { quality: 5, punctuality: 4, professionalism: 5, communication: 5 }, text: 'Excellent work! Very professional.', images: [], isVerified: true, createdAt: daysAgo(-2) },
  { id: 'rev-2', reviewer: 'cust-2', reviewerName: 'Bola Adesanya', reviewerAvatar: null, target: 'prov-2', targetName: 'Amaka Okonkwo', targetType: 'provider', bookingId: null, orderId: null, overall: 4, categories: { quality: 4, punctuality: 5, professionalism: 4, communication: 4 }, text: 'Great cleaning service, will use again.', images: [], isVerified: false, createdAt: daysAgo(15) },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const mockDashboardStats: DashboardStats = {
  totalProviders: 127,
  activeProviders: 98,
  bannedProviders: 5,
  pendingKYC: 12,
  totalCustomers: 432,
  activeCustomers: 398,
  bannedCustomers: 8,
  totalBookings: 856,
  pendingBookings: 24,
  completedBookings: 712,
  disputedBookings: 7,
  cancelledBookings: 113,
  totalRevenue: 4280000,
  platformFees: 428000,
  todayRevenue: 85500,
  totalTransactions: 1240,
  totalOrders: 234,
  totalAgents: 18,
  revenueChart: [
    { month: 'Jan', revenue: 280000, bookings: 62 },
    { month: 'Feb', revenue: 320000, bookings: 74 },
    { month: 'Mar', revenue: 410000, bookings: 91 },
    { month: 'Apr', revenue: 380000, bookings: 85 },
    { month: 'May', revenue: 520000, bookings: 118 },
    { month: 'Jun', revenue: 490000, bookings: 109 },
    { month: 'Jul', revenue: 610000, bookings: 137 },
  ],
  bookingStatusChart: [
    { name: 'Completed', value: 712 },
    { name: 'Pending', value: 24 },
    { name: 'Cancelled', value: 113 },
    { name: 'Disputed', value: 7 },
  ],
  userGrowthChart: [
    { month: 'Jan', providers: 45, customers: 130 },
    { month: 'Feb', providers: 58, customers: 168 },
    { month: 'Mar', providers: 72, customers: 215 },
    { month: 'Apr', providers: 85, customers: 274 },
    { month: 'May', providers: 98, customers: 340 },
    { month: 'Jun', providers: 112, customers: 390 },
    { month: 'Jul', providers: 127, customers: 432 },
  ],
};
