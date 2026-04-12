import { useEffect, useState } from "react";
import { getContractPDF, getContracts, rejectContract, validateContract } from "../context/services/contractService";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";


export default function ContractsList() {
  const [contracts, setContracts] = useState([]);
  const [showActive, setShowActive] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const { fetchNotifications } = useNotifications();

  //  Validate
  const handleValidate = async (id) => {
    try {
      await validateContract(id);
     await fetchNotifications();
      toast.success("Contrat validated");
      setSelectedContract(null);
      fetchContracts();
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
      await rejectContract(id);
      toast.success("Payment rejected");
      setSelectedContract(null);
      fetchContracts();
    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error rejection";

      toast.error(msg);
      }
  };

  const viewContract = async (id) => {
    try {
      const res = await getContractPDF(id);

      const file = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(file);

      window.open(url, "_blank");

    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error view";

      toast.error(msg);
      }
  };

  const fetchContracts = async () => {
  try {
    setLoading(true);

    const res = await getContracts();

    const data =res.data.data.contracts 
  

    setContracts(Array.isArray(data) ? data : []);

  } catch (error) {
    const msg =
      error.response?.data?.error ||
      "Error fetching data";

    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchContracts();
  }, []);

  const changeStatus = () => {
    setShowActive((prev) => !prev);
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

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Contracts</h1>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={changeStatus}
            className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 mb-4 cursor-pointer"
          >
            {showActive ? "Show No Valide" : "Show Valide"}
          </button>

          <NavLink
            to="/RequestContract"
            className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 mb-4 cursor-pointer"
          >
            Request new contract
          </NavLink>
        </div>

        {/* LIST */}
        {contracts
          .filter((c) =>
            showActive
              ? c.state === "validated"
              : c.state !== "validated"
          )
          .map((c) => {
            return (
              <div
                key={c.id}
                onClick={() => setSelectedContract(c)}
                className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
              >
                <div className="space-y-2 text-sm">
                  <p className="text-lg font-bold">
                    <strong>Product type:</strong>{" "}
                    {c.product_type}
                  </p>

                  <div className="flex items-center justify-between">
                    <p>
                      <strong>Start date:</strong>{" "}
                      {formatDate(c.start_date)}
                    </p>

                    <p>
                      <strong>End date:</strong>{" "}
                      {formatDate(c.end_date)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>
                      <strong>Validated at:</strong>{" "}
                      {formatDate(c.validated_at)}
                    </p>

                    <p
                      className={
                        c.state === "validated"
                          ? "text-green-500"
                          : c.state === "rejected"
                            ? "text-red-500"
                            : "text-yellow-500"
                      }
                    >
                      <strong className="text-white">State:</strong>{" "}
                      {c.state}
                    </p>


                  </div>

                </div>
              </div>
            );
          })}
      </div>

      {/* MODAL */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white text-white p-6 rounded-xl w-[350px] relative">

            <button
              onClick={() => setSelectedContract(null)}
              className="absolute top-2 right-3 text-white cursor-pointer hover:text-red-500"
            >
              ✕
            </button>

            <div className="space-y-2 text-sm">

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

              <p>
                <strong>Product type:</strong>{" "}
                {selectedContract.product_type}
              </p>
              {/* Actions */}
              <div className="flex justify-between gap-4 mt-3">
                <p><strong>Validated by:</strong> {selectedContract.validated_by || "—"}</p>
                <div className="flex gap-4">
                  {selectedContract.state === "pending" && (
                    <>
                      <button
                        onClick={() => handleValidate(selectedContract.id)}
                        className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full 
                           bg-green-700 hover:bg-green-800 
                           text-white transition"
                      >
                        <i className="fa-solid fa-check text-sm"></i>
                      </button>

                      <button
                        onClick={() => handleReject(selectedContract.id)}
                        className="flex items-center justify-center cursor-pointer w-7 h-7 rounded-full 
                           bg-red-700 hover:bg-red-800 
                           text-white transition"
                      >
                        <i className="fa-solid fa-xmark text-sm"></i>
                      </button>
                    </>
                  )}
                  {selectedContract.state === "validated" && (

                    <button className="text-orange-400 cursor-pointer text-3xl hover:text-orange-600 transition"
                      onClick={() => viewContract(selectedContract.id)}>
                      <i class="fa-solid fa-file-pdf"></i>
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