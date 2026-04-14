import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getBill } from "../context/services/orderService";
export default function BillsList() {
  const [bill, setBill] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const resB = await getBill();
        setBill(resB.data.data.results || []);
      } catch (error) {
        const msg =
          error.response?.data?.error ||
          "Error fatching data";

        toast.error(msg);
      }
    };

    fetchData();
  }, [location.key]);

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        <h1 className="text-white text-xl font-bold mb-4">Bills</h1>
        <div className="space-y-4">
          {bill.map((b) => {
            return (
              <div
                key={b.client_id}
                onClick={() =>
                  navigate("/order", { state: { client_id: b.client_id } })
                }
                className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
              >
                <div >
                  <h2 className="text-lg font-bold">
                    Client ID : {b.client_id}
                  </h2>
                  <div className="">
                  <p className="text-md font-semibold"><span>First Name:</span> {b.firstName}</p>
                  <p className="text-md font-semibold"><span>Last Name:</span> {b.lastName}</p>
                  </div>
                  <p className="text-md font-semibold text-green-500"><span className="text-white">Number of Orders:</span> {b.numberOrders}</p>

                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}