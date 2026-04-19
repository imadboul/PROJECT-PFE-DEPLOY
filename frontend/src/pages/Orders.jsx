import { useContext, useEffect, useState } from "react";
import { getOrders, validateOrder, rejectOrder, getContractPDF } from "../context/services/orderService";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { handleApiErrors } from "../utils/handleApiErrors"

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showAccepted, setShowAccepted] = useState(true);
  const location = useLocation();
  const selectedclientID = location.state?.client_id || null;
  const [pickupDate, setPickupDate] = useState("");
  const { user } = useContext(AuthContext);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await getOrders();
      const data = res.data.data.results;

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, [selectedclientID]);

  const formatDate = (date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const handleValidate = async (id) => {
    try {
      if (!pickupDate) {
        toast.error("Select pickup date");
        return;
      }

      const formattedDate = formatDate(pickupDate);

      await validateOrder(id, formattedDate);

      toast.success("Order validated");

      setPickupDate("");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectOrder(id);
      toast.success("Order rejected");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const viewPDF = async (id) => {
    try {
      const res = await getContractPDF(id);
      const file = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const filteredOrder = orders.filter((o) => {
    const state = o.state?.toLowerCase();

    const matchState = showAccepted
      ? state === "accepted"
      : state !== "accepted";

    const matchClient = selectedclientID
      ? String(o.client_id) === String(selectedclientID)
      : true;

    return matchState && matchClient;
  });


  const changeStatus = () => {
    setShowAccepted((prev) => !prev);
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Orders</h1>
        </div>

        {["admin", "superAdmin"].includes(user?.role) && (
          <div className="flex justify-between items-center">

            <button
              className="text-white text-2xl font-bold cursor-pointer hover:text-orange-500"
              onClick={() => window.history.back()}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button
              onClick={changeStatus}
              className="border border-white text-white cursor-pointer px-4 py-2 rounded hover:bg-white/10"
            >
              {showAccepted ? "Show Pending" : "Show Accepted"}
            </button>
          </div>
        )}

        {["client"].includes(user?.role) && (

          <div className="flex justify-between items-center gap-4">
            <button
              onClick={changeStatus}
              className="border border-white text-white cursor-pointer px-4 py-2 rounded hover:bg-white/10"
            >
              {showAccepted ? "Show Pending" : "Show Accepted"}
            </button>
            <NavLink
              to="/RequestOrder"
              className="border border-white cursor-pointer text-white px-3 py-2 rounded hover:bg-white/10 mb-4"
            >
              Request Order
            </NavLink>
          </div>
        )}


        {filteredOrder.map((o) => (
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
                  {o.contract.id} - {o.contract.product_type}
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
              <div>
                {selectedOrder.orderclient_Orderproductclient_items?.length > 0
                  ? selectedOrder.orderclient_Orderproductclient_items.map((p, i) => (
                    <div key={i} className="text-md">
                      Product: {p.product} | Qte: {p.qte} {p.unit}
                    </div>
                  ))
                  : "No products"}
              </div>
              <p>
                <strong>Pick Up Date:</strong>{" "}
                {selectedOrder.pickup_date}
              </p>

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


              <div className="flex justify-between mt-3">
                <div className="flex gap-4">
                  {selectedOrder.state === "pending" && (
                    <>
                      {["admin", "superAdmin"].includes(user?.role) && (
                        <>
                          <button onClick={() => handleValidate(selectedOrder.id)}
                            className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full 
                           bg-green-700 hover:bg-green-800 text-white transition"
                          ><i className="fa-solid fa-check text-sm"></i></button>
                          <button onClick={() => handleReject(selectedOrder.id)}
                            className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full 
                          bg-red-700 hover:bg-red-800 text-white transition">
                            <i className="fa-solid fa-xmark text-sm"></i></button>
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

