import { useContext, useEffect, useState } from "react";
import { getOrders, validateOrder, rejectOrder, getContractPDF } from "../context/services/orderService";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showValidated, setShowValidated] = useState(true);
  const location = useLocation();
  const selectedclientID = location.state?.client_id || null;
    const { user } = useContext(AuthContext);
  

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await getOrders();
      const data = res.data.data.results;

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Error fatching data";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
  fetchOrders();
}, [selectedclientID]);

  const handleValidate = async (id) => {
    try {
      await validateOrder(id);
      toast.success("Order validated");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error validation");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectOrder(id);
      toast.success("Order rejected");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error rejection");
    }
  };

  const viewPDF = async (id) => {
    try {
      const res = await getContractPDF(id);
      const file = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error view");
    }
  };

  const filteredOrder = orders.filter((o) => {
  const state = o.state?.toLowerCase();

  const matchState = showValidated
    ? state === "validated"
    : state !== "validated";

  const matchClient = selectedclientID
  ? String(o.client_id) === String(selectedclientID)
  : true;

  return matchState && matchClient;
});


  const changeStatus = () => {
    setShowValidated((prev) => !prev);
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Orders</h1>
        </div>

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={changeStatus}
            className="border border-white cursor-pointer text-white px-3 py-2 rounded hover:bg-white/10 mb-4"
          >
            {showValidated ? "Show No Valide" : "Show Valide"}
          </button>

          <NavLink
            to="/RequestOrder"
            className="border border-white cursor-pointer text-white px-3 py-2 rounded hover:bg-white/10 mb-4"
          >
            Request Order
          </NavLink>
        </div>

        {filteredOrder
          .map((o) => (
            <div
              key={o.id}
              onClick={() => setSelectedOrder(o)}
              className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
            >
              <div className="space-y-2 text-sm">
                <p className="text-lg font-semibold">
                  <strong>Client:</strong> {o.client}
                </p>

                <p>
                  <strong>Date:</strong> {new Date(o.date_created).toLocaleString()}
                </p>

                <p
                  className={
                    o.state === "validated"
                      ? "text-green-500"
                      : o.state === "rejected"
                        ? "text-red-500"
                        : "text-yellow-500"
                  }
                >
                  <strong className="text-white">State:</strong> {o.state}
                </p>
              </div>
            </div>
          ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white text-white p-6 rounded-xl w-[350px] relative">

            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-2 right-3 cursor-pointer text-white hover:text-red-500"
            >
              ✕
            </button>

            <div className="space-y-2 text-sm">
              <p><strong>Client:</strong> {selectedOrder.client}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.date_created).toLocaleString()}</p>

              <p
                className={
                  selectedOrder.state === "validated"
                    ? "text-green-500"
                    : selectedOrder.state === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                <strong className="text-white">State:</strong> {selectedOrder.state}
              </p>

              <div className="flex justify-between mt-3">
                <div className="flex gap-4">
                  {selectedOrder.state === "pending" && (
                    <>
                     {["admin", "superAdmin"].includes(user?.role) && (
                        <>
                      <button onClick={() => handleValidate(selectedOrder.id)} className="bg-green-700 w-7 h-7 rounded-full">✔</button>
                      <button onClick={() => handleReject(selectedOrder.id)} className="bg-red-700 w-7 h-7 rounded-full">✖</button>
                      </>
                      )}
                    </>
                  )}
                  {selectedOrder.state === "validated" && (
                    <button onClick={() => viewPDF(selectedOrder.id)} className="text-orange-400 text-3xl">
                      <i className="fa-solid fa-file-pdf"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

