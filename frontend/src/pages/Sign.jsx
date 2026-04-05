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
    } catch (authError) {
      toast.error(authError||"Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center z-10 p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-black to-orange-600 text-white p-6 md:p-8 flex flex-col justify-center items-center text-center">
          <FaUserPlus className="text-5xl md:text-6xl mb-6 animate-bounce" />

          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Welcome to Sonatrach
          </h2>

          <p className="mb-6 text-sm md:text-md max-w-sm text-white/80">
            Join with us and explore opportunities in one of the largest energy
            companies.
          </p>

          <Link
            to="#"
            className="px-6 py-2 font-semibold rounded-full border border-orange-600 hover:bg-orange-600 transition"
          >
            Learn More
          </Link>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-1/2 p-5">
          <h2 className="text-2xl font-bold mb-2 text-center">Sign Up</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                register={register}
                name="firstName"
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                register={register}
                name="lastName"
                error={errors.lastName}
              />
            </div>

            <Input
              label="Phone Number"
              register={register}
              name="phoneNumber"
              error={errors.phoneNumber}
            />
            <Input
              label="Email"
              type="email"
              register={register}
              name="email"
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              register={register}
              name="password"
              error={errors.password}
            />

            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full mt-6 py-2 rounded-lg text-white transition 
               ${loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-br from-black to-orange-500 hover:from-black hover:to-orange-700"}
           `}
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
        </div>
      </div>
    </div>
  );
}

function Input({ label, register, name, type = "text", error }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        {...register(name, { required: `${label} is required` })}
      />
      <div className="relative top-0 mb-3">
        {error && (
          <p className="absolute top-0 left-0 right-0 text-red-500 text-xs text-center">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
