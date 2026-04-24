import api from "../../api/axios";

export const chargmentOrderAdmin = (data) =>
     api.post("/orders/create/", data);

export const getChargmentOrderAdmin = () =>
     api.get("/orders/filter/");

export const rechargmentOrderAdmin = (data) =>
     api.post(`/orders/rectificative/no_invoiced/`, data);

export const validateOrderAdmin = (id) =>
     api.put("/orders/validated/", {
          ids: [id],
     });