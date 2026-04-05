import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getProductTypes,
  updateProduct,
} from "../context/services/productService";
import api from "../api/axios";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    unitPrice: "",
    qteLeft: "",
    productType: "",
  });

  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ fetch product + types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await getProductById(`/catalog/product/${id}/`);
        const typesRes = await getProductTypes("/catalog/productType/");

        const product = productRes.data;

        setForm({
          name: product.name,
          description: product.description,
          unitPrice: product.unit_price,
          qteLeft: product.qte_left,
          productType: product.product_type,
        });

        setProductTypes(typesRes.data);
      } catch (err) {
        toast.error("Error loading product");
      }
    };

    fetchData();
  }, [id]);

 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        description: form.description,
        unit_price: Number(form.unitPrice),
        qte_left: Number(form.qteLeft),
        product_type: form.productType,
      };

      await updateProduct(id, payload);

      toast.success("Product updated successfully ✅");

      navigate("/products"); // ولا وين تحب
    } catch (err) {
      toast.error("Error updating product ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-lg bg-black/30 rounded-2xl shadow-lg p-6 border border-black/20">

        <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
          Edit Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full text-black p-2 border rounded focus:ring-2 focus:ring-orange-500"
          />

          {/* Description */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full text-black p-2 border rounded focus:ring-2 focus:ring-orange-500"
          />

          {/* Unit Price */}
          <input
            name="unitPrice"
            type="number"
            value={form.unitPrice}
            onChange={handleChange}
            placeholder="Unit Price"
            className="w-full text-black p-2 border rounded focus:ring-2 focus:ring-orange-500"
          />

          {/* Quantity */}
          <input
            name="qteLeft"
            type="number"
            value={form.qteLeft}
            onChange={handleChange}
            placeholder="Qte Left"
            className="w-full text-black p-2 border rounded focus:ring-2 focus:ring-orange-500"
          />

          {/* Product Type */}
          <div className="flex gap-3">
            <select
              name="productType"
              value={form.productType}
              onChange={handleChange}
              className="w-full text-black p-2 border rounded focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Product Type</option>
              {productTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <NavLink to="/AddProductType" className="text-orange-400 text-xl">
              ➕
            </NavLink>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white transition
              ${
                loading
                  ? "bg-gray-500"
                  : "bg-gradient-to-br from-black to-orange-500 hover:to-orange-700"
              }`}
          >
            {loading ? "Updating..." : "Update Product"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default EditProduct;