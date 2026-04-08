import api from "../../api/axios";

export const getBalances = () => 
    api.get("/finance/balance/");

export const getPayments = () => 
    api.get("/finance/payments/");

export const getPaymentById = (id) => {
  return api.get(`/finance/payments/${id}`);
};

export const createPayment = (data) =>
    api.post("/finance/payments/",data)
    
export const validatePayment = (id) =>
  api.post("/finance/validatePayment/", {
    id,
    state: "validated",
  });

export const rejectPayment = (id) =>
  api.post("/finance/validatePayment/", {
    id,
    state: "rejected",
  });