import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

import { handleApiErrors } from "../utils/handleApiErrors";
import { getChargmentOrderAdmin, rechargmentOrderAdmin } from "../context/services/orderAdmin";
import { getProducts } from "../context/services/productService";

export default function RechargmentOrder() {

    const { id } = useParams();

    const [selectedContract, setSelectedContract] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [typeChoise, setTypeChoise] = useState("plus");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const unitOptions = [
        { value: "KG", label: "Kilogram" },
        { value: "L", label: "Liter" },
        { value: "HL", label: "Hectoliter" },
        { value: "TM", label: "Tonne" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resChargemnt = await getChargmentOrderAdmin();
                const allChargements = resChargemnt.data?.data?.results || [];

                const order = allChargements.find(o => o.id == id);
                if (!order) { toast.error("Order not found"); return; }

                setSelectedOrder(order);
                setSelectedContract({ id: order.contract });

                setProducts(
                    order.order_orderProduct_items.map(i => ({
                        product: i.product.id,
                        productName: i.product.name,
                        qte: i.qte,
                        unit: i.unit
                    }))
                );

            } catch (error) {
                handleApiErrors(error);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (i, field, value) => {
        const updated = [...products];
        updated[i][field] = value;
        setProducts(updated);
    };

    const onSubmit = async () => {
        if (!selectedContract || !selectedOrder) {
            toast.error("Data not loaded yet");
            return;
        }

        const invalid = products.some(
            p => !p.product || !p.qte || !p.unit || Number(p.qte) <= 0
        );

        if (invalid) {
            toast.error("Fill all quantities and units");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                id_parent: selectedOrder.id,
                type_choise: typeChoise,
                order_orderProduct_items: products.map(p => ({
                    product: p.product,
                    qte: Number(p.qte),
                    unit: p.unit
                }))
            };

            await rechargmentOrderAdmin(payload);
            toast.success("Order created successfully");
            navigate("/orderToday");

        } catch (error) {
            handleApiErrors(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-10 py-18">
            <form
                onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
                className="w-full max-w-xl bg-black/60 p-6 rounded-xl"
            >
                <button
                    type="button"
                    className="text-white text-2xl cursor-pointer font-bold hover:text-orange-500 mb-4"
                    onClick={() => window.history.back()}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
                    Rechargement Order
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="p-2 bg-black/30 text-white rounded border border-white/20">
                        <span className="text-white/50 text-sm">Contract:</span>{" "}
                        {selectedContract ? `${selectedContract.id} - ${selectedOrder.order_orderProduct_items?.[0]?.product?.product_type}` : "-"}
                    </div>

                    <div className="p-2 bg-black/30 text-white rounded border border-white/20">
                        <span className="text-white/50 text-sm">Chargement Order:</span>{" "}
                        {selectedOrder ? `${selectedOrder.id}` : "-"}
                    </div>

                    <div className="py-2 px-4 bg-black/30 text-sm text-white rounded border border-white/20">
                        <span className="text-white/50 text-sm">Client:</span>{" "}
                        {selectedOrder ? `${selectedOrder.client_lastName} ${selectedOrder.client_firstName}` : "-"}
                    </div>
                </div>

                {/* TYPE */}
                <div className="mb-5">
                    <label className="text-white/70 text-sm mb-2 block">Type</label>
                    <div className="flex gap-3">
                        {["plus", "minus"].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTypeChoise(t)}
                                className={`flex-1 py-2 rounded border cursor-pointer capitalize transition font-medium ${typeChoise === t
                                    ? "border-orange-500 text-orange-500 bg-orange-500/10"
                                    : "border-white/20 text-white/50 hover:border-white/40"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRODUCTS */}
                <div className="space-y-3">
                    <label className="text-white/70 text-sm block">Products</label>
                    {products.length === 0 ? (
                        <p className="text-white/40 text-sm">No products found</p>
                    ) : (
                        products.map((p, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <div className="w-1/2 p-2 bg-black/30 text-white rounded border border-white/20">
                                    {p.productName}
                                </div>
                                <input
                                    type="number"
                                    placeholder="Qte"
                                    value={p.qte}
                                    onChange={(e) => handleChange(i, "qte", e.target.value)}
                                    className="w-1/3 p-2 bg-black/30 text-white border border-white/20 rounded placeholder:text-white/40 focus:outline-none focus:border-orange-500"
                                />
                                <Select
                                    className="w-1/3"
                                    options={unitOptions}
                                    placeholder="Unit"
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            backgroundColor: "rgba(0,0,0,0.3)",
                                            borderColor: state.isFocused ? "#f97316" : "rgba(255,255,255,0.2)",
                                            boxShadow: "none",
                                            "&:hover": { borderColor: "#f97316" }
                                        }),
                                        menu: (base) => ({ ...base, backgroundColor: "rgba(0,0,0,0.9)" }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? "rgba(249,115,22,0.8)" : "transparent",
                                            color: "#fff",
                                            cursor: "pointer"
                                        }),
                                        singleValue: (base) => ({ ...base, color: "#fff" }),
                                        placeholder: (base) => ({ ...base, color: "rgba(255,255,255,0.4)" }),
                                    }}
                                    onChange={(val) => handleChange(i, "unit", val.value)}
                                    value={unitOptions.find(u => u.value === p.unit) || null}
                                />
                            </div>
                        ))
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-orange-600 text-white py-2 rounded hover:bg-orange-700 cursor-pointer disabled:opacity-50 transition"
                >
                    {loading ? "Loading..." : "Rechargement Order"}
                </button>

            </form>
        </div>
    );
}