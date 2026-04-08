import api from "../../api/axios";

export const getContracts = () => 
    api.get("/catalog/contract/");

export const getContractById = (id) => {
  return api.get(`/catalog/contract/${id}`);
};

export const createContract = (data) =>
  api.post("/catalog/contract/", data);

export const validateContract = (id) =>
  api.post("/catalog/validateContract/", {
    id,
    state: "validated",
  });

export const rejectContract = (id) =>
  api.post("/catalog/validateContract/", {
    id,
    state: "rejected",
  });
export const getContractPDF = (id) =>
    `${api.defaults.baseURL}/catalog/contractPDF/${id}`;