import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getContractClient } from "../context/services/contractService";
import { handleApiErrors } from "../utils/errorHandler";


export default function ContractClient() {

    const [contract, setContract] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resC = await getContractClient();
                setContract(resC.data.data.results || []);
            } catch (error) {
                handleApiErrors(error);
            }
        };

        fetchData();
    }, [location.key]);

    return (
        <div className="p-6 flex justify-center relative z-10">
            <div className="w-full max-w-3xl flex flex-col gap-4">

                <h1 className="text-white text-xl font-bold mb-4">Contracts</h1>
                <div className="space-y-4">
                    {contract.map((c) => {
                        return (
                            <div
                                key={c.client_id}
                                onClick={() =>
                                    navigate("/Contracts", { state: { client_id: c.client_id } })
                                }
                                className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
                            >
                                <div >
                                    <h2 className="text-lg font-bold">
                                        Client ID : {c.client_id}
                                    </h2>
                                    <div className="">
                                        <p className="text-md font-semibold"><span>First Name:</span> {c.firstName}</p>
                                        <p className="text-md font-semibold"><span>Last Name:</span> {c.lastName}</p>
                                    </div>
                                    <p className="text-md font-semibold text-green-500"><span className="text-white">Number of Contract:</span> {c.numberContracts}</p>

                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}