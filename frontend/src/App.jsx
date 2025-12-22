import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./services/authContext";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import DriverLayout from "./layouts/DriverLayout.jsx";
import ClientLayout from "./layouts/ClientLayout.jsx";

import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Pricing from "./pages/Pricing.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import DriverLogin from "./pages/DriverLogin.jsx";
import DriverRegister from "./pages/DriverRegister.jsx";
import DriverApply from "./pages/DriverApply.jsx";
import Register from "./pages/Register.jsx";
import Track from "./pages/Track.jsx";
import Pay from "./pages/Pay.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Login from "./pages/Login.jsx";
import FirstLoginReset from "./pages/FirstLoginReset.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import DriverDashboard from "./pages/DriverDashboard.jsx";
import ClientDashboard from "./pages/ClientDashboard.jsx";
import SelfTest from "./pages/SelfTest.jsx";
import ClientOrders from "./pages/ClientOrders.jsx";
import ClientProfile from "./pages/ClientProfile.jsx";
import ClientOrderHistory from "./pages/ClientOrderHistory.jsx";
import PublicSupport from "./pages/PublicSupport.jsx";
import ClientBilling from "./pages/ClientBilling.jsx";
import ClientNotifications from "./pages/ClientNotifications.jsx";
import ClientSecurity from "./pages/ClientSecurity.jsx";
import ClientOrderNew from "./pages/ClientOrderNew.jsx";
import ClientSupport from "./pages/ClientSupport.jsx";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout /> }>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/self-test" element={<SelfTest />} />
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route path="/driver-register" element={<DriverRegister />} />
        <Route path="/driver-apply" element={<DriverApply />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track/:orderId" element={<Track />} />
        <Route path="/pay/:orderId" element={<Pay />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/support" element={<PublicSupport />} />
        <Route path="/login" element={<Login />} />
        <Route path="/first-login-reset" element={<FirstLoginReset />} />
      </Route>

      {/* Role-protected dashboards */}
      <Route element={<RoleRoute roles={["admin", "operator"]} /> }>
        <Route element={<AdminLayout /> }>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>
      <Route element={<RoleRoute roles={["driver"]} /> }>
        <Route element={<DriverLayout /> }>
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
        </Route>
      </Route>
      <Route element={<RoleRoute roles={["client"]} /> }>
        <Route element={<ClientLayout /> }>
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/client/orders" element={<ClientOrders />} />
          <Route path="/client/orders/new" element={<ClientOrderNew />} />
          <Route path="/client/profile" element={<ClientProfile />} />
          <Route path="/client/orders/history" element={<ClientOrderHistory />} />
          <Route path="/client/billing" element={<ClientBilling />} />
          <Route path="/client/notifications" element={<ClientNotifications />} />
          <Route path="/client/support" element={<ClientSupport />} />
          <Route path="/client/security" element={<ClientSecurity />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              user && ["admin", "operator", "driver", "client"].includes(user.role)
                ? user.role === "operator"
                  ? "/admin-dashboard"
                  : `/${user.role}-dashboard`
                : "/login"
            }
          />
        }
      />
    </Routes>
  );
}
