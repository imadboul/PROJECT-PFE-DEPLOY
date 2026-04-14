import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPaymentById,
  rejectPayment,
  validatePayment,
} from "../context/services/BalanceService";
import toast from "react-hot-toast";
import { useNotifications } from "../context/NotificationContext";


export default function PaymentDetails() {
  const [payment, setPayment] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const { fetchNotifications } = useNotifications();

  const { id } = useParams();

  // Fetch data
  const fetchPayment = async () => {
    try {
      setLoading(true);

      const resP = await getPaymentById(id);
      await fetchNotifications();

      const paymentData = resP.data.data || resP.data;

      setPayment(paymentData);
    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error fatching data";

      toast.error(msg);
      }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  // Validate
  const handleValidate = async (id) => {
    try {
      await validatePayment(id);
      await fetchNotifications();
      toast.success("Payment validated");
      setSelectedPayment(null);
      fetchPayment();
    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error validation";

      toast.error(msg);
      }
  };

  // Reject
  const handleReject = async (id) => {
    try {
      await rejectPayment(id);
      toast.success("Payment rejected");
      setSelectedPayment(null);
      fetchPayment();
    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error rejection";

      toast.error(msg);
      }
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



  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (!payment) {
    return <div className="text-white text-center mt-10">No data</div>;
  }

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        <h1 className="text-white text-xl font-bold">Payment Details</h1>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <button
            className="text-white text-2xl cursor-pointer font-bold hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>

        {/* Payment Card */}
        <div
          onClick={() => setSelectedPayment(payment)}
          className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
        >
          <div className="space-y-2 text-sm">

            <p className="text-lg font-semibold">
              <strong>Product type:</strong> {payment.product_type}
            </p>

            <div className="md:flex justify-between">
              <p>
                <strong>Transfer:</strong>{" "}
                {formatDate(payment.transferDate)}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {formatDate(payment.created_at)}
              </p>
            </div>

            <div className="md:flex justify-between">
              <p>
                <strong>Bank:</strong> {payment.bankName}
              </p>

              <p className="text-green-500 font-bold">
                <strong className="text-white">Amount:</strong>{" "}
                {payment.amount} DA
              </p>
            </div>

            <p
              className={
                payment.state === "validated"
                  ? "text-green-500"
                  : payment.state === "rejected"
                    ? "text-red-500"
                    : "text-yellow-500"
              }
            >
              <strong className="text-white">State:</strong>{" "}
              {payment.state}
            </p>

          </div>
        </div>

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

              <p>
                <strong>Product:</strong>{" "}
                {selectedPayment.productType}
              </p>

              <p>
                <strong>Transfer:</strong>{" "}
                {formatDate(selectedPayment.transferDate)}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {formatDate(selectedPayment.created_at)}
              </p>

              <p>
                <strong>Bank:</strong> {selectedPayment.bankName}
              </p>

              <p>
                <strong>Amount:</strong> {selectedPayment.amount} DA
              </p>

              <p
                 className={
                        selectedPayment.state === "validated"
                          ? "text-green-500"
                          : selectedPayment.state === "rejected"
                            ? "text-red-500"
                            : "text-yellow-500"
                      }
              >
                <strong className="text-white">State:</strong>{" "}
                {selectedPayment.state}
              </p>

              <p>
                <strong>Client:</strong> {selectedPayment.client}
              </p>

              {/* Actions */}
              <div className="flex justify-between gap-4 mt-3">
                <p>
                  <strong>Validated by:</strong>{" "}
                  {selectedPayment.validated_by || "—"}
                </p>

                <div className="flex gap-4">
                  {selectedPayment.state === "pending" && (
                    <>
                     {["admin", "superAdmin"].includes(user?.role) && (
                        <>
                      <button
                        onClick={() =>
                          handleValidate(selectedPayment.id)
                        }
                        className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full bg-green-700 hover:bg-green-800 text-white transition"
                      >
                        <i className="fa-solid fa-check text-sm"></i>
                      </button>

                      <button
                        onClick={() =>
                          handleReject(selectedPayment.id)
                        }
                        className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full bg-red-700 hover:bg-red-800 text-white transition"
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