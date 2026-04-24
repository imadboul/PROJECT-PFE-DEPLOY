import api from "../../api/axios";

export const getInvoices = (params = {}) =>
  api.get("/invoices/filter/", { params });

export const getInvoiceData = () =>
  api.get("/invoices/invoicedata/");

export const getInvoicePDF = (id) =>
  api.get(`/invoices/invoicePDF/${id}/`, { responseType: "blob" });

export const validateInvoices = (type, data) =>
  api.put(`/invoices/validate/${type}/`, data);

export const createNewInvoice = (ids, contractId,invoiceId) =>
  api.post("/invoices/invoicedorinvoice/new_invoice/", {
    ids,
    contract: contractId,
    invoice_id: invoiceId,
  });

export const invoiceOrders = (ids, contractId,invoiceId) =>
  api.post("/invoices/invoicedorinvoice/invoiced/", {
    ids,
    contract: contractId,
    invoice_id: invoiceId,
  });