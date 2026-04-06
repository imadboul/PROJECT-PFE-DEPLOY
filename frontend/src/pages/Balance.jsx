import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getBalances } from "../context/services/BalanceService";
import { getProductTypes } from "../context/services/productService";
import toast from "react-hot-toast";

export default function BalanceList() {
  const [selectedSold, setSelectedSold] = useState(null);
  const [balances, setBalances] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resB = await getBalances();
        const resP = await getProductTypes();

        setBalances(resB.data.balances || []);
        setProductTypes(resP.data.types || []);

      } catch (err) {
        console.log(err);
        toast.error("Error fetching data");
      }
    };

    fetchData();
  }, []);

  // Get product type name from id
  const getProductName = (id) => {
    const type = productTypes.find(p => p.id === id);
    return type ? type.name : id;
  };

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Balance</h1>
        </div>

        <NavLink
          to="/RequestPayment"
          className="border border-white flex w-1/4 text-white px-4 py-2 rounded hover:bg-white/10 mb-4 cursor-pointer"
        >
          Request new Payment
        </NavLink>

        {/* Cards */}
        {balances.map((b) => {
          const amount = Number(b.amount);

          return (
            <div
              key={b.id}
              onClick={() => setSelectedSold(b)}
              className="cursor-pointer bg-black/50 text-white shadow-md rounded-2xl p-5 border hover:bg-black/80 transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">
                  Product Type: {getProductName(b.productType)}
                </h2>

                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                  Balance
                </span>
              </div>

              {/* Values */}
              <div className="mt-3 text-sm flex justify-between">
                <p>Client ID: {b.client}</p>
                <p>Amount: {amount} DA</p>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedSold && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-transparent border border-white text-white p-6 rounded-xl w-[300px] md:w-[400px] relative">

            {/* Close */}
            <button
              onClick={() => setSelectedSold(null)}
              className="absolute top-2 right-3 text-white hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4">
              Product Type: {getProductName(selectedSold.productType)}
            </h2>

            <p><strong>Client ID:</strong> {selectedSold.client}</p>
            <p><strong>Amount:</strong> {selectedSold.amount} DA</p>
          </div>
        </div>
      )}
    </div>
  );
}