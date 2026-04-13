import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getOrders, validateOrder, rejectOrder } from "../context/services/orderService";

export default function BillsList() {
  const [selectedBill, setSelectedBill] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showValidated, setShowValidated] = useState(true);
  const [loading, setLoading] = useState(false);

  // 📥 fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();

      const data = res.data.data.results;
      setOrders(Array.isArray(data) ? data : []);

    } catch (error) {
      const msg =
        error.response?.data?.message || "Error fetching orders";
      toast.error(msg);
    }
     setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

   const changeStatus = () => {
    setShowValidated((prev) => !prev);
  };

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
    if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Bills</h1>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={changeStatus}
            className="border border-white text-md  text-white px-3 py-2 rounded hover:bg-white/10 mb-4 cursor-pointer"
          >
            {showValidated ? "Show No Valide" : "Show Valide"}
          </button>
        </div>

        {/* LIST */}
        {orders
          .filter((o) =>
            showValidated
              ? o.state === "validated"
              : o.state !== "validated"
          )
          .map((o) => {
            return (
              <div
                key={o.id}
                onClick={() => setSelectedBill(o)}
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
                  <div className="md:flex items-center justify-between">
                    <p>
                      <strong>products:</strong>{" "}
                      {o.productsclient}
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
                      <strong className="text-white">State:</strong>{" "}
                      {o.state}
                    </p>


                  </div>

                </div>
              </div>
            );
          })}
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
                <strong>products:</strong>{" "}
                {selectedBill.productsclient}
              </p>

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

              <p>
                <strong>Product type:</strong>{" "}
                {selectedBill.product_type}
              </p>
              {/* Actions */}
              <div className="flex justify-between gap-4 mt-3">
                <p><strong>Validated by:</strong> {selectedBill.validated_by || "—"}</p>
                <div className="flex gap-4">
                  {selectedBill.state === "pending" && (
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

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}