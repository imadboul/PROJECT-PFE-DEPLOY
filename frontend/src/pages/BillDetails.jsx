import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getOrderById,
  validateOrder,
  rejectOrder,
} from "../context/services/orderService";
import { useNotifications } from "../context/NotificationContext";

export default function BillDetails() {
  const { id } = useParams();
  const { fetchNotifications } = useNotifications();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const res = await getOrderById(id);
      const data = res.data.data.order;

      setOrder(data);
    } catch (error) {
      toast.error("Error fetching order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleValidate = async () => {
    try {
      await validateOrder(id);
      await fetchNotifications();
      toast.success("Order validated");
      fetchOrder();
    } catch {
      toast.error("Error validation");
    }
  };

  const handleReject = async () => {
    try {
      await rejectOrder(id);
      await fetchNotifications();
      toast.success("Order rejected");
      fetchOrder();
    } catch {
      toast.error("Error rejection");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (!order) {
    return <div className="text-white text-center mt-10">No data</div>;
  }

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">
            Bill Details #{order.id}
          </h1>

          <button
            className="text-white text-2xl hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            ←
          </button>
        </div>

        {/* CARD */}
        <div className="bg-black/50 text-white rounded-2xl p-5 border">
          
          <p>
            <strong>Client:</strong> {order.client}
          </p>

          <p>
            <strong>Contract:</strong> {order.contract}
          </p>

          <p className="mt-2">
            <strong>Date:</strong> {formatDate(order.date_created)}
          </p>

          <p
            className={
              order.state === "validated"
                ? "text-green-500"
                : order.state === "rejected"
                ? "text-red-500"
                : "text-yellow-500"
            }
          >
            <strong>State:</strong> {order.state}
          </p>

          {/* PRODUCTS */}
          <div className="mt-3">
            <strong>Products:</strong>

            {order.productsclient?.length > 0 ? (
              order.productsclient.map((p, i) => (
                <div key={i} className="text-sm ml-3 mt-1">
                  • Product ID: {p.product} | Qte: {p.qte} | Taken: {p.qte_taken}
                </div>
              ))
            ) : (
              <p className="text-sm ml-3">No products</p>
            )}
          </div>

          {/* ACTIONS */}
          {order.state === "pending" && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleValidate}
                className="bg-green-700 px-4 py-1 rounded hover:bg-green-800"
              >
                Validate
              </button>

              <button
                onClick={handleReject}
                className="bg-red-700 px-4 py-1 rounded hover:bg-red-800"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}