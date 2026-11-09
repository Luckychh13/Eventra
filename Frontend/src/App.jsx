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
        <Route path="stall/:id" element={<RoutePlaceholder title="Stall Details" />} />
        <Route path="pricing/:eventId" element={<RoutePlaceholder title="Event Pricing" />} />
        <Route path="success" element={<RoutePlaceholder title="Payment Success" />} />
        <Route path="cancel" element={<RoutePlaceholder title="Payment Cancel" />} />

        {/* Guest-only pages */}
        <Route element={<PublicRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Authenticated user pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="stalls" element={<RoutePlaceholder title="Stalls" />} />
          <Route path="voting" element={<RoutePlaceholder title="Voting Zone" />} />
        </Route>

        {/* Authenticated user pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="account" element={<AccountPage />} />
        </Route>

        {/* Other pages */}
        <Route path="cart" element={<RoutePlaceholder title="Cart" />} />

        {/* Stall-owner page; authentication is handled inside its page */}
        <Route path="stall-dashboard" element={<RoutePlaceholder title="Stall Owner Dashboard" />} />

        {/* Admin pages */}
        <Route element={<AdminRoute />}>
          <Route path="dashboard" element={<AdminLayout />}>
            <Route index element={<RoutePlaceholder title="Admin Dashboard" />} />
            <Route path="users" element={<RoutePlaceholder title="Users" />} />
            <Route path="make-admin" element={<RoutePlaceholder title="Make Admin" />} />
            <Route path="images" element={<RoutePlaceholder title="Images" />} />
            <Route path="participants" element={<RoutePlaceholder title="Participants" />} />
            <Route path="leaderboard" element={<RoutePlaceholder title="Leaderboard" />} />
            <Route path="events" element={<RoutePlaceholder title="Events" />} />
            <Route path="eventOrder" element={<RoutePlaceholder title="Event Orders" />} />
            <Route path="pricingSet" element={<RoutePlaceholder title="Pricing" />} />
            <Route path="performers" element={<RoutePlaceholder title="Performers" />} />
            <Route path="feedback" element={<RoutePlaceholder title="Feedback" />} />
            <Route path="announcement" element={<RoutePlaceholder title="Announcements" />} />
            <Route path="stalls" element={<RoutePlaceholder title="Stalls Management" />} />
            <Route path="stallsOrder" element={<RoutePlaceholder title="Stall Orders" />} />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  )
}

export default App