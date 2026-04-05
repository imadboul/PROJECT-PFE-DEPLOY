import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { getProductTypes, createProduct } from "../context/services/productService";

function AddProduct() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        unitPrice: "",
        qteLeft: "",
        productType: "",
    });
    const [loading, setLoading] = useState(false);

    const [productTypes, setProductTypes] = useState([]);

    useEffect(() => {
        const fetchTypes = async () => {
            const res = await getProductTypes("/catalog/productType/");
            setProductTypes(res.data);
        };

        fetchTypes();
    }, []);

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
                unitPrice: Number(form.unitPrice),
                qteLeft: Number(form.qteLeft),
                productType: form.productType,
            };

            await createProduct("/catalog/products/", payload);
            toast.success("Product created");
        } catch (err) {
            toast.error("Error creating product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transpart  text-white">

            {/* CARD */}
            <div className="w-full max-w-lg bg-black/30 text-black rounded-2xl shadow-lg p-6 border border-black/20">

                <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
                    Add Product
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name */}
                    <input
                        name="name"
                        placeholder="Name"
                        onChange={handleChange}
                        className="w-full text-black placeholder-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    {/* Description */}
                    <textarea
                        name="description"
                        placeholder="Description"
                        onChange={handleChange}
                        className="w-full text-black placeholder-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    {/* Unit Price */}
                    <input
                        name="unitPrice"
                        type="number"
                        placeholder="Unit Price"
                        onChange={handleChange}
                        className="w-full text-black placeholder-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    {/* Quantity */}
                    <input
                        name="qteLeft"
                        type="number"
                        placeholder="Qte Left"
                        onChange={handleChange}
                        className="w-full text-black placeholder-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    {/* Product Type */}
                    <div className="flex justify-center items-center gap-4">
                        <select
                            name="productType"
                            onChange={handleChange}
                            className="w-full text-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Select Product Type</option>
                            {productTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}

                        </select>
                        <NavLink to="/AddProductType" className="text-orange-400 px-4 py-2 text-xl hover:text-orange-600 transition">
                            <i className="fa-solid fa-plus"></i>
                        </NavLink>
                        <NavLink to="/EditProductType" className="text-orange-400 px-4 py-2 text-xl hover:text-orange-600 transition">
                            <i className="fa-solid fa-pen"></i>
                        </NavLink>
                    </div>

                    {/* Submit */}
                    {/* BUTTON */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full mt-6 py-2 rounded-lg text-white transition 
                       ${loading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-br from-black to-orange-500 hover:from-black hover:to-orange-700"}
                 `}
                    >
                        {loading ? "Loading..." : "Creat Product"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddProduct;