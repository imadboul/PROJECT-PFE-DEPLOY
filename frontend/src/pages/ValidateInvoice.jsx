import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { handleApiErrors } from "../utils/handleApiErrors";
import { getInvoiceData, validateInvoices } from "../context/services/invoiceService";

const MODES = [
  {
    key: "v_all",
    label: "Validate All",
    icon: "fa-check-double",
    desc: "Validate all pending invoices"
  },
  {
    key: "v_client",
    label: "By Client",
    icon: "fa-user",
    desc: "Select one or more clients"
  },
  {
    key: "v_contract",
    label: "By Contract",
    icon: "fa-file-contract",
    desc: "Select one or more contracts"
  },
  {
    key: "v_product_type",
    label: "By Product Type",
    icon: "fa-box",
    desc: "Select one or more product types"
  },
];

export default function ValidateInvoice() {
  const [mode, setMode] = useState(null);
  const [clients, setClients] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setFetching(true);
        const res = await getInvoiceData();
        setClients(res.data.data.clients || []);
        setProductTypes(res.data.data.product_types || []);
      } catch (error) {
        handleApiErrors(error);
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, []);

  const handleModeChange = (key) => {
    setMode(key);
    setSelectedIds([]);
  };

  const toggleId = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleValidate = async () => {
    if (!mode) {
      toast.error("Select a validation mode");
      return;
    }
    if (mode !== "v_all" && selectedIds.length === 0) {
      toast.error("Select at least one item");
      return;
    }

    try {
      setLoading(true);
      const payload = mode === "v_all" ? { ids: [0] } : { ids: selectedIds };
      await validateInvoices(mode, payload);
      toast.success("Invoices validated successfully");
      setSelectedIds([]);
      setMode(null);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const getItems = () => {
    if (mode === "v_client") {
      return clients.map(c => ({
        id: c.id,
        label: `${c.client_firstName} ${c.client_lastName}`,
        sub: c.client_contracts.map(ct => ct.product_type).join(", ") || "No contracts",
      }));
    }
    if (mode === "v_contract") {
      return clients.flatMap(c =>
        c.client_contracts.map(ct => ({
          id: ct.id,
          label: `Contract #${ct.id}`,
          sub: `${c.client_firstName} ${c.client_lastName} — ${ct.product_type}`,
        }))
      );
    }
    if (mode === "v_product_type") {
      return productTypes.map(pt => ({
        id: pt.id,
        label: pt.name,
        sub: "",
      }));
    }
    return [];
  };

  if (fetching) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-2xl flex flex-col gap-5">

        {/* Header */}
        <h1 className="text-white text-xl font-bold">Validate Invoices</h1>

        <button
          className="text-white text-2xl font-bold cursor-pointer hover:text-orange-500 self-start"
          onClick={() => window.history.back()}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((m) => (
            <div
              key={m.key}
              onClick={() => handleModeChange(m.key)}
              className={`cursor-pointer rounded-2xl p-4 border transition
                ${mode === m.key
                  ? "bg-orange-600/30 border-orange-500 text-white"
                  : "bg-black/50 border-white/10 text-white/70 hover:bg-black/80"
                }`}
            >
              <i className={`fa-solid ${m.icon} text-orange-400 text-xl mb-2`}></i>
              <p className="font-semibold text-sm">{m.label}</p>
              <p className="text-xs text-white/40 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Items List — shown only when mode needs selection */}
        {mode && mode !== "v_all" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-white/60 uppercase tracking-wide">
              Select items to validate:
            </p>

            {getItems().map((item) => (
              <div
                key={item.id}
                onClick={() => toggleId(item.id)}
                className={`cursor-pointer rounded-xl p-4 border transition flex justify-between items-center
                  ${selectedIds.includes(item.id)
                    ? "bg-orange-600/20 border-orange-500 text-white"
                    : "bg-black/50 border-white/10 text-white/80 hover:bg-black/70"
                  }`}
              >
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  {item.sub && <p className="text-xs text-white/40 mt-0.5">{item.sub}</p>}
                </div>
                {selectedIds.includes(item.id) && (
                  <i className="fa-solid fa-circle-check text-orange-400 text-lg"></i>
                )}
              </div>
            ))}
          </div>
        )}

        {/* v_all confirmation */}
        {mode === "v_all" && (
          <div className="bg-orange-600/10 border border-orange-500/40 rounded-xl p-4 text-white/80 text-sm">
            <i className="fa-solid fa-triangle-exclamation text-orange-400 mr-2"></i>
            This will validate <strong>all pending invoices</strong>. Are you sure?
          </div>
        )}

        {/* Submit */}
        {mode && (
          <button
            onClick={handleValidate}
            disabled={loading}
            className="w-full py-2 font-bold bg-orange-600 cursor-pointer hover:bg-orange-700 rounded text-white"
          >
            {loading ? "Validating..." : "Confirm Validation"}
          </button>
        )}

      </div>
    </div>
  );
}
