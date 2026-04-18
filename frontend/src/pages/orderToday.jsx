import { useEffect, useState } from "react";
import { getOrders } from "../context/services/orderService";
import { handleApiErrors } from "../utils/handleApiErrors";
import { NavLink } from "react-router-dom";
import { getChargmentOrderAdmin } from "../context/services/orderAdmin";

export default function OrderToday() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);


  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await getOrders();
      const data = res.data.data.results || [];

      const resAdmin = await getChargmentOrderAdmin();
      const dataAdmin = resAdmin.data.data.results || [];

      const today = getToday();

      if (dataAdmin.length === 0) {


        const filtered = data.filter((o) => {

          const pickupDate = o.pickup_date;

          return pickupDate === today;
        });
      } else {

        const filtered = dataAdmin.filter((o) => {
          const laodingToday = o.date_created.split("T")[0];
          return laodingToday === today;
        });
      }

      setOrders(filtered);
    } catch (error) {
      handleApiErrors(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading)
    return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <h1 className="text-xl text-white font-bold mb-4">Today Orders</h1>

        {orders.length === 0 ? (
          <p>No orders for today</p>
        ) : (
          orders.map((o) => (
            <div
              key={o.id}
              onClick={() => setSelectedOrder(o)}
              className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
            >
              <div className="space-y-2 text-sm">
                <p className="text-lg font-semibold">
                  <strong>Order:</strong>{" "}
                  {o.id}
                </p>

                <div className="md:flex items-center justify-between">
                  <p>
                    <strong>client:</strong>{" "}
                    {o.client}
                  </p>

                  <p>
                    <strong>contract:</strong>{" "}
                    {o.contract}
                  </p>
                </div>

                <p
                  className={
                    o.state === "validated"
                      ? "text-green-500"
                      : o.state === "rejected"
                        ? "text-red-500"
                        : o.state === "accepted"
                          ? "text-orange-500"
                          : "text-gray-500"
                  }
                >
                  <strong className="text-white">State:</strong>{" "}
                  {o.state}
                </p>
              </div>
            </div>
          ))
        )}
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
              <div>
                {selectedOrder.orderclient_Orderproductclient_items?.length > 0
                  ? selectedOrder.orderclient_Orderproductclient_items.map((p, i) => (
                    <div key={i} className="text-md">
                      Product: {p.product} | Qte: {p.qte} {p.unit} | qte taken
                    </div>
                  ))
                  : "No products"}
              </div>
              <p>
                <strong>Pick Up Date:</strong>{" "}
                {selectedOrder.pickup_date}
              </p>
              <div className="flex items-center justify-between">
                <p
                  className={
                    selectedOrder.state === "validated"
                      ? "text-green-500"
                      : selectedOrder.state === "rejected"
                        ? "text-red-500"
                        : selectedOrder.state === "accepted"
                          ? "text-orange-500"
                          : "text-gray-500"
                  }
                >
                  <strong className="text-white">State:</strong> {selectedOrder.state}
                </p>
                {selectedOrder.state === "accepted" && (
                  <NavLink
                    to={`/chargmentOrder/${selectedOrder.id}`}
                    className="text-xl cursor-pointer
                           text-orange-600 hover:text-orange-700 transition"
                  >
                    <i className="fa-solid fa-truck"></i>
                  </NavLink>
                )}
              </div>
              {selectedOrder.state === "pending" && (
                <div className="mb-4">
                  <label className="text-sm">Pickup Date</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full p-2 mt-1 rounded bg-white/20 text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}