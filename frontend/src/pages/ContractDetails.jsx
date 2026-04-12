import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getContractById,
  validateContract,
  rejectContract,
} from "../context/services/contractService";
import { useNotifications } from "../context/NotificationContext";

export default function ContractDetails() {
  const { id } = useParams();
  const { fetchNotifications } = useNotifications();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await getContractById(id);
      setContract(res.data.data);
      setSelectedContract(null); 
    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error fatching data";

      toast.error(msg);
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [id]);

  const handleValidate = async (contractId) => {
    try {
      await validateContract(contractId);
      await fetchNotifications();
      toast.success("Validated");
      fetchContract();
    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error validation";

      toast.error(msg);
      }
  };

  const handleReject = async (contractId) => {
    try {
      await rejectContract(contractId);
      await fetchNotifications();
      toast.success("Rejected");
      fetchContract();
    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error rejection";

      toast.error(msg);
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

  if (!contract) {
    return <div className="text-white text-center mt-10">No data</div>;
  }

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Contract</h1>
        </div>

        {/* Back */}
        <div className="flex justify-between items-center">
          <button
            className="text-white text-2xl cursor-pointer font-bold hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>

        {/* CARD */}
        <div
          onClick={() => setSelectedContract(contract)}
          className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
        >
          <div className="space-y-2 text-sm">

            <p className="text-lg font-semibold">
              <strong>Product type:</strong> {contract.product_type}
            </p>

            <div className="md:flex items-center justify-between">
              <p>
                <strong>Start date:</strong>{" "}
                {formatDate(contract.start_date)}
              </p>

              <p>
                <strong>End date:</strong>{" "}
                {formatDate(contract.end_date)}
              </p>
            </div>

            <div className="md:flex items-center justify-between">
              <p>
                <strong>Validated at:</strong>{" "}
                {formatDate(contract.validated_at)}
              </p>

              <p
                className={
                  contract.state === "validated"
                    ? "text-green-500"
                    : contract.state === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                <strong className="text-white">State:</strong>{" "}
                {contract.state}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white text-white p-6 rounded-xl w-[350px] relative">

            <button
              onClick={() => setSelectedContract(null)}
              className="absolute top-2 right-3 cursor-pointer text-white hover:text-red-500"
            >
              ✕
            </button>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Product type:</strong>{" "}
                {selectedContract.product_type}
              </p>

              <p>
                <strong>Start date:</strong>{" "}
                {formatDate(selectedContract.start_date)}
              </p>

              <p>
                <strong>End date:</strong>{" "}
                {formatDate(selectedContract.end_date)}
              </p>

              <p>
                <strong>Validated at:</strong>{" "}
                {formatDate(selectedContract.validated_at)}
              </p>

              <p
                className={
                  selectedContract.state === "validated"
                    ? "text-green-500"
                    : selectedContract.state === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                <strong className="text-white">State:</strong>{" "}
                {selectedContract.state}
              </p>



              {/* Actions */}
              <div className="flex justify-between gap-4 mt-3">
                <p>
                  <strong>Validated by:</strong>{" "}
                  {selectedContract.validated_by || "—"}
                </p>

                <div className="flex gap-4">
                  {selectedContract.state === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleValidate(selectedContract.id)
                        }
                        className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full bg-green-700 hover:bg-green-800 text-white"
                      >
                        <i className="fa-solid fa-check text-sm"></i>
                      </button>

                      <button
                        onClick={() =>
                          handleReject(selectedContract.id)
                        }
                        className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full bg-red-700 hover:bg-red-800 text-white"
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