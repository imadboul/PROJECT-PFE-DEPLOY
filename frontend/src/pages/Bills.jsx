import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getOrders, validateOrder, rejectOrder } from "../context/services/orderService";

export default function BillsList() {
  const [selectedBill, setSelectedBill] = useState(null);
  const [orders, setOrders] = useState([]);

  // 📥 fetch orders
  const fetchOrders = async () => {
    try {
      const res = await getOrders();

      const data = res.data.data.results;
      setOrders(Array.isArray(data) ? data : []);

    } catch (error) {
      const msg =
        error.response?.data?.message || "Error fetching orders";
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ validate order
  const handleValidate = async (id) => {
    try {
      await validateOrder(id);
      toast.success("Order validated");
      fetchOrders();
      setSelectedBill(null);
    } catch (error) {
      toast.error("Validation error");
    }
  };

  // ❌ reject order
  const handleReject = async (id) => {
    try {
      await rejectOrder(id);
      toast.success("Order rejected");
      fetchOrders();
      setSelectedBill(null);
    } catch (error) {
      toast.error("Rejection error");
    }
  };

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Orders</h1>
        </div>

        {/* Cards */}
        {orders.map((o) => {
          const totalItems = o.productsclient?.length || 0;

          return (
            <div
              key={o.id}
              onClick={() => setSelectedBill(o)}
              className="cursor-pointer bg-black/50 text-white shadow-md rounded-2xl p-5 border hover:bg-black/80 transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">
                  Order #{o.id}
                </h2>

                <span
                  className={
                    o.state === "validated"
                      ? "bg-green-100 text-green-600 px-2 py-1 rounded text-sm"
                      : o.state === "rejected"
                      ? "bg-red-100 text-red-600 px-2 py-1 rounded text-sm"
                      : "bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-sm"
                  }
                >
                  {o.state}
                </span>
              </div>

              {/* Values */}
              <div className="mt-3 text-sm flex justify-between">
                <p>Client: {o.client}</p>
                <p>Products: {totalItems}</p>
              </div>

              <div className="mt-2 text-sm">
                <p>Date: {new Date(o.date_created).toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-transparent border border-white text-white p-6 rounded-xl w-[300px] md:w-[400px] relative">

            {/* Close */}
            <button
              onClick={() => setSelectedBill(null)}
              className="absolute top-2 right-3 text-white cursor-pointer hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4">
              Order #{selectedBill.id}
            </h2>

            <p><strong>Client:</strong> {selectedBill.client}</p>
            <p><strong>State:</strong> {selectedBill.state}</p>

            <p className="mt-2 font-bold">Products:</p>

            {selectedBill.productsclient?.length > 0 ? (
              selectedBill.productsclient.map((p, i) => (
                <div key={i} className="text-sm border-b border-white/20 py-1">
                  <p>Product ID: {p.product}</p>
                  <p>Qte: {p.qte}</p>
                </div>
              ))
            ) : (
              <p>No products</p>
            )}

            {/* ACTIONS */}
            {selectedBill.state === "pending" && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleValidate(selectedBill.id)}
                  className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                >
                  Validate
                </button>

                <button
                  onClick={() => handleReject(selectedBill.id)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}