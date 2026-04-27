import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { getTaxes, getTaxProducts } from "../context/services/TaxService";
import { handleApiErrors } from "../utils/handleApiErrors";

export default function TaxList() {
    const [view, setView] = useState("tax");
    const [taxes, setTaxes] = useState([]);
    const [taxProducts, setTaxProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const resTax = await getTaxes();
            setTaxes(resTax.data.data.results);
            const resProd = await getTaxProducts();
            setTaxProducts(resProd.data.data.results);
        } catch (error) {
            handleApiErrors(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "—");

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    const list = view === "tax" ? taxes : taxProducts;

    return (
        <div className="p-6 flex justify-center relative z-10">
            <div className="w-full max-w-3xl flex flex-col gap-4">

                <h1 className="text-white text-xl font-bold">Taxes</h1>

                <div className="flex justify-between items-center">

                    <button
                        onClick={() => {
                            setView(v => v === "tax" ? "tax_product" : "tax");
                            setSelectedItem(null);
                        }}
                        className="border border-white text-white cursor-pointer px-4 py-2 rounded hover:bg-white/10 text-sm"
                    >
                        {view === "tax" ? "Show Tax Products" : "Show Taxes"}
                    </button>

                    <NavLink
                        to="/AddTax"
                        className="border border-orange-500 text-orange-400 cursor-pointer px-4 py-2 rounded hover:bg-orange-500/10 text-sm"
                    >
                        Add Tax
                    </NavLink>
                </div>

                {list.length === 0 && (
                    <p className="text-white/50 text-center mt-8">No records found.</p>
                )}

                {view === "tax" && taxes.map((t) => (
                    <div
                        key={t.id}
                        onClick={() => setSelectedItem(t)}
                        className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
                    >
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-semibold">{t.name}</p>
                            <span className="text-xs text-white/40">ID: {t.id}</span>
                        </div>
                        {t.description && (
                            <p className="text-sm text-white/60 mt-1">{t.description}</p>
                        )}
                    </div>
                ))}

                {view === "tax_product" && taxProducts.map((tp) => (
                    <div
                        key={tp.id}
                        onClick={() => setSelectedItem(tp)}
                        className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
                    >
                        <div className="space-y-2 text-sm">
                            <div className="md:flex justify-between items-center">
                                <p className="text-lg font-semibold">{tp.tax_name}</p>
                                <p><strong>Product:</strong> {tp.product_name}</p>
                            </div>

                            <div className="md:flex justify-between">
                                <p><strong>Unit:</strong> {tp.unit} <strong>Par Unit:</strong> {tp.par_unit}</p>
                                <p><strong>From:</strong> {formatDate(tp.start_date)}</p>
                            </div>

                            <p className={tp.is_active ? "text-green-500" : "text-red-500"}>
                                <strong className="text-white">State:</strong>{" "}
                                {tp.is_active ? "Active" : "Inactive"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {selectedItem && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-black border border-white text-white p-6 rounded-xl w-[350px] relative">

                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-2 right-3 cursor-pointer text-white hover:text-red-500"
                        >✕</button>

                        {view === "tax" ? (
                            <div className="space-y-2 text-sm">
                                <p className="text-lg font-bold">{selectedItem.name}</p>
                                <p><strong>ID:</strong> {selectedItem.id}</p>
                                {selectedItem.description && (
                                    <p><strong>Description:</strong> {selectedItem.description}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2 text-sm">
                                <p className="text-lg font-bold">{selectedItem.tax_name}</p>
                                <p><strong>Product:</strong> {selectedItem.product_name}</p>
                                <p><strong>Unit:</strong> {selectedItem.unit}</p>
                                <p><strong>Par Unit:</strong> {selectedItem.par_unit}</p>
                                <p><strong>Start Date:</strong> {formatDate(selectedItem.start_date)}</p>
                                <p><strong>End Date:</strong> {formatDate(selectedItem.end_date)}</p>
                                <p className={selectedItem.is_active ? "text-green-500" : "text-red-500"}>
                                    <strong className="text-white">State:</strong>{" "}
                                    {selectedItem.is_active ? "Active" : "Inactive"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
