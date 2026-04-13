import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";

import { createOrder } from "../context/services/orderService";
import { getContracts } from "../context/services/contractService";
import { getProducts } from "../context/services/productService";

function RequestOrder() {
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [productsList, setProductsList] = useState([]);

  const navigate = useNavigate();

  const { handleSubmit, control } = useForm();

  const [products, setProducts] = useState([
    { product: null, qte: "" },
  ]);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const c = await getContracts();
        const p = await getProducts();

        setContracts(c.data.data.contracts || []);
        setProductsList(p.data.data.products || []);
      } catch {
        toast.error("Error loading data");
      }
    };

    fetchData();
  }, []);

  // ================= OPTIONS =================
  const contractOptions = contracts.map((c) => ({
    value: c.id,
    label: `Contract #${c.id}`,
  }));

  const productOptions = productsList.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  // ================= PRODUCTS HANDLING =================
  const handleAdd = () => {
    setProducts([...products, { product: null, qte: "" }]);
  };

  const handleChange = (i, field, value) => {
    const newProducts = [...products];
    newProducts[i][field] = value;
    setProducts(newProducts);
  };

  // ================= SUBMIT =================
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        contract: data.contract,
        products: products.map((p) => ({
          product: p.product,
          qte: Number(p.qte),
        })),
      };

      await createOrder(payload);

      toast.success("Order created successfully");
      navigate("/orders");
    } catch (error) {
      toast.error("Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">

      <div className="w-full max-w-xl bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

        {/* BACK BUTTON */}
        <button
          className="text-white text-2xl cursor-pointer font-bold hover:text-orange-500"
          onClick={() => window.history.back()}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
          Request Order
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ================= CONTRACT SELECT ================= */}
          <Controller
            name="contract"
            control={control}
            rules={{ required: "Contract is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={contractOptions}
                placeholder="Select Contract"
                onChange={(val) => field.onChange(val.value)}
                value={contractOptions.find(
                  (c) => c.value === field.value
                )}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "transparent",
                    borderColor: "#f97316",
                    color: "white",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "white",
                  }),
                }}
              />
            )}
          />

          {/* ================= PRODUCTS ================= */}
          {products.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">

              {/* PRODUCT SELECT */}
              <Select
                className="w-1/2"
                options={productOptions}
                placeholder="Select Product"
                value={productOptions.find(
                  (op) => op.value === p.product
                )}
                onChange={(val) =>
                  handleChange(i, "product", val.value)
                }
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "transparent",
                    borderColor: "#f97316",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "white",
                  }),
                  option: (base) => ({
                    ...base,
                    color: "black",
                  }),
                }}
              />

              {/* QUANTITY */}
              <input
                type="number"
                placeholder="Qte"
                value={p.qte}
                onChange={(e) =>
                  handleChange(i, "qte", e.target.value)
                }
                className="w-1/2 p-2 border border-orange-500 rounded text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}

          {/* ADD PRODUCT */}
          <button
            type="button"
            onClick={handleAdd}
            className="text-orange-400 border border-orange-500 px-3 py-2 rounded hover:bg-orange-600 hover:text-white transition"
          >
            + Add Product
          </button>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white font-bold bg-orange-600 hover:bg-orange-700 rounded"
          >
            {loading ? "Loading..." : "Request Order"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default RequestOrder;