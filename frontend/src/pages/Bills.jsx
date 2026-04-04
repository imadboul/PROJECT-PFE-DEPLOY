import { useState } from "react";

export default function BillsList() {
  const [selectedBill, setSelectedBill] = useState(null);

  const bills = [
    {
      id: 1,
      product: "Petrol",
      quantity: 1000,
      price: 500,
    },
    {
      id: 2,
      product: "Gaz",
      quantity: 2000,
      price: 200,
    },
    {
      id: 3,
      product: "Gaz",
      quantity: 1500,
      price: 200,
    },
  ];

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Bills</h1>
        </div>
        <div className="flex justify-between items-center">
          {/* Invoice Button */}
          <button className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 mb-4 self-start cursor-pointer">
            Request Invoice
          </button>

          {/* Bill Button */}
          <button className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 mb-4 self-end cursor-pointer">
            Request Bill
          </button>
        </div>

        {/* Cards */}
        {bills.map((b) => {
          const total = b.quantity * b.price;

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBill(b)}
              className="cursor-pointer bg-black/50 text-white shadow-md rounded-2xl p-5
               border hover:bg-black/80 transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">Product: {b.product}</h2>

                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">
                  Bill
                </span>
              </div>

              {/* Values */}
              <div className="mt-3 text-sm flex justify-between">
                <p>Quantity: {b.quantity} kg</p>
                <p>Price: {b.price} DA</p>
              </div>

              <div className="mt-2 text-sm">
                <p>Total: {total} DA</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-transparent border border-white text-white p-6 rounded-xl  w-[300px] md:w-[400px] relative">
            {/* Close */}
            <button
              onClick={() => setSelectedBill(null)}
              className="absolute top-2 right-3 text-white hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4">
              Product: {selectedBill.product}
            </h2>

            <p>
              <strong>Quantity:</strong> {selectedBill.quantity} kg
            </p>
            <p>
              <strong>Price:</strong> {selectedBill.price} DA
            </p>
            <p>
              <strong>Total:</strong>{" "}
              {selectedBill.quantity * selectedBill.price} DA
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
