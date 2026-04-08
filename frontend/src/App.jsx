import { Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sign from "./pages/Sign";
import ContractsList from "./pages/Contract"
import ContractDetails from "./pages/ContractDetails"
import BalanceList from "./pages/Balance";
import Invoice from "./pages/Invoice";
import Navbar from "./component/Navbar";
import Bills from "./pages/Bills";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./component/ProtectedRoute";
import SuperAdminRoute from "./component/SuperAdminRoute";
import AddProductType from "./component/AddProductType";
import RequestContract from "./component/RequestContract";
import RequestPayment from "./component/RequestPayment";
import PaymentsList from "./pages/payment";
import PaymentDetails from "./pages/paymentDetails";
import AddProduct from "./component/AddProduct";
import EditProductType from "./component/EditProductType";

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
      <Toaster position="bottom-right" />

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
              <SuperAdminRoute>
                <Sign />
              </SuperAdminRoute>
            }
          />
          <Route path="/AddProduct" element={
            <SuperAdminRoute>
              <AddProduct />
            </SuperAdminRoute>} />

          <Route path="/AddProductType" element={
            <SuperAdminRoute>
              <AddProductType />
            </SuperAdminRoute>} />

          <Route path="/EditProductType/:id" element={
            <SuperAdminRoute>
              <EditProductType />
            </SuperAdminRoute>} />
          <Route path="/EditProductType/" element={
            <SuperAdminRoute>
              <EditProductType />
            </SuperAdminRoute>} />


          <Route path="/Home" element={<Home />} />
          <Route path="/contracts" element={<ContractsList />} />
          <Route path="/contracts/:id" element={<ContractDetails />} />
          <Route path="/Balance" element={<BalanceList />} />
          <Route path="/Invoices" element={<Invoice />} />
          <Route path="/Bills" element={<Bills />} />
          <Route path="/Notifications" element={<Notifications />} />
          <Route path="/RequestContract" element={<RequestContract />} />
          <Route path="/RequestPayment" element={<RequestPayment />} />
          <Route path="/Payment" element={<PaymentsList />} />
          <Route path="/Payment/:id" element={<PaymentDetails />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
