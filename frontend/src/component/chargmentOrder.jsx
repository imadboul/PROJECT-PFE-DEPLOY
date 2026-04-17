import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

import { getContracts } from "../context/services/contractService";
import { getOrders } from "../context/services/orderService";
import { getProducts } from "../context/services/productService";
import { handleApiErrors } from "../utils/handleApiErrors";
import { chargmentOrderAdmin } from "../context/services/orderAdmin";

export default function ChargmentOrder() {

  const { id } = useParams();

  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const unitOptions = [
    { value: "KG", label: "Kilogram" },
    { value: "L", label: "Liter" },
    { value: "HL", label: "Hectoliter" },
    { value: "TM", label: "Tonne" },
  ];

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const c = await getContracts();
        const o = await getOrders();
        const p = await getProducts();

        setContracts(c.data?.data?.contracts?.results || []);
        setOrders(o.data?.data?.results || []);
        setAllProducts(p.data?.data?.products || []);

      } catch (error) {
        handleApiErrors(error);
      }
    };

    fetchData();
  }, []);

  // ===============================
  // AUTO LOAD ORDER
  // ===============================
  useEffect(() => {

    if (!id || !orders.length || !contracts.length || !allProducts.length) return;

    const order = orders.find(o => o.id == id);
    if (!order) return;

    const contract = contracts.find(c => c.id == order.contract);
    if (!contract) return;

    setSelectedOrder(order);
    setSelectedContract(contract);

    const filteredProducts = allProducts.filter(
      p => p.product_type === contract.product_type
    );

    setProducts(
      filteredProducts.map(p => ({
        product: p.id,
        productName: p.name,
        qte: "",
        unit: null
      }))
    );

  }, [id, orders, contracts, allProducts]);

  // ===============================
  // HANDLE CHANGE
  // ===============================
  const handleChange = (i, field, value) => {
    const updated = [...products];
    updated[i][field] = value;
    setProducts(updated);
  };

  // ===============================
  // SUBMIT FIXED
  // ===============================
  const onSubmit = async () => {

    if (!selectedContract || !selectedOrder) {
      toast.error("Data not loaded yet");
      return;
    }

    const invalid = products.some(
      p => !p.qte || !p.unit || Number(p.qte) <= 0
    );

    if (invalid) {
      toast.error("Fill all quantities and units");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        contract: selectedContract.id,
        client_order: selectedOrder.id,
        client: selectedOrder.client,
        order_orderProduct_items: products.map(p => ({
          product: p.product,
          qte: Number(p.qte),
          unit: p.unit
        }))
      };

      console.log("PAYLOAD:", payload);

      await chargmentOrderAdmin(payload);

      toast.success("Order created successfully");
      navigate("/order");

    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="w-full max-w-xl bg-black/60 p-6 rounded-xl"
      >

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
          Chargment Order
        </h2>

        {/* CONTRACT */}
        <div className="p-2 mb-3 bg-black/30 text-white rounded border">
          Contract: {selectedContract ? `#${selectedContract.id}` : "-"}
        </div>

        {/* ORDER */}
        <div className="p-2 mb-4 bg-black/30 text-white rounded border">
          Client Order: {selectedOrder ? `#${selectedOrder.id}` : "-"}
        </div>

        {/* CLIENT */}
        <div className="p-2 mb-4 bg-black/30 text-white rounded border">
          Client: {selectedOrder ? selectedOrder.client : "-"}
        </div>

        {/* PRODUCTS */}
        <div className="space-y-3">

          {products.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">

              {/* PRODUCT NAME */}
              <div className="w-1/2 p-2 bg-black/30 text-white rounded border">
                {p.productName}
              </div>

              {/* QTE */}
              <input
                type="number"
                placeholder="Qte"
                value={p.qte}
                onChange={(e) => handleChange(i, "qte", e.target.value)}
                className="w-1/3 p-2 bg-black/30 text-white border rounded"
              />

              {/* UNIT */}
              <Select
                className="w-1/3"
                options={unitOptions}
                placeholder="Unit"
                onChange={(val) => handleChange(i, "unit", val.value)}
                value={unitOptions.find(u => u.value === p.unit)}
              />

            </div>
          ))}

        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 bg-orange-600 py-2 rounded hover:bg-orange-700"
        >
          {loading ? "Loading..." : "Create Order"}
        </button>

      </form>
    </div>
  );
}