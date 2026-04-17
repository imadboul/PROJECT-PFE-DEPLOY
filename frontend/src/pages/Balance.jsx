import { useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getBalances } from "../context/services/BalanceService";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function BalanceList() {
  const [balances, setBalances] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const {user}= useContext(AuthContext);
  const handleApiErrors = (error) => {
    const errors = error.response?.data.errors;

    if (!errors) return;

    Object.values(errors).forEach((messages) => {
      messages.forEach((msg) => {
        toast.error(msg);
      });
    });
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const resB = await getBalances();


        setBalances(resB.data.data.results || []);
      } catch (error) {
        handleApiErrors(error);
      }
    };

    fetchData();
  }, [location.key]);

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        <h1 className="text-white text-xl font-bold mb-4">Balance</h1>
        <div className="flex flex-col self-start">
          {["client"].includes(user?.role) && (
            <NavLink
              to="/RequestPayment"
              className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 mb-4"
            >
              Request new Payment
            </NavLink>
          )}
        </div>


        {balances.map((b) => {
          const amount = Number(b.amount);

          return (
            <div
              key={b.id}
              onClick={() =>
                navigate("/payment/", {
                  state: { productType: b.product_Type },
                })
              }
              className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">
                  Product Type: {b.productType}
                </h2>
              </div>

              <div className="flex justify-between text-sm mt-3">
                <p>Client ID: {b.client}</p>
                <p className="text-green-500 text-md font-bold"><strong className="text-white">Amount:</strong> {amount} DA</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}