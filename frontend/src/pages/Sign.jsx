import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../context/AuthContext";
import { FaUserPlus } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Sign() {
  const { signUp } = useContext(AuthContext);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  async function onSubmit(data) {
    setLoading(true);

    try {
      const result = await signUp(data);

      if (result.success) {
        toast.success("Sign up successful");
        navigate("/Home");
      } else {
        setAuthError(result.error);
        toast.error("Sign up failed");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Error Sign up";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center z-10 p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">


        {/* Right Side (Form) */}
        <div className="w-full px-10 py-5">
          <h2 className="text-2xl font-bold m-4 text-center">Sign Up</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4 md:flex-row flex-col">
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  placeholder="Enter your Last Name"
                  className="w-full mt-2 p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  {...register("lastName", {
                    required: "Last Name required",
                  })}
                />
                <div className="relative top-0 mb-3">
                  {errors.lastName && (
                    <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div>

                <label className="text-sm font-medium">First Name</label>
                <input
                  type="text"
                  placeholder="Enter your First Name"
                  className="w-full mt-2 p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  {...register("firstName", {
                    required: "First Name required",
                  })}
                />
                <div className="relative top-0 mb-3">
                  {errors.firstName && (
                    <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
              </div>



              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="number"
                  placeholder="Enter your Phone Number"
                  className="w-full mt-2 p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  {...register("phoneNumber", {
                    required: "Phone Number required",
                  })}
                />
                <div className="relative top-0 mb-3">
                  {errors.phoneNumber && (
                    <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter your Email"
                className="w-full mt-2 p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                {...register("email", {
                  required: "Email required",
                })}
              />
              <div className="relative top-0 mb-3">
                {errors.email && (
                  <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter your Password"
                className="w-full mt-2 p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                {...register("password", {
                  required: "Password required",
                })}
              />
              <div className="relative top-0 mb-3">
                {errors.password && (
                  <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full mt-2 p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                {...register("confirmPassword", {
                  required: "Confirm password required",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              <div className="relative top-0 mb-3">
                {errors.confirmPassword && (
                  <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="relative top-0 mb-3">
              {authError && (
                <p className="absolute top-0 left-0 right-0 text-red-500 text-sm text-center">
                  {authError && Object.values(authError).flat().join(", ")}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-2 rounded-lg font-bold text-white transition bg-orange-600 cursor-pointer hover:bg-orange-700"

            >
              {loading ? "Loading..." : "Sign Up"}
            </button>

            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/" className="text-orange-500 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div >
      </div>
    </div>

  );
}

