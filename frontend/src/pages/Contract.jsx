import { useState } from "react";

export default function ContractsList() {
  const [showActive, setShowActive] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);

  const contracts = [
    {
      id: 1,
      number: "C-1023",
      type: "Petrol",
      Qtetotal: 1000,
      Qteremaining: 400,
      isActive: true,
    },
    {
      id: 2,
      number: "C-2045",
      type: "Gaz",
      Qtetotal: 2000,
      Qteremaining: 1500,
      isActive: true,
    },
    {
      id: 3,
      number: "C-3067",
      type: "Gaz",
      Qtetotal: 2400,
      Qteremaining: 1000,
      isActive: false,
    },
  ];

  function changeStatus() {
    setShowActive(!showActive);
  }

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">
         {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Contracts</h1>
        </div>

        {/* Toggle Button */}
        <div className="flex justify-between items-center">
          <button
          onClick={changeStatus}
          className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 mb-4 self-end cursor-pointer"
        >
          {showActive ? "Show InActive" : "Show Active"}
        </button>
        <button className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 mb-4 self-start cursor-pointer">
          request new contract
        </button>
        </div>
        
        

        {/* Cards */}
        {contracts.map((c) => {
          if (showActive ? c.isActive : !c.isActive) {
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
          }
          return null;
        })}
      </div>

      {/* Modal Details */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-transparent border border-white text-white p-6 rounded-xl w-[300px] md:w-[400px] relative">

            {/* Close button */}
            <button
              onClick={() => setSelectedContract(null)}
              className="absolute top-2 right-3 text-gray-600 text-white hover:text-red-500 cursor-pointer text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4">
              Contract #{selectedContract.number}
            </h2>

            <p className="font-bold"><strong>Type:</strong> {selectedContract.type}</p>
            <p className="font-bold"><strong>Total:</strong> {selectedContract.Qtetotal}</p>
            <p className="font-bold"><strong>Remaining:</strong> {selectedContract.Qteremaining}</p>
            <p className="font-bold">
              <strong>Status:</strong>{" "}
              {selectedContract.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}