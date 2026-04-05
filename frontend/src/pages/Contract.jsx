import { useEffect, useState } from "react";
import { getContracts } from "../context/services/contractService";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";

export default function ContractsList() {
  const [contracts, setContracts] = useState([]);
  const [showActive, setShowActive] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetch data from backend
  useEffect(() => {
    fetchContracts();
  }, []);


  // fetch contracts from backend
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await getContracts();
      setContracts(res.data.contracts || res.data);
    } catch (err) {
      setError("Failed to load contracts");
      toast.error(error || "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  function changeStatus() {
    setShowActive(!showActive);
  }

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
            className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 mb-4 cursor-pointer">
            Request new contract
          </NavLink>
        </div>

        {/* Cards */}
        {contracts
          .filter((c) => (showActive ? c.isActive : !c.isActive))
          .map((c) => {
            const used = c.Qtetotal - c.Qteremaining;
            const percentage = (used / c.Qtetotal) * 100;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedContract(c)}
                className="cursor-pointer bg-black/50 text-white shadow-md rounded-2xl p-5 border hover:bg-black/80 transition"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold">
                    Contract #{c.number}
                  </h2>

                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">
                    {c.type}
                  </span>
                </div>

                {/* Quantities */}
                <div className="mt-3 text-sm flex justify-between">
                  <p>Total: {c.Qtetotal}</p>
                  <p>Remaining: {c.Qteremaining}</p>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className="bg-orange-500 h-2 rounded"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 text-right">
                    {Math.round(percentage)}% used
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-transparent border border-white text-white p-6 rounded-xl w-[300px] md:w-[400px] relative">

            <button
              onClick={() => setSelectedContract(null)}
              className="absolute top-2 right-3 text-white hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4">
              Contract #{selectedContract.number}
            </h2>

            <p><strong>Type:</strong> {selectedContract.type}</p>
            <p><strong>Total:</strong> {selectedContract.Qtetotal}</p>
            <p><strong>Remaining:</strong> {selectedContract.Qteremaining}</p>
            <p>
              <strong>Status:</strong>{" "}
              {selectedContract.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}