import { Routes, Route, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sign from "./pages/Sign";
import ContractsList from "./pages/Contract"
import SoldList from "./pages/Sold";
import Invoice from "./pages/Invoice";
import Navbar from "./component/Navbar";
import Bills from "./pages/Bills";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./component/ProtectedRoute";
import AdminRoute from "./component/AdminRoute";
import "./App.css";
/* Layout */
function Layout() {
  return (
    <div className="relative z-50">
      <Navbar />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <img
        src="/SONATRACH-SIEGE-2025-WEB.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30"></div>

      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/Sign"
            element={
              <AdminRoute>
                <Sign />
              </AdminRoute>
            }
          />

          <Route path="/Home" element={<Home />} />
          <Route path="/Contracts" element={<ContractsList />} />
          <Route path="/Sold" element={<SoldList />} />
          <Route path="/Invoices" element={<Invoice />} />
          <Route path="/Bills" element={<Bills />} />
          <Route path="/Notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
