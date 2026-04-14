import api from "../../api/axios";

export const getBill = () =>
  api.get("/orderclient/clients/");

export const createOrder = (data) =>
     api.post("/orderclient/order/", data);

export const getOrders = () =>
     api.get("/orderclient/order/");

export const getOrderById = (id) =>
     api.get(`/orderclient/order/${id}`);

export const validateOrder = (id) =>
  api.post("/orderclient/validateorder/", {
    id,
    state: "validated",
  });

export const rejectOrder = (id) =>
  api.post("/orderclient/validateorder/", {
    id,
    state: "rejected",
  });

export const getContractPDF = (id) => {
  return api.get(`/orderclient/orderPDF/${id}`, {
    responseType: "blob",
  });
};
