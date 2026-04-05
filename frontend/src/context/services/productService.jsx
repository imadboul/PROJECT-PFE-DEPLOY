import api from "../../api/axios";

export const getProducts = () =>
  api.get("/catalog/product/");

export const getProductById = () =>
  api.get(`/catalog/product/${id}/`)

export const createProduct = (data) =>
  api.post("/catalog/product/", data);

export const updateProduct = (id, data) => {
  return api.put(`/catalog/product/${id}/`, data);
};

export const getProductTypes = () =>
  api.get("/catalog/productType/");

export const createProductType = (data) =>
  api.post("/catalog/productType/", data);