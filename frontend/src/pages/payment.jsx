import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPayments } from "../context/services/BalanceService";
import { getProductTypes } from "../context/services/productService";
import toast from "react-hot-toast";

export default function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [showValidated, setShowValidated] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const selectedProductType = location.state?.productType;

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const resP = await getPayments();
      const resT = await getProductTypes();

      setPayments(resP.data.payments || resP.data);
      setProductTypes(resT.data.types || resT.data);

    } catch (err) {
      toast.error("Failed to load payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const changeStatus = () => {
    setShowValidated((prev) => !prev);
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

  const getProductName = (id) => {
    const type = productTypes.find((p) => p.id === id);
    return type ? type.name : id;
  };

  const filteredPayments = payments.filter((p) => {
    const state = p.state?.toLowerCase();

    const matchState = showValidated
      ? state === "validated"
      : state === "pending";

    const matchProduct = selectedProductType
      ? Number(p.productType) === Number(selectedProductType)
      : true;

    return matchState && matchProduct;
  });

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        <h1 className="text-white text-xl font-bold">Payments</h1>
        <div className="flex justify-between items-center">
          <button
            className="text-white text-2xl font-bold hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <button
            onClick={changeStatus}
            className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 mb-4"
          >
            {showValidated ? "Show Pending" : "Show Validated"}
          </button>
        </div>
        {filteredPayments.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPayment(p)}
            className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
          >
            <div className="space-y-2 text-sm">

              <p>
                <strong>Product:</strong>{" "}
                {getProductName(p.productType)}
              </p>

              <div className="flex justify-between">
                <p>
                  <strong>Transfer:</strong>{" "}
                  {formatDate(p.transferDate)}
                </p>

                <p>
                  <strong>Created:</strong>{" "}
                  {formatDate(p.created_at)}
                </p>
              </div>

              <div className="flex justify-between">
                <p>
                  <strong>Bank:</strong> {p.bankName}
                </p>

                <p className="text-green-500 text-md font-bold">
                  <strong className="text-white ">Amount:</strong> {p.amount} DA
                </p>
              </div>

              <p className={p.state === "validated" ? "text-green-500" : "text-yellow-500"}>
                <strong className="text-white">State:</strong> {p.state}
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
              className="absolute top-2 right-3 hover:text-red-500"
            >
              ✕
            </button>

            <div className="space-y-2 text-sm">
              <p><strong>Product:</strong> {getProductName(selectedPayment.productType)}</p>
              <p><strong>Transfer:</strong> {formatDate(selectedPayment.transferDate)}</p>
              <p><strong>Created:</strong> {formatDate(selectedPayment.created_at)}</p>
              <p><strong>Bank:</strong> {selectedPayment.bankName}</p>
              <p><strong>Amount:</strong> {selectedPayment.amount} DA</p>
              <p><strong>State:</strong> {selectedPayment.state}</p>
              <p><strong>Client:</strong> {selectedPayment.client}</p>
              <p><strong>Validated by:</strong> {selectedPayment.validated_by || "—"}</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}