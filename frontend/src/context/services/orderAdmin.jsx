import api from "../../api/axios";

export const chargmentOrderAdmin = (data) =>
     api.post("/orders/create/", data);

export const getChargmentOrderAdmin = () =>
     api.get("/orders/create/");

export const rechargmentOrderAdmin = (data) =>
     api.post(`/orders/rectificative/`,data);

export const getRechargmentOrderAdmin = (id) =>
     api.get(`/orders/rectificative/`);

export const validateOrder = (id, pickup_date) =>
  api.put("/orderclient/validateorder/", {
    id,
    state: "validated",
  });