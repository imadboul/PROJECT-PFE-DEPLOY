import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { getProductTypes, updateProductType, createProductType } from "../context/services/productService";

function EditProductType() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const handleApiErrors = (error) => {
    const errors = error.response?.data.errors;

    if (!errors) return;

    Object.values(errors).forEach((messages) => {
      messages.forEach((msg) => {
        toast.error(msg);
      });
    });
  };
  // Load data if editing
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await getProductTypes();
        const data = res.data.data.types

        const current = data.find((t) => t.id === Number(id));

        if (!current) {
          toast.error("Product type not found");
          return;
        }

        setValue("name", current.name);
        setValue("description", current.description);

      } catch (error) {
        handleApiErrors(error);
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        name: data.name,
        description: data.description,
      };

      if (id) {
        await updateProductType(id, payload);
        toast.success("Updated successfully");
      } else {
        await createProductType(payload);
        toast.success("Created successfully");
        reset();
      }

      navigate("/AddProduct");

    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-lg bg-black/60 p-6 rounded-2xl">

        <h2 className="text-2xl text-center text-orange-500 mb-6">
          {id ? "Edit Product Type" : "Add Product Type"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <input
            type="text"
            placeholder="Name"
            {...register("name", { required: "Name is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.name && (
            <p className="text-red-500 text-xs text-center">
              {errors.name.message}
            </p>
          )}

          <textarea
            placeholder="Description"
            {...register("description", {
              required: "Description is required",
            })}
            className="w-full p-2 border rounded"
          />
          {errors.description && (
            <p className="text-red-500 text-xs text-center">
              {errors.description.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-bold bg-orange-600 cursor-pointer hover:bg-orange-700 rounded placeholder-white"
          >
            {loading ? "Loading..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProductType;