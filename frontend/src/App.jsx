import { Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sign from "./pages/Sign";
import ContractsList from "./pages/Contract"
import ContractDetails from "./pages/ContractDetails"
import BalanceList from "./pages/Balance";
import Navbar from "./component/Navbar";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./component/ProtectedRoute";
import AddProductType from "./component/AddProductType";
import RequestContract from "./component/RequestContract";
import RequestPayment from "./component/RequestPayment";
import RequestOrder from "./component/RequestOrder";
import PaymentsList from "./pages/payment";
import PaymentDetails from "./pages/paymentDetails";
import AddProduct from "./component/AddProduct";
import EditProductType from "./component/EditProductType";
import ProductsList from "./pages/Product";
import EditProduct from "./component/EditProduct";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import BillsList from "./pages/Bills";
import ContractClient from "./pages/ContractClient";
import OrderToday from "./pages/orderToday";
import ChargmentOrder from "./component/chargmentOrder";
import RechargmentOrder from "./component/RechargmentOrder";
import TaxList from "./pages/TaxList";
import AddTax from "./component/AddTax";
import InvoiceList from "./pages/InvoiceList";
import ValidateInvoice from "./pages/ValidateInvoice";
import AdminRoute from "./component/AdminRoute"

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

      {/* Background image (fixed 100vh layer) */}
      <div className="fixed top-0 left-0 w-full h-screen -z-10">
        <img
          src="/SONATRACH-SIEGE-2025-WEB.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-r from-black/40 via-black/20 to-black/40"></div>
      </div>
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
              <AdminRoute>
                <Sign />
              </AdminRoute>
            }
          />
          <Route path="/AddProduct" element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>} />

           <Route path="/OrderToday" element={
            <AdminRoute>
              <OrderToday />
            </AdminRoute>} /> 

          <Route path="/AddProductType" element={
            <AdminRoute>
              <AddProductType />
            </AdminRoute>} />

          <Route path="/EditProductType/:id" element={
            <AdminRoute>
              <EditProductType />
            </AdminRoute>} />

          <Route path="/EditProduct/:id" element={
            <AdminRoute>
              <EditProduct />
            </AdminRoute>} />
            
          <Route path="/Bills" element={
            <AdminRoute>
              <BillsList />
            </AdminRoute>} />

            <Route path="/chargmentOrder/:id" element={
            <AdminRoute>
              <ChargmentOrder />
            </AdminRoute>} />

            <Route path="/rechargmentOrder/:id" element={
            <AdminRoute>
              <RechargmentOrder />
            </AdminRoute>} />

            <Route path="/AddTax" element={
            <AdminRoute>
              <AddTax />
            </AdminRoute>} />

            <Route path="/TaxList" element={
            <AdminRoute>
              <TaxList />
            </AdminRoute>} />



          <Route path="/Home" element={<Home />} />
          <Route path="/ContractClient" element={<ContractClient />} />
          <Route path="/Contracts" element={<ContractsList />} />
          <Route path="/Contracts/:id" element={<ContractDetails />} />
          <Route path="/Balance" element={<BalanceList />} />
          <Route path="/product" element={<ProductsList />} />
          <Route path="/Invoices" element={<InvoiceList />} />
          <Route path="/ValidateInvoice" element={<ValidateInvoice />} />
          <Route path="/order" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/Notifications" element={<Notifications />} />
          <Route path="/RequestContract" element={<RequestContract />} />
          <Route path="/RequestOrder" element={<RequestOrder />} />
          <Route path="/RequestPayment" element={<RequestPayment />} />
          <Route path="/Payment" element={<PaymentsList />} />
          <Route path="/Payment/:id" element={<PaymentDetails />} />
        </Route>
      </Routes>
    </div >
  );
}

export default App;
