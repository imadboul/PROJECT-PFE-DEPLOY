import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProductTypes, createProduct } from "../context/services/productService";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { NavLink } from "react-router-dom";

function AddProduct() {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);

const unitOptions = [
  { value: "KG", label: "Kilogram" },
  { value: "L", label: "Liter" },
  { value: "HL", label: "Hectoliter" },
  { value: "TM", label: "Tonne" },
];
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const options = productTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));


  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await getProductTypes();
        const data = res.data.data.types || res.data;
        setProductTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        const msg =
          error.response?.data?.error ||
          "Error creating product";

        toast.error(msg);
      }
    };

    fetchProductTypes();
  }, []);


  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        name: data.name,
        description: data.description,
        unit_price: Number(data.unitPrice),
        unit: data.unit.value,
        density: Number(data.density ?? 0),
        product_type: Number(data.productType),
      };

      await createProduct(payload);

      toast.success("Product created successfully");
      reset();

    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Error creating product";
        console.log(error.response?.data);

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white px-4">
      <div className="w-full max-w-xl bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

        {/* Header */}
        <div>
          <button
            className="placeholder-white text-2xl cursor-pointer font-bold hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
            Add Product
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Product Type */}
          <div className="flex items-center gap-6">

            <div className="w-3/4">
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
                        fontSize: "18px",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "rgba(0, 0, 0, 0.66)",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? "rgba(247, 77, 9, 0.96)"
                          : "rgba(0, 0, 0, 0.66)",

                        cursor: "pointer",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#fff",
                      }),

                      placeholder: (base) => ({
                        ...base,
                        color: "#fff",
                      }),
                    }}
                    onChange={(selected) => field.onChange(selected.value)}
                    value={options.find((opt) => opt.value === field.value)}
                  />
                )}
              />

            </div>

            {/* Add Type */}
            <NavLink to="/AddProductType" className="text-orange-400 text-md md:text-xl hover:text-orange-600 transition">
              <i className="fa-solid fa-plus"></i>
            </NavLink>
          </div>
          <div className="relative bottom-5 mb-7">
            {errors.productType && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-lg text-center mt-1">
                {errors.productType.message}
              </p>
            )}
          </div>

          {/* Name */}
          <input
            type="text"
            placeholder="Name"
            {...register("name", { required: "Name is required" })}
            className="w-full text-lg placeholder-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="relative bottom-4 mb-4">
            {errors.name && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-lg text-center mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <textarea
            placeholder="Description"
            {...register("description")}
            className="w-full text-lg placeholder-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {/* Price + Unit */}
          <div className="flex items-center justify-between gap-6">

            {/* Price */}
            <div className="flex-1">
              <input
                type="number"
                placeholder="Unit Price"
                {...register("unitPrice", {
                  required: "Unit price is required",
                  min: { value: 1, message: "Must be > 0" },
                })}
                className="w-full text-xl placeholder-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

            </div>

            {/* Unit */}
            <div className="flex-1">
              <Controller
                className="focus:outline-none focus:ring-2 focus:ring-orange-500"
                name="unit"
                control={control}
                defaultValue={unitOptions[0]}
                rules={{ required: "Unit is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={unitOptions}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "rgba(7, 7, 7, 0.11)",
                        borderColor: state.isFocused ? "#f97316" : "#000",
                        boxShadow: "none",
                        fontSize: "18px",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "rgba(0, 0, 0, 0.66)",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? "rgba(247, 77, 9, 0.96)"
                          : "rgba(0, 0, 0, 0.66)",
                        color: "#fff",
                        cursor: "pointer",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#fff",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#fff",
                      }),
                    }}
                    onChange={(selected) => field.onChange(selected)}
                    value={field.value}
                  />
                )}
              />
            </div>


          </div>
          <div className="relative bottom-5 mb-6">
            {errors.unitPrice && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                {errors.unitPrice.message}
              </p>
            )}
          </div>

          {/* density */}
          <input
            type="number"
            placeholder="density"
            {...register("density", {
              required: "density is required",
              min: {
                value: 0,
                message: "density must be >= 0",
              },
              max: {
                value: 1,
                message: "density must be <= 1",
              },
            })}
            step="0.001"
            className="w-full text-xl placeholder-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="relative bottom-5 mb-6">
            {errors.density && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                {errors.density.message}
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

export default AddProduct;