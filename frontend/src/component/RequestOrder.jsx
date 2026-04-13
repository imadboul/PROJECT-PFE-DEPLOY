import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";

import { createOrder } from "../context/services/orderService";
import { getContracts } from "../context/services/contractService";
import { getProducts } from "../context/services/productService";

function RequestOrder() {
    const [contracts, setContracts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [products, setProducts] = useState([{ product: null, qte: "" }]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { handleSubmit, control } = useForm();

    //  fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const c = await getContracts();
                const p = await getProducts();

                setContracts(Array.isArray(c.data.data.contracts) ? c.data.data.contracts : []);
                setAllProducts(Array.isArray(p.data.data.products) ? p.data.data.products : []);
                setProductsList(Array.isArray(p.data.data.products) ? p.data.data.products : []);
            } catch (error) {
                const msg =
                    error.response?.data?.error ||
                    "Error creating product";

                toast.error(msg);
            }
        };

        fetchData();
    }, []);

    // add product input
    const handleAdd = () => {
        setProducts([...products, { product: null, qte: "" }]);
    };

    //  change value
    const handleChange = (i, field, value) => {
        const newProducts = [...products];
        newProducts[i][field] = value;
        setProducts(newProducts);
    };
    const contractOptions = contracts.map(c => ({
        value: c.id,
        label: `contract ${c.id}`
    }))

    const productOptions = productsList.map(p => ({
        value: p.id,
        label: p.name
    }))
    //  submit
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
            toast.success("Order created");
            navigate("/orders");
        } catch {
            toast.error("Error creating order");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center px-4">

            <div className="w-full max-w-xl bg-black/60 p-6 rounded-xl">

                <h2 className="text-center text-orange-500 text-xl mb-5">
                    Request Order
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* CONTRACT */}
                    <Controller
                        name="contract"
                        control={control}
                        rules={{ required: "contract is required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={contractOptions}
                                placeholder="Select Contract"
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
                                onChange={(val) => {
                                    field.onChange(val.value);

                                    const contract = contracts.find(c => c.id === val.value);

                                    // filter products (string compare)
                                    const filtered = allProducts.filter(
                                        (p) => p.product_type === contract.product_type
                                    );

                                    setProductsList(filtered);
                                    setProducts([{ product: null, qte: "" }]);
                                }}
                                value={contractOptions.find(
                                    (opt) => opt.value === field.value
                                )}

                            />
                        )}
                    />

                    {/* PRODUCTS */}
                    {products.map((p, i) => (
                        <div key={i} className="flex gap-2">

                            <Select
                                className="w-1/2"
                                options={productOptions}
                                placeholder="Select Product"
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
                                onChange={(val) =>
                                    handleChange(i, "product", val.value)
                                }
                                value={productOptions.find(op => op.value === p.product)}
                            />

                            <input
                                type="number"
                                placeholder="Qte"
                                value={p.qte}
                                onChange={(e) =>
                                    handleChange(i, "qte", e.target.value)
                                }
                                className="w-1/2 p-2 placeholder:text-white border border-black/80 bg-black/30 rounded text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                        </div>
                    ))}

                    {/* ADD */}
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="text-orange-600 py-2 px-3 border border-orange-600 hover:bg-orange-800/60 hover:text-white cursor-pointer py-2 rounded"
                    >
                        Add Product
                    </button>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 cursor-pointer"
                    >
                        {loading ? "Loading..." : "Create Order"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default RequestOrder;