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

  useEffect(() => {
    if (!id || !orders.length || !allProducts.length) return;

    const order = orders.find(o => o.id == id);
    if (!order) return;

    const contract = order.contract;

    setSelectedOrder(order);
    setSelectedContract(contract);

    const orderProducts = order.orderclient_Orderproductclient_items || [];

    const mapped = orderProducts.map(op => {
      const productData = allProducts.find(p =>
        p.name?.toLowerCase().trim() === op.product?.toLowerCase().trim()
      );

      return {
        product: productData?.id || null,
        productName: op.product,
        qte: "",
        unit: null
      };
    });

    setProducts(mapped);


  }, [id, orders, allProducts]);


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
        client: selectedOrder.client_id,
        order_orderProduct_items: products.map(p => ({
          product: p.product,
          qte: Number(p.qte),
          unit: p.unit
        }))

      };console.log(payload)

      await chargmentOrderAdmin(payload);
      

      toast.success("Order created successfully");
      navigate("/orderToday");

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
        <div>
          <button
            className="text-white text-2xl cursor-pointer font-bold hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
            Chargment Order
          </h2>
        </div>

        {/* CONTRACT */}
        <div className="p-2 mb-3 bg-black/30 text-white rounded border">
          Contract: {selectedContract ? `${selectedContract.id} - ${selectedContract.product_type}` : "-"}
        </div>

        {/* ORDER */}
        <div className="p-2 mb-4 bg-black/30 text-white rounded border">
          Client Order: {selectedOrder ? `${selectedOrder.id}` : "-"}
        </div>

        {/* CLIENT */}
        <div className="p-2 mb-4 bg-black/30 text-white rounded border">
          Client: {selectedOrder
            ? `${selectedOrder.client_firstName} ${selectedOrder.client_lastName}`
            : "-"}
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
                className="w-1/3 p-2 bg-black/30 text-white border border-white/20 rounded placeholder:text-white/40 focus:outline-none focus:border-orange-500"
              />

              {/* UNIT */}
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
          ))}

        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 bg-orange-600 text-white font-bold cursor-pointer py-2 rounded hover:bg-orange-700"
        >
          {loading ? "Loading..." : "Chargement Order"}
        </button>

      </form>
    </div>
  );
}