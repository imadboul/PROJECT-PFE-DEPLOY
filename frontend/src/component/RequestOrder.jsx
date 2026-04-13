import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createOrder } from "../context/services/orderService";

function RequestOrder() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [products, setProducts] = useState([{ product: "", qte: "" }]);

    const handleAdd = () => {
        setProducts([...products, { product: "", qte: "" }]);
    };

    const handleChange = (i, field, value) => {
        const newProducts = [...products];
        newProducts[i][field] = value;
        setProducts(newProducts);
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            const payload = {
                contract: Number(data.contract),
                products: products.map((p) => ({
                    product: Number(p.product),
                    qte: Number(p.qte),
                })),
            };

            await createOrder(payload);
            toast.success("Order created successfully");
            navigate("/orders");

        } catch (error) {
            const msg =
                error.response?.data?.message ||
                "Error creating order";

            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent px-4">

            <div className="w-full max-w-xl bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

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

                    {/* Contract ID */}
                    <input
                        type="number"
                        placeholder="Contract ID"
                        {...register("contract", {
                            required: "Contract is required",
                        })}
                        className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <div className="relative bottom-4">
                        {errors.contract && (
                            <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                                {errors.contract.message}
                            </p>
                        )}
                    </div>

                    {/* Products */}
                    {products.map((p, i) => (
                        <div key={i} className="flex justify-between gap-2">
                            <div>
                                <input
                                    type="number"
                                    placeholder="Product ID"
                                    value={p.product}
                                    onChange={(e) => handleChange(i, "product", e.target.value)}
                                    className="placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <div className="relative bottom-1 mb-6">
                                    {errors.contract && (
                                        <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                                            {errors.contract.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>

                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={p.qte}
                                    onChange={(e) => handleChange(i, "qte", e.target.value)}
                                    className="placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <div className="relative bottom-1 mb-6">
                                    {errors.contract && (
                                        <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                                            {errors.contract.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAdd}
                        className="text-orange-600 border border-orange-600 cursor-pointer px-3 py-2 rounded hover:bg-orange-700 hover:border-orange-700 hover:text-white transition"
                    >
                        Add Product
                    </button>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 text-white font-bold bg-orange-600 cursor-pointer hover:bg-orange-700 rounded"
                    >
                        {loading ? "Loading..." : "Request Order"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default RequestOrder;
