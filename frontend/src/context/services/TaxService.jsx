import api from "../../api/axios";

export const getTaxes = () => 
    api.get("/taxs/filter/tax/");

export const getTaxProducts = () => 
    api.get("/taxs/filter/tax_product/");

export const createTax = (data) => 
    api.post("/taxs/save/", data);