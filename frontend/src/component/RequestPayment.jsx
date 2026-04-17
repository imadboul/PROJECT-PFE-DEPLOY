import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createPayment } from '../context/services/BalanceService'
import toast from 'react-hot-toast'
import { getProductTypes } from '../context/services/productService'
import Select from "react-select";
import { handleApiErrors } from "../utils/errorHandler";


function RequestPayment() {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
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
        const data = res.data.data.types
        setProductTypes(Array.isArray(data) ? data : [])
      } catch (error) {
        handleApiErrors(error);
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
      setLoading(true)

      const payload = {
        amount: Number(data.amount),
        bankName: data.bankName,
        productType: data.productType,
        transferDate: data.transferDate,
      }

      await createPayment(payload)

      toast.success("Payment request sent")
      navigate("/Balance")

    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="w-full max-w-xl bg-black/60 rounded-2xl shadow-lg p-6 border border-black/60">

        <div>
          <button
            className="text-white text-2xl cursor-pointer font-bold hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
            Request Payment
          </h2>
        </div>
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

         <div className="relative bottom-4 mb-8">
            {errors.productType && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                {errors.productType.message}
              </p>
            )}
          </div>

          {/* Amount */}
          <input
            type="number"
            placeholder='Amount'
            {...register("amount", { required: "amount is required" })}
            className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="relative bottom-4 mb-4">
            {errors.amount && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>
          {/* Bank Name */}
          <input
            type="text"
            placeholder='Bank Name'
            {...register("bankName", { required: "bankName is required" })}
            className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="relative bottom-4 mb-4">
            {errors.bankName && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                {errors.bankName.message}
              </p>
            )}
          </div>
          {/* Transfer Date */}
          <input
            type="date"
            {...register("transferDate", { required: "Date is required" })}
            className="w-full text-xl placeholder-white text-white p-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="relative bottom-4 mb-4">
            {errors.transferDate && (
              <p className="absolute top-0 left-0 right-0 text-red-500 text-md text-center mt-1">
                {errors.transferDate.message}
              </p>
            )}
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white font-bold bg-orange-600 cursor-pointer hover:bg-orange-700 rounded placeholder-white"
          >
            {loading ? "Loading..." : "Request Payment"}
          </button>

        </form>
      </div>
    </div>
  )
}

export default RequestPayment