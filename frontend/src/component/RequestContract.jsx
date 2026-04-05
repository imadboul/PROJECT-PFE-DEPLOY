import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProductTypes } from "../context/services/productService";
import { createContract } from "../context/services/contractService";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

function RequestContract() {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // fetch product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await getProductTypes("/catalog/productType/");
        const data = res.data.types || res.data;
        setProductTypes(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Error fetching product types", err);
      }
    };

    fetchProductTypes();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (isNaN(start) || isNaN(end)) {
        toast.error("Invalid date format");
        return;
      }

      const payload = {
        product_type: Number(data.typeProduct),
        qte_global: Number(data.qteGlobale),
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      };

      await createContract(payload);

      toast.success("Contract created successfully");
      navigate("/Contracts");

    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "Failed to create contract";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">

      <div className="w-full  max-w-xl bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

        <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
          Request Contract
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">

          {/* Product Type */}
            <select
              {...register("typeProduct", { required: "Product type is required" })}
              className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:text-black"
            >
              <option value="">Select Product Type</option>

              {productTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <div className="relative bottom-3">
            {errors.typeProduct && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {errors.typeProduct.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          
            <input
              type="number"
              placeholder="Quantity by L"
              {...register("qteGlobale", {
                required: "Quantity is required",
                min: { value: 1, message: "Quantity must be greater than 0" }
              })}
              className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
             
            <div className="relative bottom-3">
            {errors.qteGlobale && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {errors.qteGlobale.message}
              </p>
            )}
            </div>
          

          {/* Start Date */}

            <input
              type="date"
              {...register("startDate", {
                required: "Start date is required"
              })}
              className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="relative bottom-3">          
            {errors.startDate && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {errors.startDate.message}
              </p>
            )}
           </div>

          {/* End Date */}
          
            <input
              type="date"
              {...register("endDate", {
                required: "End date is required"
              })}
              className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
             <div className="relative bottom-3"> 
            {errors.endDate && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {errors.endDate.message}
              </p>
            )}
           </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-2 rounded-lg text-white transition
            ${loading
                ? "bg-gray-500 cursor-not-allowed"
                : "font-bold bg-orange-600 hover:bg-orange-700 rounded text-white"
              }`}
          >
            {loading ? "Loading..." : "Request Contract"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default RequestContract;