import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getPayments,
  rejectPayment,
  validatePayment,
} from "../context/services/BalanceService";
import toast from "react-hot-toast";
import { useNotifications } from "../context/NotificationContext";
import { AuthContext } from "../context/AuthContext";

export default function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const [showValidated, setShowValidated] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const { fetchNotifications } = useNotifications();
  const location = useLocation();
  const selectedProductType = location.state?.productType;
  const { user } = useContext(AuthContext);

  const handleApiErrors = (error) => {
      const errors = error.response?.data.errors;
  
      if (!errors) return;
  
      Object.values(errors).forEach((messages) => {
        messages.forEach((msg) => {
          toast.error(msg);
        });
      });
    };

  //  Fetch data
  const fetchPayments = async () => {
    try {
      setLoading(true);

      const resP = await getPayments();
      await fetchNotifications();
      const paymentsData = resP.data.data.results;

      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Validate
  const handleValidate = async (id) => {
    try {
      await validatePayment(id);
      await fetchNotifications();
      toast.success("Payment validated");
      setSelectedPayment(null);
      fetchPayments();
    } catch (error) {
      handleApiErrors(error);
    }
  };

  //  Reject
  const handleReject = async (id) => {
    try {
      await rejectPayment(id);
      await fetchNotifications();
      toast.success("Payment rejected");
      setSelectedPayment(null);
      fetchPayments();
    } catch (error) {
      handleApiErrors(error);
    }
  };

  //  Toggle filter
  const changeStatus = () => {
    setShowValidated((prev) => !prev);
  };

  // Format date
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


  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const state = p.state?.toLowerCase();

    const matchState = showValidated
      ? state === "validated"
      : state !== "validated";
    

    const matchProduct = selectedProductType
      ? Number(p.product_type) === Number(selectedProductType)
      : true;

    return matchState && matchProduct;
  });

  if (loading) {
    return (
      <div className="text-white text-center mt-10">Loading...</div>
    );
  }

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        <h1 className="text-white text-xl font-bold">Payments</h1>

        {/* Controls */}
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
            {showValidated ? "Show Pending" : "Show Validated"}
          </button>
        </div>

        {/* List */}
        {filteredPayments.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPayment(p)}
            className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
          >
            <div className="space-y-2 text-sm">

              <p className="text-lg font-semibold">
                <strong>Product type:</strong> {p.productType}
              </p>
              <div className="md:flex justify-between">
                <p>
                  <strong>Transfer:</strong>{" "}
                  {formatDate(p.transferDate)}
                </p>

                <p>
                  <strong>Created:</strong>{" "}
                  {formatDate(p.created_at)}
                </p>
              </div>

              <div className="md:flex justify-between">
                <p>
                  <strong>Bank:</strong> {p.bankName}
                </p>

                <p className="text-green-500 font-bold">
                  <strong className="text-white">Amount:</strong>{" "}
                  {p.amount} DA
                </p>
              </div>

              <p
                className={
                  p.state === "validated"
                    ? "text-green-500"
                    : p.state === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                <strong className="text-white">State:</strong>{" "}
                {p.state}
              </p>

            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white text-white p-6 rounded-xl w-[350px] relative">

            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-2 right-3 cursor-pointer hover:text-red-500"
            >
              ✕
            </button>

            <div className="space-y-2 text-sm">

              <p><strong>Product:</strong> {selectedPayment.productType}</p>
              <p><strong>Transfer:</strong> {formatDate(selectedPayment.transferDate)}</p>
              <p><strong>Created:</strong> {formatDate(selectedPayment.created_at)}</p>
              <p><strong>Bank:</strong> {selectedPayment.bankName}</p>
              <p><strong>Amount:</strong> {selectedPayment.amount} DA</p>

              <p
                className={
                  selectedPayment.state === "validated"
                    ? "text-green-500"
                    : selectedPayment.state === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                <strong className="text-white">State:</strong> {selectedPayment.state}
              </p>

              <p><strong>Client:</strong> {selectedPayment.client}</p>


              {/* Actions */}
              <div className="flex justify-between gap-4 mt-3">
                <p><strong>Validated by:</strong> {selectedPayment.validated_by || "—"}</p>
                <div className="flex gap-4">
                  {selectedPayment.state === "pending" && (
                    <>
                     {["admin", "superAdmin"].includes(user?.role) && (
                        <>
                      <button
                        onClick={() => handleValidate(selectedPayment.id)}
                        className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full 
                    bg-green-700 hover:bg-green-800 
                    text-white transition"
                      >
                        <i className="fa-solid fa-check text-sm"></i>
                      </button>

                      <button
                        onClick={() => handleReject(selectedPayment.id)}
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
        </div>
      )}
    </div>
  );
}