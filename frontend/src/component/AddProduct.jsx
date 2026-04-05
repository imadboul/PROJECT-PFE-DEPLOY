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
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductTypes = async () => {
            try {
                const res = await getProductTypes();
                const data = res.data.types || res.data;
                setProductTypes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log(err);
                toast.error("Error fetching product types");
            }
        };

        fetchProductTypes();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
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
                product_type: Number(form.productType),
            };

            console.log("PAYLOAD:", payload);

            await createProduct(payload);

            toast.success("Product created");
            setError(null);

            setForm({
                name: "",
                description: "",
                unitPrice: "",
                qteLeft: "",
                productType: "",
            });

        } catch (error) {
            const msg =
                error.response?.data?.detail ||
                JSON.stringify(error.response?.data) ||
                "Error creating product";

            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transpart text-white">

            <div className="w-full max-w-lg bg-black/30 text-black rounded-2xl shadow-lg p-6 border border-black/20">

                <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
                    Add Product
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name */}
                    <input
                        name="name"
                        value={form.name}
                        placeholder="Name"
                        onChange={handleChange}
                        className="w-full text-black placeholder-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="relative bottom-3">
                        {error && (
                            <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <textarea
                        name="description"
                        value={form.description}
                        placeholder="Description"
                        onChange={handleChange}
                        className="w-full text-black placeholder-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="relative bottom-3">
                        {error && (
                            <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Unit Price */}
                    <input
                        name="unitPrice"
                        type="number"
                        value={form.unitPrice}
                        placeholder="Unit Price"
                        onChange={handleChange}
                        className="w-full text-black placeholder-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="relative bottom-3">
                        {error && (
                            <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Quantity */}
                    <input
                        name="qteLeft"
                        type="number"
                        value={form.qteLeft}
                        placeholder="Qte Left"
                        onChange={handleChange}
                        className="w-full text-black placeholder-black p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="relative bottom-3">
                        {error && (
                            <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Product Type */}
                    <div className="flex justify-center items-center gap-4">

                        <select
                            name="productType"
                            value={form.productType}
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

                        <NavLink to="/AddProductType" className="text-orange-400 px-4 py-2 text-xl hover:text-orange-600 transition">
                            <i className="fa-solid fa-plus"></i>
                        </NavLink>

                        <NavLink to="/EditProductType" className="text-orange-400 px-4 py-2 text-xl hover:text-orange-600 transition">
                            <i className="fa-solid fa-pen"></i>
                        </NavLink>
                    </div>

                    <div className="relative bottom-3">
                        {error && (
                            <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-6 py-2 rounded-lg text-white transition 
                        ${loading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-br from-black to-orange-500 hover:from-black hover:to-orange-700"}
                        `}
                    >
                        {loading ? "Loading..." : "Create Product"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default AddProduct;