import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProductTypes } from "../context/services/productService";
import { createContract } from "../context/services/contractService";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

function RequestContract() {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const options = productTypes.map(type => ({
    value: type.id,
    label: type.name
  }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  // fetch product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await getProductTypes();
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
      if (start.getTime() >= end.getTime()) {
        toast.error("start date must be before end date");
        return;
      }

      const payload = {
        product_type: data.productType,
        qte_global: Number(data.qteGlobale),
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      };

      await createContract(payload);

      toast.success("Contract created successfully");
      navigate("/Contracts");

    } catch (err) {
      console.log(err);

      if (err.response && err.response.data) {
        console.log("BACKEND ERROR:", err.response.data);

        // عرض الخطأ كامل
        toast.error(JSON.stringify(err.response.data));

      } else {
        toast.error("Something went wrong");
      }} finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">

        <div className="w-full  max-w-xl bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

          <button
            className="placeholder-white text-2xl text-white font-bold hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
            Request Contract
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">

            {/* Product Type */}
            <Controller
              name="productType"
              control={control}
              rules={{ required: "Product type is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={options}
                  placeholder="Select Product Type"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: "rgba(7, 7, 7, 0.11)",
                      borderColor: state.isFocused ? "#f97316" : "#000",
                      boxShadow: "none",
                      fontSize: "20px",
                      "&:hover": {
                        border: "1px solid #f97316"
                      }
                    }),

                    menu: (base) => ({
                      ...base,
                      backgroundColor: "rgba(0, 0, 0, 0.66)"
                    }),

                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? "rgba(247, 77, 9, 0.96)"
                        : "rgba(0, 0, 0, 0.66)",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "20px",
                      fontWeight: "400",
                      border: "1px solid #000",
                      "&:active": {
                        backgroundColor: "#f97316"
                      }
                    }),

                    singleValue: (base) => ({
                      ...base,
                      color: "#fff",
                    }),

                    placeholder: (base) => ({
                      ...base,
                      color: "#fff",

                    })
                  }}
                  onChange={(selected) => field.onChange(selected.value)}
                  value={options.find(opt => opt.value === field.value)}
                />
              )}
            />
            <div className="relative bottom-4 mb-8">
              {errors.productType && (
                <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                  {errors.productType.message}
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

            <div className="relative bottom-4">
              {errors.qteGlobale && (
                <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
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
            <div className="relative bottom-4">
              {errors.startDate && (
                <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
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
            <div className="relative bottom-4">
              {errors.endDate && (
                <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
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