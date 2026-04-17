import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getOrderById,
  validateOrder,
  rejectOrder,
} from "../context/services/orderService";
import { useNotifications } from "../context/NotificationContext";
import { AuthContext } from "../context/AuthContext";
import { handleApiErrors } from "../utils/handleApiErrors"


export default function OrderDetails() {
  const { id } = useParams();
  const { fetchNotifications } = useNotifications();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [pickupDate, setPickupDate] = useState("");
  const { user } = useContext(AuthContext);


  const fetchOrder = async () => {
    try {
      setLoading(true);

      const res = await getOrderById(id);
      const data = res.data.data.order;

      setOrder(data);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const handleValidate = async () => {
    try {
      if (!pickupDate) {
        toast.error("Select pickup date");
        return;
      }

      const formattedDate = formatDate(pickupDate);

      await validateOrder(id, formattedDate);

      toast.success("Order validated");

      setPickupDate("");
      setSelectedBill(null);
      fetchOrder();
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectOrder(id);
      await fetchNotifications();
      toast.success("Order rejected");
      fetchOrder();
    } catch (error) {
      handleApiErrors(error);
      toast.error("Error rejection");
    }
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
          <h1 className="text-white text-xl font-bold">Bills</h1>
        </div>


        {/* CARD */}
        <div onClick={() => setSelectedBill(order)}
          className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition">

          <div className="space-y-2 text-sm">
            <p className="text-lg font-semibold">
              <strong>Order:</strong>{" "}
              {order.id}
            </p>

            <div className="md:flex items-center justify-between">
              <p>
                <strong>client:</strong>{" "}
                {order.client}
              </p>

              <p>
                <strong>contract:</strong>{" "}
                {order.contract}
              </p>
            </div>
              <p
                className={
                  order.state === "validated"
                    ? "text-green-500"
                    : order.state === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                <strong className="text-white">State:</strong>{" "}
                {order.state}
              </p>


            </div>
          </div>
        </div>
      {/* MODAL */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white text-white p-6 rounded-xl w-[350px] relative">

            <button
              onClick={() => setSelectedBill(null)}
              className="absolute top-2 right-3 text-white cursor-pointer hover:text-red-500"
            >
              ✕
            </button>

            <div className="space-y-2 text-sm">

              <p>
                <strong>client:</strong>{" "}
                {selectedBill.client}
              </p>

              <p>
                <strong>contract:</strong>{" "}
                {selectedBill.contract}
              </p>
              <p>
                <strong>Pick Up Date:</strong>{" "}
                {selectedBill.pickup_date}
              </p>

              {selectedBill.orderclient_Orderproductclient_items?.length > 0
                ? selectedBill.orderclient_Orderproductclient_items.map((p, i) => (
                  <div key={i} className="text-xs">
                    Product: {p.product} | Qte: {p.qte} {p.unit}
                  </div>
                ))
                : "No products"}

              <p
                className={
                  selectedBill.state === "validated"
                    ? "text-green-500"
                    : selectedBill.state === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                <strong className="text-white">State:</strong>{" "}
                {selectedBill.state}

              </p>

              {/* Actions */}
                {selectedBill.state === "pending" && (
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

                <div className="flex gap-4">
                  {selectedBill.state === "pending" && (
                    <>
                      {["admin", "superAdmin"].includes(user?.role) && (
                        <>
                          <button
                            onClick={() => handleValidate(selectedBill.id)}
                            className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full 
                           bg-green-700 hover:bg-green-800 
                           text-white transition"
                          >
                            <i className="fa-solid fa-check text-sm"></i>
                          </button>

                          <button
                            onClick={() => handleReject(selectedBill.id)}
                            className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full 
                           bg-red-700 hover:bg-red-800 
                           text-white transition"
                          >
                            <i className="fa-solid fa-xmark text-sm"></i>
                          </button>
                        </>
                      )}
                    </>
                  )}

                </div>
              </div>

            </div>
          </div>
      )}
    </div>

  );
}