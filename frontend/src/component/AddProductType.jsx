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

  const handleApiErrors = (error) => {
      const errors = error.response?.data.errors;
  
      if (!errors) return;
  
      Object.values(errors).forEach((messages) => {
        messages.forEach((msg) => {
          toast.error(msg);
        });
      });
    };

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
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white">
      <div className="w-full max-w-lg bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

        <div>
          <button
            className="placeholder-white text-2xl cursor-pointer font-bold hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
            Add Product Type
          </h2>
        </div>

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
            className="w-full py-2 font-bold bg-orange-600 cursor-pointer hover:bg-orange-700 rounded placeholder-white"
          >
            {loading ? "Loading..." : "Create Product"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddTypeProduct;