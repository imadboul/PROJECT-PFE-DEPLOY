import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { handleApiErrors } from "../utils/handleApiErrors";
import {
  getInvoices,
  getInvoicePDF,
  createNewInvoice,
  invoiceOrders,
  getOrders
} from "../context/services/invoiceService";

import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showValid, setShowValid] = useState(true);
  const [page, setPage] = useState(1);
  const { user } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [actionType, setActionType] = useState(null);

  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0
  });

  const fetchInvoices = async (pageNum = 1) => {
    try {
      setLoading(true);

      const res = await getInvoices({
        page: pageNum,
        states: showValid ? "validated" : "pending"
      });

      const data = res.data.data;

      setInvoices(data.results || []);

      setPagination({
        next: data.next,
        previous: data.previous,
        count: data.count
      });

      setPage(pageNum);

    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchInvoices(1);
  }, [showValid]);

  const handleSelectInvoice = async (invoice) => {
    setSelectedInvoice(invoice);

    if (invoice.states === "pending") {
      setOrders(invoice.invoice_order_items || []);
      setSelectedOrderIds([]);
    }
  };
  const toggleOrderSelection = (orderId) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleCreateNewInvoice = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error("Please select at least one order");
      return;
    }

    try {
      setLoading(true);
      await createNewInvoice(
        selectedOrderIds,
        selectedInvoice.contract.id,
        selectedInvoice.id
      );
      toast.success("New invoice created successfully");
      fetchInvoices();
      setSelectedInvoice(null);
      setSelectedOrderIds([]);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceOrders = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error("Please select at least one order");
      return;
    }

    try {
      setLoading(true);
      await invoiceOrders(
        selectedOrderIds,
        selectedInvoice.contract.id,
        selectedInvoice.id
      );
      toast.success("Orders invoiced successfully");
      fetchInvoices();
      setSelectedInvoice(null);
      setSelectedOrderIds([]);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-4xl flex flex-col gap-4">

        {/* Header */}
        <h1 className="text-white text-xl font-bold">Invoices</h1>

        <div className="flex self-end gap-2">
          <button
            onClick={() => setShowValid(v => !v)}
            className="border border-white text-white cursor-pointer px-4 py-2 rounded hover:bg-white/10 text-sm"
          >
            {showValid ? "📋 Pending" : "✅ Validated"}
          </button>
        </div>

        {/* List */}
        {invoices.length === 0 && (
          <p className="text-white/50 text-center mt-8">No invoices found.</p>
        )}

        {invoices.map((inv) => (
          <div
            key={inv.id}
            onClick={() => handleSelectInvoice(inv)}
            className={`cursor-pointer bg-black/50 text-white rounded-2xl p-5 border transition
              ${inv.states === "validated"
                ? "border-green-500/30 hover:bg-green-500/10"
                : "border-orange-500/30 hover:bg-orange-500/10"
              }`}
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Invoice #{inv.id}</p>
                <span className={`text-xs px-2 py-1 rounded ${inv.states === "validated"
                  ? "bg-green-500/30 text-green-300"
                  : "bg-orange-500/30 text-orange-300"
                  }`}>
                  {inv.states === "validated" ? "✓ Validated" : "⏳ Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p><strong>Client:</strong> {inv.client_firstName} {inv.client_lastName}</p>
                <p><strong>Contract:</strong> {inv.contract?.id}</p>
              </div>
              <div className="flex items-center justify-between">
                <p><strong>Type:</strong> {inv.type}</p>
                <p><strong>Date:</strong> {inv.date_de_facteration
                  ? new Date(inv.date_de_facteration).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })
                  : "—"}
                </p>
              </div>
              <div className="flex justify-between text-orange-300 mt-2">
                <p><strong className="text-white">HT:</strong> {parseFloat(inv.HT).toFixed(2)} DA</p>
                <p><strong className="text-white">TVA:</strong> {parseFloat(inv.TVA).toFixed(2)} DA</p>
                <p><strong className="text-white">TTC:</strong> {parseFloat(inv.TTC).toFixed(2)} DA</p>
              </div>
            </div>
          </div>
        ))}

        {invoices.length > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => fetchInvoices(page - 1)}
              disabled={!pagination.previous}
              className="px-4 py-2 bg-white/10 text-white rounded disabled:opacity-50"
            >
              ← Previous
            </button>

            <span className="px-4 py-2 text-white">
              Page {page}
            </span>

            <button
              onClick={() => fetchInvoices(page + 1)}
              disabled={!pagination.next}
              className="px-4 py-2 bg-white/10 text-white rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white text-white p-6 rounded-xl w-[500px] relative max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => {
                setSelectedInvoice(null);
                setSelectedOrderIds([]);
              }}
              className="absolute top-2 right-3 cursor-pointer text-2xl text-white hover:text-red-500"
            >
              ✕
            </button>

            <div className="space-y-3 text-sm">
              <p className="text-lg font-bold">Invoice #{selectedInvoice.id}</p>

              <div className="bg-white/5 p-3 rounded">
                <p><strong>Client:</strong> {selectedInvoice.client_firstName} {selectedInvoice.client_lastName}</p>
                <p><strong>Type:</strong> {selectedInvoice.type}</p>
                <p className={selectedInvoice.states === "validated" ? "text-green-400" : "text-orange-400"}>
                  <strong>Status:</strong> {selectedInvoice.states === "validated" ? "Validated" : "Pending"}
                </p>
                {selectedInvoice.validated_by && (
                  <p><strong>Validated by:</strong> {selectedInvoice.validated_by}</p>
                )}
              </div>

              {/* Totals */}
              <div className="bg-orange-500/10 rounded-lg p-3 space-y-1 border border-orange-500/30">
                <p><strong>HT:</strong> {parseFloat(selectedInvoice.HT).toFixed(2)} DA</p>
                <p><strong>TVA:</strong> {parseFloat(selectedInvoice.TVA).toFixed(2)} DA</p>
                <p className="text-orange-400 font-bold text-base">
                  <strong className="text-white">TTC:</strong> {parseFloat(selectedInvoice.TTC).toFixed(2)} DA
                </p>
              </div>

              {/* Invoice Lines */}
              {selectedInvoice.invoice_InvoiceLine_items?.length > 0 && (
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wide mb-2">📦 Items</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedInvoice.invoice_InvoiceLine_items.map((line) => (
                      <div key={line.id} className="bg-white/5 rounded p-2 text-xs">
                        <p><strong>{line.product}</strong></p>
                        <div className="grid grid-cols-2 gap-1 mt-1 text-white/70">
                          <p>Qty: {line.qte} {line.unit}</p>
                          <p>Tax: {line.tax_name}</p>
                          <p>Price: {line.tax_price} DA</p>
                          <p>TVA: {line.Tva} DA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section - NEW */}
              {selectedInvoice.states === "pending" && (
                ["admin", "superAdmin"].includes(user?.role) && (
                  <div className="mt-4 border-t border-white/20 pt-4">
                    <p className="text-xs text-white/50 uppercase tracking-wide mb-3">
                      📦 Orders ({selectedOrderIds.length}/{orders.length})
                    </p>

                    {loadingOrders ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : orders.length === 0 ? (
                      <p className="text-center text-white/50 py-4">No available orders</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            onClick={() => toggleOrderSelection(order.id)}
                            className={`p-3 rounded-lg cursor-pointer border-2 transition ${selectedOrderIds.includes(order.id)
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-white/20 bg-white/5 hover:border-orange-500/50"
                              }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">Order #{order.id}</p>
                                {order.client_name && (
                                  <p className="text-xs text-white/70 mt-1">{order.client_name}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-orange-400 font-bold">
                                  {order.amount ? parseFloat(order.amount).toFixed(2) : "0.00"} DA
                                </p>
                                {selectedOrderIds.includes(order.id) && (
                                  <p className="text-xs text-orange-400 mt-1">✓ Selected</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Summary */}
                    {orders.length > 0 && (
                      <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <p className="text-sm">
                          <strong>Selected Orders:</strong>{" "}
                          <span className="text-orange-400 font-bold">{selectedOrderIds.length}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {selectedInvoice.states === "pending" && (
                  ["admin", "superAdmin"].includes(user?.role) && (
                    <>
                      <button
                        onClick={handleInvoiceOrders}
                        disabled={loading || selectedOrderIds.length === 0}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm font-bold transition"
                      >
                        ✓ Invoiced ({selectedOrderIds.length})
                      </button>
                      <button
                        onClick={handleCreateNewInvoice}
                        disabled={loading || selectedOrderIds.length === 0}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm font-bold transition"
                      >
                        + New ({selectedOrderIds.length})
                      </button>
                    </>
                  )
                )}

                {selectedInvoice.states === "validated" && (
                  <button
                    onClick={() => viewPDF(selectedInvoice.id)}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm font-bold transition"
                  >
                    📄 Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
