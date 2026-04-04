import { useState } from "react";

export default function SoldList() {
  const [selectedSold, setSelectedSold] = useState(null);

  const sales = [
    {
      id: 1,
      product: "Petrol",
      totalSold: 1000,
      paid: 600,
    },
    {
      id: 2,
      product: "Gaz",
      totalSold: 2000,
      paid: 1200,
    },
    {
      id: 3,
      product: "Gaz",
      totalSold: 1500,
      paid: 300,
    },
  ];

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Sales</h1>
        </div>

        {/* Cards */}
        {sales.map((s) => {
          const remaining = s.totalSold - s.paid;
          const percentage = (s.paid / s.totalSold) * 100;

          return (
            <div
              key={s.id}
              onClick={() => setSelectedSold(s)}
              className="cursor-pointer bg-black/50 text-white shadow-md rounded-2xl p-5
               border hover:bg-black/80 transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">
                  Product: {s.product}
                </h2>

                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                  Sold
                </span>
              </div>

              {/* Values */}
              <div className="mt-3 text-sm flex justify-between">
                <p>Total Sold: {s.totalSold} DA</p>
                <p>Paid: {s.paid} DA</p>
              </div>

              <div className="mt-2 text-sm">
                <p>Remaining Payment: {remaining} DA</p>
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
                  {Math.round(percentage)}% paid
                </p>
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
              Product: {selectedSold.product}
            </h2>

            <p><strong>Total Sold:</strong> {selectedSold.totalSold} DA</p>
            <p><strong>Paid:</strong> {selectedSold.paid} DA</p>
            <p>
              <strong>Remaining:</strong>{" "}
              {selectedSold.totalSold - selectedSold.paid} DA
            </p>

            {/* Payment Button */}
            <button className="mt-4 w-full cursor-pointer bg-orange-500 py-2 rounded hover:bg-orange-600">
              Request Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}