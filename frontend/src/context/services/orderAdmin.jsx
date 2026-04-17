import api from "../../api/axios";

export const chargmentOrderAdmin = (data) =>
     api.post("/orders/create/", data,{
        id,
        state: "loading",
     });

export const getChargmentOrderAdmin = () =>
     api.get("/orders/create/");

export const rechargmentOrderAdmin = (data) =>
     api.post(`/orders/rectificative/`,data,{
        id,
        state: "validated",
     });

export const getRechargmentOrderAdmin = (id) =>
     api.get(`/orders/rectificative/`);

export const validateOrder = (id, pickup_date) =>
  api.put("/orderclient/validateorder/", {
    id,
    state: "validated",
  });