import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import HomePage from './pages/public/HomePage.jsx'
import NotFoundPage from './pages/public/NotFoundPage.jsx'
import RoutePlaceholder from './pages/RoutePlaceholder.jsx'
import ProtectedRoute from './components/routes/ProtectedRoute.jsx'
import AdminRoute from './components/routes/AdminRoute.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import SignupPage from './pages/auth/SignupPage.jsx'
import PublicRoute from './components/routes/PublicRoute.jsx'
import AccountPage from './pages/user/AccountPage.jsx'
import EventPricingPage from './pages/public/EventPricingPage.jsx'
import CartPage from './pages/user/CartPage.jsx'
import MyBookingsPage from './pages/user/MyBookingsPage.jsx'
import StallsPage from './pages/public/StallsPage.jsx'
import StallDetailsPage from './pages/public/StallDetailsPage.jsx'
import StallCartPage from './pages/user/StallCartPage.jsx'
import MyStallOrdersPage from './pages/user/MyStallOrdersPage.jsx'
import StallOwnerRoute from './components/routes/StallOwnerRoute.jsx'
import StallOwnerDashboard from './pages/user/StallOwnerDashboard.jsx'
import ManageStallPage from './pages/user/ManageStallPage.jsx'
import AdminStallsPage from './pages/admin/AdminStallsPage.jsx'
import AdminStallOrdersPage from './pages/admin/AdminStallOrdersPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import MakeAdminPage from "./pages/admin/MakeAdminPage.jsx";
import AdminEventsPage from "./pages/admin/AdminEventsPage.jsx";
import AdminPricingPage from "./pages/admin/AdminPricingPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>

        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="about" element={<RoutePlaceholder title="About" />} />
        <Route path="gallery" element={<RoutePlaceholder title="Gallery" />} />
        <Route path="eventSchedules" element={<RoutePlaceholder title="Event Schedules" />} />
        <Route path="contact" element={<RoutePlaceholder title="Contact" />} />
        <Route path="stalls" element={<StallsPage />} />
        <Route path="stall/:id" element={<StallDetailsPage />} />
        <Route path="pricing/:eventId" element={<EventPricingPage />} />
        <Route path="success" element={<RoutePlaceholder title="Payment Success" />} />
        <Route path="cancel" element={<RoutePlaceholder title="Payment Cancel" />} />

        {/* Guest-only pages */}
        <Route element={<PublicRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Authenticated user pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="account" element={<AccountPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="stall/:id/cart" element={<StallCartPage />} />
          <Route path="stall-orders" element={<MyStallOrdersPage />} />
        </Route>


        {/* Stall Owner pages */}
        <Route element={<StallOwnerRoute />}>
          <Route path="stall-dashboard" element={<StallOwnerDashboard />} />
          <Route path="stall-dashboard/stalls/:id/manage" element={<ManageStallPage />} />
        </Route>

        {/* Admin pages */}
        <Route element={<AdminRoute />}>
          <Route path="dashboard" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="make-admin" element={<MakeAdminPage />} />
            <Route path="images" element={<RoutePlaceholder title="Images" />} />
            <Route path="participants" element={<RoutePlaceholder title="Participants" />} />
            <Route path="leaderboard" element={<RoutePlaceholder title="Leaderboard" />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="eventOrder" element={<RoutePlaceholder title="Event Orders" />} />
            <Route path="pricingSet" element={<AdminPricingPage />} />
            <Route path="performers" element={<RoutePlaceholder title="Performers" />} />
            <Route path="feedback" element={<RoutePlaceholder title="Feedback" />} />
            <Route path="announcement" element={<RoutePlaceholder title="Announcements" />} />
            <Route path="stalls" element={<AdminStallsPage />} />
            <Route path="stallsOrder" element={<AdminStallOrdersPage />} />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  )
}

export default App