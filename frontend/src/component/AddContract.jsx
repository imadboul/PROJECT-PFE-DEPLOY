import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProductTypes } from "../context/services/productService";
import { createContract } from "../context/services/contractService";
import {  useNavigate } from "react-router-dom";

function AddContract() {
  const [form, setForm] = useState({
    typeProduct: "",
    qteGlobale: "",
    startDate: "",
    endDate: "",
  });
  const Navigate=useNavigate();

  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // added error state
  const [error, setError] = useState(null);

  // fetch product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await getProductTypes("/catalog/productType/");

        console.log(res.data);

        const data =
          res.data.types ||
          res.data;

        setProductTypes(Array.isArray(data) ? data : []);

      } catch (err) {
        toast.error("Error fetching product types");
        console.log(err);
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

    setError(null);

    if (!form.typeProduct || !form.startDate || !form.endDate || !form.qteGlobale) {
      const msg = "Please fill all required fields";
      setError(msg);
      toast.error(msg);
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (isNaN(start) || isNaN(end)) {
      const msg = "Invalid date format";
      setError(msg);
      toast.error(msg);
      return;
    }

    const quantity = Number(form.qteGlobale);

    if (isNaN(quantity) || quantity <= 0) {
      const msg = "Invalid quantity";
      setError(msg);
      toast.error(msg);
      return;
    }

    const payload = {
      product_type: Number(form.typeProduct),
      qte_global: quantity,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    };

    try {
      setLoading(true);

      await createContract(payload);

      toast.success("Contract created successfully");
      Navigate("/Contracts")

      setForm({
        typeProduct: "",
        qteGlobale: "",
        startDate: "",
        endDate: "",
      });

    } catch (error) {

      const msg =
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "Failed to create contract";

      setError(msg); 
      toast.error(msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">

      {/* CARD */}
      <div className="w-full max-w-lg bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

        <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
          Add Contract
        </h2>



        <form onSubmit={handleSubmit} className="space-y-4">
              <select
                id="typeProduct"
                name="typeProduct"
                value={form.typeProduct}
                onChange={handleChange}
                className="w-full text-xl p-2 text-white focus:text-black border border-black rounded 
                focus:outline-none focus:ring-2"
              >
                <option value="">Select Product Type</option>

                {Array.isArray(productTypes) &&
                  productTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
              </select>
          <div className="relative bottom-3">
            {error && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {error}
              </p>
            )}
          </div>

          {/* Quantity */}
          <input
            type="number"
            name="qteGlobale"
            placeholder="Quantity by L"
            value={form.qteGlobale}
            onChange={handleChange}
            className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="relative bottom-3">
            {error && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {error}
              </p>
            )}
          </div>


          {/* Start Date */}
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full text-xl text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="relative bottom-3 ">
            {error && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {error}
              </p>
            )}
          </div>

          {/* End Date */}
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full text-xl p-2 text-white rounded border border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="relative bottom-3">
            {error && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                {error}
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