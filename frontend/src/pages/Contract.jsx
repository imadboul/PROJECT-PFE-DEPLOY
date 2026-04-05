import { useEffect, useState } from "react";
import { getContracts } from "../context/services/contractService";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";

export default function ContractsList() {
  const [contracts, setContracts] = useState([]);
  const [showActive, setShowActive] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await getContracts();
      setContracts(res.data.contracts || res.data);
    } catch (err) {
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = () => {
    setShowActive((prev) => !prev);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

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
            {showActive ? "Show InActive" : "Show Active"}
          </button>

          <NavLink
            to="/AddContract"
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

                  <p>
                    <strong>Start date:</strong>{" "}
                    {c.start_date}
                  </p>

                  <p>
                    <strong>End date:</strong>{" "}
                    {c.end_date}
                  </p>

                  <p>
                    <strong>Validated at:</strong>{" "}
                    {c.validated_at}
                  </p>

                  <p>
                    <strong>State:</strong>{" "}
                    {c.state }
                  </p>

                  <p>
                    <strong>Product type:</strong>{" "}
                    {c.product_type}
                  </p>

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
              className="absolute top-2 right-3 text-white hover:text-red-500"
            >
              ✕
            </button>

            <div className="space-y-2 text-sm">

              <p>
                <strong>Start date:</strong>{" "}
                {selectedContract.start_date}
              </p>

              <p>
                <strong>End date:</strong>{" "}
                {selectedContract.end_date}
              </p>

              <p>
                <strong>Validated at:</strong>{" "}
                {selectedContract.validated_at}
              </p>

              <p>
                <strong>State:</strong>{" "}
                {selectedContract.state}
                  
              </p>

              <p>
                <strong>Product type:</strong>{" "}
                {selectedContract.product_type}
              </p>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}