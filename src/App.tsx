import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard';
import ProvidersPage from './pages/Providers/ProvidersPage';
import ProviderDetail from './pages/Providers/ProviderDetail';
import CustomersPage from './pages/Customers/CustomersPage';
import CustomerDetail from './pages/Customers/CustomerDetail';
import CategoriesPage from './pages/Categories/CategoriesPage';
import BookingsPage from './pages/Bookings/BookingsPage';
import BookingDetail from './pages/Bookings/BookingDetail';
import ServicesPage from './pages/Services/ServicesPage';
import OrdersPage from './pages/Marketplace/OrdersPage';
import StoresPage from './pages/Marketplace/StoresPage';
import ProductsPage from './pages/Marketplace/ProductsPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import KYCPage from './pages/KYC/KYCPage';
import ChatPage from './pages/Chat/ChatPage';
import CallsPage from './pages/Calls/CallsPage';
import AgentsPage from './pages/Agents/AgentsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SettingsPage from './pages/Settings/SettingsPage';

function PrivateRoute({ element }: { element: React.ReactNode }) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
            <Route path="/providers" element={<PrivateRoute element={<ProvidersPage />} />} />
            <Route path="/providers/:id" element={<PrivateRoute element={<ProviderDetail />} />} />
            <Route path="/customers" element={<PrivateRoute element={<CustomersPage />} />} />
            <Route path="/customers/:id" element={<PrivateRoute element={<CustomerDetail />} />} />
            <Route path="/categories" element={<PrivateRoute element={<CategoriesPage />} />} />
            <Route path="/bookings" element={<PrivateRoute element={<BookingsPage />} />} />
            <Route path="/bookings/:id" element={<PrivateRoute element={<BookingDetail />} />} />
            <Route path="/services" element={<PrivateRoute element={<ServicesPage />} />} />
            <Route path="/marketplace/orders" element={<PrivateRoute element={<OrdersPage />} />} />
            <Route path="/marketplace/stores" element={<PrivateRoute element={<StoresPage />} />} />
            <Route path="/marketplace/products" element={<PrivateRoute element={<ProductsPage />} />} />
            <Route path="/transactions" element={<PrivateRoute element={<TransactionsPage />} />} />
            <Route path="/kyc" element={<PrivateRoute element={<KYCPage />} />} />
            <Route path="/chat" element={<PrivateRoute element={<ChatPage />} />} />
            <Route path="/calls" element={<PrivateRoute element={<CallsPage />} />} />
            <Route path="/agents" element={<PrivateRoute element={<AgentsPage />} />} />
            <Route path="/notifications" element={<PrivateRoute element={<NotificationsPage />} />} />
            <Route path="/settings" element={<PrivateRoute element={<SettingsPage />} />} />

            {/* Default: redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
