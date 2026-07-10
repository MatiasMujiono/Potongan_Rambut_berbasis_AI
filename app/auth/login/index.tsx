"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type LoginFormData = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed checking user");
      }

      const userCheck = await response.json();
      if (!userCheck.exists) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: "Akun belum terdaftar",
          background: "#1A1A1A",
          color: "#FFFFFF",
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      if (!userCheck.passwordValid) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: "Password yang Anda masukkan salah",
          background: "#1A1A1A",
          color: "#FFFFFF",
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      if (result?.error) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: result.error,
          background: "#1A1A1A",
          color: "#FFFFFF",
          timer: 3000,
          timerProgressBar: true,
        });

        return;
      }
      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: userCheck.message || "Login berhasil",
        background: "#1A1A1A",
        color: "#FFFFFF",
        timer: 3000,
        timerProgressBar: true,
      });
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: "Terjadi kesalahan saat login",
        background: "#1A1A1A",
        color: "#FFFFFF",
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-[#0F0F0F] to-[#1A0A0A] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-linear-to-b from-[#141414] to-[#1A1A1A] rounded-3xl border border-white/10 shadow-2xl p-8 backdrop-blur-xl bg-opacity-90">
          {/* Logo & Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl"></div>
              <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/20">
                <Shield className="text-black w-10 h-10" />
              </div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-center text-4xl font-bold">
              <span className="bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Selamat Datang
              </span>
            </h1>
            <p className="text-center text-gray-400 mt-2 mb-8">
              Masuk ke dashboard{" "}
              <span className="text-yellow-400 font-medium">Admin</span>
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alamat Email
              </label>
              <div
                className={`
                relative group
                ${errors.identifier ? "border-red-500" : "border-white/10"}
                flex items-center bg-white/5 border rounded-xl px-4 transition-all duration-300
                focus-within:border-yellow-400/50 focus-within:shadow-lg focus-within:shadow-yellow-400/5
                hover:border-white/20
              `}
              >
                <Mail className="text-gray-400 w-5 h-5 group-focus-within:text-yellow-400 transition-colors" />
                <input
                  type="text"
                  placeholder="admin@example.com"
                  className="w-full bg-transparent text-white px-3 py-4 outline-none placeholder-gray-500"
                  {...register("identifier", {
                    required: "Email wajib diisi",
                  })}
                />
                {!errors.identifier && (
                  <div className="absolute right-4 text-green-400">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
              <AnimatePresence>
                {errors.identifier && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-2 flex items-center gap-1"
                  >
                    <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.identifier.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div
                className={`
                relative group
                ${errors.password ? "border-red-500" : "border-white/10"}
                flex items-center bg-white/5 border rounded-xl px-4 transition-all duration-300
                focus-within:border-yellow-400/50 focus-within:shadow-lg focus-within:shadow-yellow-400/5
                hover:border-white/20
              `}
              >
                <Lock className="text-gray-400 w-5 h-5 group-focus-within:text-yellow-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white px-3 py-4 outline-none placeholder-gray-500"
                  {...register("password", {
                    required: "Password wajib diisi",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-2 flex items-center gap-1"
                  >
                    <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              type="submit"
              disabled={isLoading}
              className={`
                relative w-full bg-linear-to-r from-yellow-400 to-yellow-500 
                hover:from-yellow-500 hover:to-yellow-600 
                text-black font-bold py-4 rounded-xl 
                transition-all duration-300 
                disabled:opacity-70 disabled:cursor-not-allowed
                shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40
                group overflow-hidden
              `}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </motion.button>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pt-4"
            >
              <p className="text-gray-500 text-xs">
                &copy; 2024 Admin Dashboard. All rights reserved.
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
