import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProductTypes } from "../context/services/productService";
import { createContract } from "../context/services/contractService";

function AddContract() {
  const [form, setForm] = useState({
    typeProduct: "",
    qteGlobale: "",
    startDate: "",
    endDate: "",
  });

  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await getProductTypes("/catalog/productType/");
        setProductTypes(res.data);
      } catch (err) {
        toast.error("Error fetching product types");
      }
    };

    fetchProductTypes();
  }, []);

  // handle input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.typeProduct || !form.startDate || !form.endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        typeProduct: form.typeProduct,
        qteGlobale: Number(form.qteGlobale),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };

      await createContract("/catalog/contract/", payload);

      toast.success("Contract created successfully");

      setForm({
        typeProduct: "",
        qteGlobale: "",
        startDate: "",
        endDate: "",
      });

    } catch (error) {
      toast.error("Failed to create contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">

      {/* CARD */}
      <div className="w-full max-w-lg bg-black/20 rounded-2xl shadow-lg p-6 border border-black/60">

        <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
          Add Contract
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Product Type */}
          <select
            name="typeProduct"
            value={form.typeProduct}
            onChange={handleChange}
            className="w-full p-2 text-black rounded border border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select Product Type</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          {/* Quantity */}
          <input
            type="number"
            name="qteGlobale"
            placeholder="Quantity"
            value={form.qteGlobale}
            onChange={handleChange}
            className="w-full placeholder-black text-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {/* Start Date */}
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full text-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {/* End Date */}
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full p-2 text-black rounded border border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-2 rounded-lg text-white transition
            ${loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-br from-black to-orange-500 hover:to-orange-700"
              }`}
          >
            {loading ? "Loading..." : "Create Contract"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddContract;