import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaUserPlus,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { handleApiErrors} from "../utils/handleApiErrors"


export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  async function onSubmit(data) {
    try {
      setLoading(true);

      const result = await login(data.email, data.password);

      if (result?.success) {
        toast.success("Login successful");
        navigate("/Home");
      } else {
        const apiErrors = result?.error;

        setAuthError(apiErrors?.non_field_errors?.[0] || "Login failed");

        handleApiErrors(apiErrors);
      }
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center z-10 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row
      "
      >
        {/* LEFT SIDE */}
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

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 bg-white text-black p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            Login
          </h2>

          {/* EMAIL */}
          <div className="mb-3">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-2 p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              {...register("email", {
                required: "Email is required",
              })}
            />
            <div className="relative top-0 mb-2">
              {errors.email && (
                <p className="absolute top-0 left-0 right-0 text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full mt-2 p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              {...register("password", {
                required: "Password is required",
              })}
            />
            <div className="relative top-0 mb-2">
              {errors.password && (
                <p className="absolute top-0 left-0 right-0 text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
          </div>
          <div className="relative top-0 mb-3">
            {authError && (
              <div className="absolute top-0 left-0 right-0 flex items-center justify-center text-red-500 text-sm">
                {authError}
              </div>
            )}
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 py-2 rounded-lg font-bold text-white transition bg-orange-600 cursor-pointer hover:bg-orange-700"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          <div className="flex items-center text-sm text-orange-500 mt-2 justify-center">
            <Link to="#">Forgot Password?</Link>
          </div>


          {/* DIVIDER */}
          <div className="flex items-center my-4">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-3 text-sm text-gray-500">Or continue with</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          {/* SOCIAL */}
          <div className="flex justify-center gap-6 text-lg md:text-xl mb-3">
            <FaFacebookF className="cursor-pointer hover:text-blue-700 transition" />
            <FaXTwitter className="cursor-pointer hover:text-gray-700 transition" />
            <FaGithub className="cursor-pointer hover:text-gray-700 transition" />
            <FaLinkedinIn className="cursor-pointer hover:text-blue-600 transition" />
          </div>

          <span className="text-center text-xs text-gray-400">
            © 2026 Sonatrach
          </span>
        </div>
      </form>
    </div>
  );
}
