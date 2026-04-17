import toast from "react-hot-toast";

export const handleApiErrors = (error) => {
  const data = error.response?.data;

  if (!data) return;

  const errors = data.errors || data;

  Object.values(errors).flat().forEach((msg) => {
    toast.error(msg);
  });
};