import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createPayment } from '../context/services/BalanceService'
import toast from 'react-hot-toast'
import { getProductTypes } from '../context/services/productService'
import Select from "react-select";

function RequestPayment() {
  const [productTypes, setProductTypes] = useState([]);
  const [loding, setLoding] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await getProductTypes()
        const data = res.data.types || res.data
        setProductTypes(Array.isArray(data) ? data : [])
      } catch {
        toast.error("Error fetching product types")
      }
    }
    fetchProductTypes()
  }, [])

  // options for react-select
  const options = productTypes.map(type => ({
    value: type.id,
    label: type.name
  }));

  const onSubmit = async (data) => {
    try {
      setLoding(true)

      const payload = {
        amount: Number(data.amount),
        bankName: data.bankName,
        productType: Number(data.productType),
        transferDate: data.transferDate,
      }

      await createPayment(payload)

      toast.success("Payment request sent")
      navigate("/Balance")

    } catch (err) {
      console.log(err.response?.data); 
      const errorMsg =
        err.response?.data?.transferDate ||
        err.response?.data?.error ||
        "Something went wrong";

      toast.error(errorMsg);
  } finally {
    setLoding(false)
  }
}

return (
  <div className="min-h-screen flex items-center justify-center bg-transparent">
    <div className="w-full max-w-xl bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

      <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
        Request Payment
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>

        {/* Product Type */}
        <Controller
          name="productType"
          control={control}
          rules={{ required: "Product type is required" }}
          render={({ field }) => (
            <Select
              {...field}
              options={options}
              placeholder="Select Product Type"
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
              onChange={(selected) => field.onChange(selected.value)}
              value={options.find(opt => opt.value === field.value)}
            />
          )}
        />

        {errors.productType && (
          <p className="text-red-500 text-center">
            {errors.productType.message}
          </p>
        )}

        {/* Amount */}
        <input
          type="number"
          placeholder='Amount'
          {...register("amount", { required: "amount is required" })}
          className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {errors.amount && <p className="text-red-500 text-center">{errors.amount.message}</p>}

        {/* Bank Name */}
        <input
          type="text"
          placeholder='Bank Name'
          {...register("bankName", { required: "bankName is required" })}
          className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {errors.bankName && <p className="text-red-500 text-center">{errors.bankName.message}</p>}

        {/* Transfer Date */}
        <input
          type="date"
          {...register("transferDate", { required: "Date is required" })}
          className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {errors.transferDate && <p className="text-red-500 text-center">{errors.transferDate.message}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loding}
          className={`w-full mt-4 py-2 rounded-lg text-white transition
            ${loding
              ? "bg-gray-500 cursor-not-allowed"
              : "font-bold bg-orange-600 hover:bg-orange-700"
            }`}
        >
          {loding ? "Loading..." : "Request Payment"}
        </button>

      </form>
    </div>
  </div>
)
}

export default RequestPayment