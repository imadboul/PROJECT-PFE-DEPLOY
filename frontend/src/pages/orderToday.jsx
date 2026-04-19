import { useEffect, useState } from "react";
import { getOrders } from "../context/services/orderService";
import { handleApiErrors } from "../utils/handleApiErrors";
import { NavLink } from "react-router-dom";
import { getChargmentOrderAdmin, validateOrderAdmin } from "../context/services/orderAdmin";
import toast from "react-hot-toast";

export default function OrderToday() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("loading");

  const getToday = () => new Date().toISOString().split("T")[0];

  const handleValidate = async (id) => {
    try {
      await validateOrderAdmin(id);
      toast.success("Contrat validated");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      handleApiErrors(error);
    }
  };


  const fetchOrders = async () => {
    try {
      setLoading(true);
      const today = getToday();

      const res = await getOrders();
      const data = res.data.data.results || [];

      const resAdmin = await getChargmentOrderAdmin();
      const dataAdmin = resAdmin.data.data.results || [];

      const acceptedOrders = data
        .filter((o) => {
          if (o.pickup_date !== today) return false;
          if (o.state !== "accepted") return false;
          const hasChargement = dataAdmin.some((c) => c.client_order === o.id);
          return !hasChargement;
        })
        .map((o) => ({ ...o, _type: "accepted" }))
        .sort((a, b) => b.id - a.id)

      const loadingOrders = dataAdmin
        .filter((o) =>
          o.date_created?.split("T")[0] === today && o.states === "loading"
        )
        .map((o) => ({ ...o, _type: "loading" }))
        .sort((a, b) => b.id - a.id)


      const validatedOrders =
        dataAdmin
          .filter((o) =>
            o.date_created?.split("T")[0] === today && o.states === "validated"
          )
          .map((o) => ({ ...o, _type: "validated" }))
          .sort((a, b) => b.id - a.id)

      setAllOrders({ acceptedOrders, loadingOrders, validatedOrders });

    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStateClass = (state) => {
    if (state === "validated") return "text-green-500";
    if (state === "rejected") return "text-red-500";
    if (state === "accepted") return "text-orange-500";
    if (state === "loading") return "text-blue-400";
    return "text-gray-500";
  };

  const getCurrentOrders = () => {
    if (!allOrders.acceptedOrders) return [];
    if (activeTab === "accepted") return allOrders.acceptedOrders;
    if (activeTab === "loading") return allOrders.loadingOrders;
    if (activeTab === "validated") return allOrders.validatedOrders;
    return [];
  };

  if (loading)
    return <div className="text-white text-center mt-10">Loading...</div>;

  const tabs = [
    {
      key: "loading",
      label: "Loading",
      count: allOrders.loadingOrders?.length || 0,
      color: "border-blue-500 text-blue-500 bg-blue-500/10",
      inactive: "border-black/20 text-black/80",
    },
    {
      key: "accepted",
      label: "Accepted",
      count: allOrders.acceptedOrders?.length || 0,
      color: "border-orange-500 text-orange-500 bg-orange-500/10",
      inactive: "border-black/20 text-black/80",
    },
    {
      key: "validated",
      label: "Validated",
      count: allOrders.validatedOrders?.length || 0,
      color: "border-green-500 text-green-500 bg-green-500/10",
      inactive: "border-black/20 text-black/80",
    },
  ];

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        <h1 className="text-xl text-white font-bold mb-2">Today Orders</h1>

        {/* TABS */}
        <div className="flex gap-3 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-lg py-2 px-3 rounded-xl border cursor-pointer transition text-sm font-medium
                 ${activeTab === tab.key ? tab.color : tab.inactive
                }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-black/20" : "bg-black/5"
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ORDERS LIST */}
        {getCurrentOrders().length === 0 ? (
          <p className="text-white/60 text-center mt-6">No orders for today</p>
        ) : (
          getCurrentOrders().map((o) => {
            const state = o.state || o.states;
            return (
              <div
                key={`${o._type}-${o.id}`}
                onClick={() => setSelectedOrder(o)}
                className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border border-white/10 hover:bg-black/80 transition"
              >
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                      <strong>Order:</strong> {o.id}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full border ${o._type === "accepted"
                      ? "border-orange-500 text-orange-400"
                      : o._type === "loading"
                        ? "border-blue-500 text-blue-400"
                        : "border-green-500 text-green-400"
                      }`}>
                      {o._type === "accepted" ? "📦 Pickup" : o._type === "loading" ? "🚚 chargement" : "✅ Validated"}
                    </span>
                  </div>

                  <div className="md:flex items-center justify-between">
                    <p>
                      <strong>Client:</strong>{" "}
                      {o._type === "accepted" ? o.client : o.client_firstName + " " + o.client_lastName}
                    </p>
                    <p>
                      <strong>Contract:</strong> {"contract" + o.contract + "-" + o.order_orderProduct_items?.[0]?.product?.product_type}
                    </p>
                  </div>

                  {o._type === "accepted" && (
                    <p><strong>Pickup Date:</strong> {o.pickup_date}</p>
                  )}
                  {o._type === "loading" && (
                    <p><strong>Date Created:</strong> {o.date_created?.split("T")[0]}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className={getStateClass(state)}>
                      <strong className="text-white">State:</strong> {state}
                    </p>
                    {o._type !== "accepted" ? (
                      <p>
                        <strong className="text-white">Type:</strong> {o.type}
                      </p>
                    ) : null}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL */}
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

              <p className="text-center text-orange-500 font-bold mb-2">
                {selectedOrder._type === "accepted" ? "📦 Pickup Order" : selectedOrder._type === "loading" ? "🚚 Loading Order" : "✅ Validated Order"}
              </p>

              <p>
                <strong>Client:</strong>{" "}
                {selectedOrder._type === "accepted"
                  ? selectedOrder.client
                  : `${selectedOrder.client_firstName} ${selectedOrder.client_lastName}`}
              </p>

              <div>
                <strong>Products:</strong>
                {selectedOrder._type === "accepted" ? (
                  selectedOrder.orderclient_Orderproductclient_items?.length > 0
                    ? selectedOrder.orderclient_Orderproductclient_items.map((p, i) => (
                      <div key={i} className="ml-2">
                        • {p.product} | Qte: {p.qte} {p.unit}
                      </div>
                    ))
                    : <p className="ml-2">No products</p>
                ) : (
                  selectedOrder.order_orderProduct_items?.length > 0
                    ? selectedOrder.order_orderProduct_items.map((p, i) => (
                      <div key={i} className="ml-2">
                        • {p.product?.name} | Qte: {p.qte} {p.unit}
                      </div>
                    ))
                    : <p className="ml-2">No products</p>
                )}
              </div>

              {selectedOrder._type === "accepted" ? (
                <p><strong>Pick Up Date:</strong> {selectedOrder.pickup_date}</p>
              ) : (
                <p><strong>Date Created:</strong> {selectedOrder.date_created?.split("T")[0]}</p>
              )}
              {selectedOrder._type === "validated" ? (
                <p>
                  <strong className="text-white">Type:</strong> {selectedOrder.type}
                </p>
              ): null}

              <div className="flex items-center justify-between">
                <p className={getStateClass(selectedOrder.state || selectedOrder.states)}>
                  <strong className="text-white">State:</strong>{" "}
                  {selectedOrder.state || selectedOrder.states}
                </p>

                {selectedOrder._type === "accepted" && selectedOrder.state === "accepted" && (
                  <NavLink
                    to={`/chargmentOrder/${selectedOrder.id}`}
                    className="text-xl cursor-pointer text-orange-600 hover:text-orange-700 transition"
                  >
                    <i className="fa-solid fa-truck"></i>
                  </NavLink>
                )}
                <div className="flex gap-6">
                  {selectedOrder._type === "loading" && selectedOrder.states === "loading" && (
                    <>
                      <NavLink
                        to={`/rechargmentOrder/${selectedOrder.id}`}
                        className="text-xl cursor-pointer text-orange-600 hover:text-orange-700 transition"
                      >
                        <i className="fa-solid fa-pen-clip"></i>
                      </NavLink>
                      <button
                        onClick={() => handleValidate(selectedOrder.id)}
                        className="text-xl cursor-pointer text-orange-600 hover:text-orange-700 transition"
                      >
                        <i className="fa-solid fa-user-check"></i>
                      </button>
                    </>
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