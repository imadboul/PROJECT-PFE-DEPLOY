import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { createProductType } from "../context/services/productService";

function AddTypeProduct() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        name: data.name,
        description: data.description,
      };

      await createProductType(payload);

      toast.success("Product type created successfully");

      reset();

    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "Error creating product type";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white">
      <div className="w-full max-w-lg bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

        <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
          Add Product Type
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Name */}
          <input
            type="text"
            placeholder="Type Name"
            {...register("name", {
              required: "Name is required",
            })}
            className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <div className="relative bottom-3">
            {errors.name && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <textarea
            placeholder="Description"
            {...register("description", {
              required: "Description is required",
            })}
            className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <div className="relative bottom-3">
            {errors.description && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-2 rounded-lg text-white transition
            ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "font-bold bg-orange-600 hover:bg-orange-700 rounded text-white"
            }`}
          >
            {loading ? "Loading..." : "Create Type"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddTypeProduct;