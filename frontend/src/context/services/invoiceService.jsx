import api from "../../api/axios";

export const getInvoices = () =>
    api.get("/invoices/filter/");

export const getInvoiceData = () =>
    api.get("/invoices/invoicedata/");

export const getInvoicePDF = (id) =>
    api.get(`/invoices/invoicePDF/${id}/`, { responseType: "blob" });

export const validateInvoices = (type, data) =>
    api.put(`/invoices/validate/${type}/`, data);

export const validateInvoicesById = (id) =>
  api.put("/invoices/validate/v_id/", {
    ids: [id],
  });