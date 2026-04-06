import api from "../../api/axios";

export const getProducts = () =>
  api.get("/catalog/product/");

export const getProductTypes = () =>
  api.get("/catalog/productType/");

export const createProduct = (data) =>
  api.post("/catalog/product/", data);

export const createProductType = (data) =>
  api.post("/catalog/productType/", data);

export const updateProduct = (id, data) => {
  return api.put(`/catalog/product/${id}/`, data);
};
export const updateProductType = (id, data) => {
  return api.put(`/catalog/productType/${id}/`, data);
};

export const deleteProduct = (id, data) => {
  return api.delete(`/catalog/product/${id}/`, data);
};
export const deleteeProductType = (id, data) => {
  return api.delete(`/catalog/productType/${id}/`, data);
};

