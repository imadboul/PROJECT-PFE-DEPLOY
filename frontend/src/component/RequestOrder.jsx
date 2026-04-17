import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";

import { createOrder } from "../context/services/orderService";
import { getContracts } from "../context/services/contractService";
import { getProducts } from "../context/services/productService";
import { handleApiErrors } from "../utils/errorHandler";


function RequestOrder() {
    const [contracts, setContracts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [products, setProducts] = useState([
        { product: null, qte: "", unit: null },
    ]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { handleSubmit, control } = useForm();

    const unitOptions = [
        { value: "KG", label: "Kilogram" },
        { value: "L", label: "Liter" },
        { value: "HL", label: "Hectoliter" },
        { value: "TM", label: "Tonne" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const c = await getContracts();
                const p = await getProducts();

                setContracts(c.data?.data?.contracts?.results || []);
                setAllProducts(p.data?.data?.products || []);
                setProductsList(p.data?.data?.products || []);
            } catch (error) {
                handleApiErrors(error);
            }
        };

        fetchData();
    }, []);

    // ADD PRODUCT
    const handleAdd = () => {
        setProducts([...products, { product: null, qte: "", unit: null }]);
    };

    // CHANGE VALUE
    const handleChange = (i, field, value) => {
        const newProducts = [...products];
        newProducts[i][field] = value;
        setProducts(newProducts);
    };

    // OPTIONS
    const contractOptions = contracts.map((c) => ({
        value: c.id,
        label: `Contract - ${c.product_type}`,
    }));

    const productOptions = productsList.map((p) => ({
        value: p.id,
        label: p.name,
    }));

    const onSubmit = async (data) => {
        try {
            const invalid = products.some(
                (p) => !p.product || !p.qte || Number(p.qte) <= 0 || !p.unit
            );

            if (invalid) {
                toast.error("Select product, unit and valid quantity");
                return;
            }

            setLoading(true);

            const payload = {
                contract: data.contract.value,
                orderclient_Orderproductclient_items: products.map((p) => ({
                    product: p.product.value,
                    qte: Number(p.qte),
                    unit: p.unit,
                })),
            };

            await createOrder(payload);

            toast.success("Order created");
            navigate("/order");
        } catch (error) {
            handleApiErrors(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-xl bg-black/60 p-6 rounded-xl">

                <button
                    className="text-white text-2xl cursor-pointer text-white font-bold hover:text-orange-500"
                    onClick={() => window.history.back()}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
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
                                    field.onChange(val);

                                    const contract = contracts.find(c => c.id === val.value);

                                    const filtered = allProducts.filter(
                                        (p) => p.product_type === contract.product_type
                                    );

                                    setProductsList(filtered);
                                    setProducts([{ product: null, qte: "", unit: null }]);
                                }}
                                value={field.value}
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
                                    handleChange(i, "product", val)
                                }
                                value={p.product}
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

                            <Select
                                className="w-1/3"
                                options={unitOptions}
                                placeholder="Unit"
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
                                onChange={(val) =>
                                    handleChange(i, "unit", val.value)
                                }
                                value={unitOptions.find(op => op.value === p.unit)}
                            />

                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAdd}
                        className="text-orange-600 py-2 px-3 border border-orange-600 hover:bg-orange-800/60 hover:text-white cursor-pointer py-2 rounded"
                    >
                        Add Product
                    </button>

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