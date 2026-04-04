import { useState } from "react";

export default function InvoiceList() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const invoices = [
    {
      id: 1,
      number: "INV-001",
      client: "lahlah wassim",
      date: "2026-04-03",
      type: "Petrol",
      quantity: 1000,
      price: 50,
      paid: 50000,
    },
    {
      id: 2,
      number: "INV-002",
      client: "lahlah wassim",
      date: "2026-04-02",
      type: "Gaz",
      quantity: 2000,
      price: 30,
      paid: 60000,
    },
  ];

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-xl font-bold">Invoice</h1>
        </div>

        {invoices.map((inv) => {
          const total = inv.quantity * inv.price;

          const status =
            inv.paid === total ? "Paid" : "Unpaid";

          return (
            <div
              key={inv.id}
              onClick={() => setSelectedInvoice(inv)}
              className="cursor-pointer bg-black/50 text-white shadow-md rounded-2xl p-5 border hover:bg-black/80 transition"
            >
              {/* Header */}
              <div className="flex justify-between mb-2">
                <h2 className="text-lg font-bold">
                  {inv.number}
                </h2>

                <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded text-sm">
                  {inv.type}
                </span>
              </div>

              {/* Client */}
              <p className="text-sm mb-2">
                Client: {inv.client}
              </p>

              {/* Info */}
              <div className="flex justify-between text-sm">
                <p>Quantity: {inv.quantity} kg</p>
                <p>Unit Price: {inv.price} DA</p>
              </div>

              {/* Total */}
              <p className="mt-2 font-bold">
                Total: {total} DA
              </p>

              {/* Status */}
              <p className="text-xs mt-1">
                Status: {status}
              </p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-transparent border border-white text-white p-6 rounded-xl  w-[300px] md:w-[400px] relative">

            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-2 right-3 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4">
              Invoice #{selectedInvoice.number}
            </h2>

            <p><strong>Client:</strong> {selectedInvoice.client}</p>
            <p><strong>Product:</strong> {selectedInvoice.type}</p>
            <p><strong>Quantity:</strong> {selectedInvoice.quantity} kg</p>
            <p><strong>Unit Price:</strong> {selectedInvoice.price} DA</p>

            <p>
              <strong>Total:</strong>{" "}
              {selectedInvoice.quantity * selectedInvoice.price} DA
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedInvoice.paid ===
              selectedInvoice.quantity * selectedInvoice.price
                ? "Paid" : "Unpaid"}
            </p>

            <button className="mt-2 w-full bg-orange-500 py-2 rounded hover:bg-orange-600">
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}