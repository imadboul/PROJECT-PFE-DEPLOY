import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { handleApiErrors } from "../utils/handleApiErrors";
import { getInvoices, getInvoicePDF } from "../context/services/invoiceService";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showValid, setShowValid] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getInvoices();
      setInvoices(res.data.data.results || []);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const viewPDF = async (id) => {
    try {
      const res = await getInvoicePDF(id);
      const file = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const filtered = invoices.filter((inv) =>
    showValid ? inv.states === "validated" : inv.states === "pending"
  );

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        {/* Header */}
        <h1 className="text-white text-xl font-bold">Invoices</h1>

        <div className="flex justify-between items-center">

          <button
            onClick={() => setShowValid(v => !v)}
            className="border border-white text-white cursor-pointer px-4 py-2 rounded hover:bg-white/10 text-sm"
          >
            {showValid ? "Show Pending" : "Show Validated"}
          </button>

          <NavLink
            to="/ValidateInvoice"
            className="border border-orange-500 text-orange-400 cursor-pointer px-4 py-2 rounded hover:bg-orange-500/10 text-sm"
          >
            <i className="fa-solid fa-check mr-1"></i> Validate
          </NavLink>
        </div>

        {/* List */}
        {filtered.length === 0 && (
          <p className="text-white/50 text-center mt-8">No invoices found.</p>
        )}

        {filtered.map((inv) => (
          <div
            key={inv.id}
            onClick={() => setSelectedInvoice(inv)}
            className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Invoice {inv.id}</p>
                <span className={inv.states === "validated" ? "text-green-500 text-xs" : "text-orange-400 text-xs"}>
                  {inv.states}
                </span>
              </div>
              <p className="text-lg font-semibold">Client: {inv.client_firstName} {inv.client_lastName}</p>
              <div className="md:flex justify-between">
                <p><strong>Type:</strong> {inv.type}</p>
                <p><strong>Date:</strong> {inv.date_de_facteration
                  ? new Date(inv.date_de_facteration).toISOString().split("T")[0]
                  : "—"}
                </p>
              </div>

              <div className="md:flex justify-between text-orange-300">
                <p><strong className="text-white">HT:</strong> {inv.HT} DA</p>
                <p><strong className="text-white">TVA:</strong> {inv.TVA} DA</p>
                <p><strong className="text-white">TTC:</strong> {inv.TTC} DA</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white text-white p-6 rounded-xl w-[400px] relative max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-2 right-3 cursor-pointer text-white hover:text-red-500"
            >✕</button>

            <div className="space-y-2 text-sm">
              <p className="text-lg font-bold">Invoice {selectedInvoice.id}</p>
              <p className="text-lg font-semibold">Client: {selectedInvoice.client_firstName} {selectedInvoice.client_lastName}</p>
              <p><strong>Type:</strong> {selectedInvoice.type}</p>

              <p className={selectedInvoice.states === "valid" ? "text-green-500" : "text-orange-400"}>
                <strong className="text-white">State:</strong> {selectedInvoice.states}
              </p>

              <p><strong>Date:</strong> {selectedInvoice.date_de_facteration
                ? new Date(selectedInvoice.date_de_facteration).toISOString().split("T")[0]
                : "—"}
              </p>

              {selectedInvoice.validated_by && (
                <p><strong>Validated by:</strong> {selectedInvoice.validated_by}</p>
              )}

              {/* Totals */}
              <div className="bg-white/5 rounded-lg p-3 space-y-1 mt-2">
                <p><strong>HT:</strong> {selectedInvoice.HT} DA</p>
                <p><strong>TVA:</strong> {selectedInvoice.TVA} DA</p>
                <p className="text-orange-400 font-bold text-base">
                  <strong className="text-white">TTC:</strong> {selectedInvoice.TTC} DA
                </p>
              </div>

              {/* Invoice Lines */}
              {selectedInvoice.invoice_InvoiceLine_items?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Lines</p>
                  {selectedInvoice.invoice_InvoiceLine_items.map((line) => (
                    <div key={line.id} className="bg-white/5 rounded-lg p-2 mb-2 text-xs space-y-1">
                      <p><strong>Product:</strong> {line.product}</p>
                      <p><strong>Tax:</strong> {line.tax_name}</p>
                      <div className="flex justify-between">
                        <p><strong>Qte:</strong> {line.qte} {line.unit}</p>
                        <p><strong>Tax Price:</strong> {line.tax_price} DA</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PDF Button */}
              {selectedInvoice.states === "valid" && (
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => viewPDF(selectedInvoice.id)}
                    className="text-orange-400 text-3xl hover:text-orange-500"
                  >
                    <i className="fa-solid fa-file-pdf"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
