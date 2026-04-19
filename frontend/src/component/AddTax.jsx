import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import Select from "react-select";
import { NavLink } from "react-router-dom";
import { createTax } from "../context/services/taxService";
import { getProducts } from "../context/services/productService";
import { handleApiErrors } from "../utils/handleApiErrors";


const unitOptions = [
  { value: "KG", label: "Kilogram" },
  { value: "L",  label: "Liter"    },
  { value: "HL", label: "Hectoliter" },
  { value: "TM", label: "Tonne"    },
  { value: "PR", label: "Per Unit" },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(7,7,7,0.11)",
    borderColor: state.isFocused ? "#f97316" : "#000",
    boxShadow: "none",
    fontSize: "16px",
  }),
  menu:   (base) => ({ ...base, backgroundColor: "rgba(0,0,0,0.88)" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(247,77,9,0.96)" : "rgba(0,0,0,0.66)",
    color: "#fff",
    cursor: "pointer",
  }),
  singleValue: (base) => ({ ...base, color: "#fff" }),
  placeholder: (base) => ({ ...base, color: "rgba(255,255,255,0.6)" }),
};

export default function AddTax() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      tax_taxProduct_items: [{ product: null, unit: unitOptions[0], par_unit: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tax_taxProduct_items",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
         const res = await getProducts();
         setProducts(res.data.data.products);
        setProducts(mockProducts);
      } catch {
        toast.error("Failed to load products");
      }
    };
    fetch();
  }, []);

  const productOptions = products.map((p) => ({ value: p.id, label: p.name }));

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        name: data.name,
        tax_taxProduct_items: data.tax_taxProduct_items.map((item) => ({
          product:  item.product?.value ?? item.product,
          unit:     item.unit?.value    ?? item.unit,
          par_unit: String(item.par_unit),
        })),
      };
      console.log("payload →", payload);
      await createTax(payload);
      toast.success("Tax saved successfully");
      reset();
    } catch (error) {
      handleApiErrors(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white px-4 py-8">
      <div className="w-full max-w-xl bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

        <div className="mb-6">
          <button
            className="text-white text-2xl cursor-pointer font-bold hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-2xl font-bold text-center text-orange-500">Add Tax</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <input
            type="text"
            placeholder="Tax Name"
            {...register("name", { required: "Tax name is required" })}
            className="w-full text-lg placeholder-white/60 p-2 border border-black rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm text-center -mt-2">{errors.name.message}</p>
          )}

          <textarea
            placeholder="Description (optional)"
            rows={2}
            {...register("description")}
            className="w-full text-lg placeholder-white/60 p-2 border border-black rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-white/70 font-semibold uppercase tracking-wide">Products</p>
              <button
                type="button"
                onClick={() => append({ product: null, unit: unitOptions[0], par_unit: "" })}
                className="text-orange-400 hover:text-orange-500 text-xl cursor-pointer"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="bg-black/40 rounded-xl p-4 border border-white/10 space-y-3">

                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Product {index + 1}</span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-600 cursor-pointer text-sm"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </div>

                <Controller
                  name={`tax_taxProduct_items.${index}.product`}
                  control={control}
                  rules={{ required: "Product is required" }}
                  render={({ field: f }) => (
                    <Select
                      {...f}
                      options={productOptions}
                      placeholder="Select Product"
                      styles={selectStyles}
                    />
                  )}
                />
                {errors.tax_taxProduct_items?.[index]?.product && (
                  <p className="text-red-500 text-sm">{errors.tax_taxProduct_items[index].product.message}</p>
                )}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Controller
                      name={`tax_taxProduct_items.${index}.unit`}
                      control={control}
                      rules={{ required: "Unit is required" }}
                      render={({ field: f }) => (
                        <Select
                          {...f}
                          options={unitOptions}
                          placeholder="Unit"
                          styles={selectStyles}
                        />
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Par Unit"
                      {...register(`tax_taxProduct_items.${index}.par_unit`, {
                        required: "Required",
                        min: { value: 0, message: ">= 0" },
                      })}
                      className="w-full text-md placeholder-white/60 p-2 border border-black rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {errors.tax_taxProduct_items?.[index]?.par_unit && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.tax_taxProduct_items[index].par_unit.message}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-bold bg-orange-600 cursor-pointer hover:bg-orange-700 rounded text-white mt-2"
          >
            {loading ? "Saving..." : "Save Tax"}
          </button>

        </form>
      </div>
    </div>
  );
}
