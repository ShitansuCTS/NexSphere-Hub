"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "react-hot-toast";
import "@/style/login.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";

const SignInLayer = () => {
  const router = useRouter();

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!response?.success) {
        return toast.error(response?.message || "Login failed");
      }

      sessionStorage.setItem("loginEmail", formData.email.trim());

      toast.success("OTP sent successfully");

      router.push("/verify-otp");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    }
  };

  return (
    <section className="bjd-login-page">
      {/* BG VIDEO */}
      <video className="bjd-bg-video" autoPlay muted loop playsInline>
        <source
          src="https://demo.testctsl.in/tushar/assets/banner_video.mp4"
          type="video/mp4"
        />
      </video>

      <div className="bjd-green-overlay"></div>

      <div className="bjd-login-box" >
        {/* LEFT IMAGE */}
        <div className="bjd-login-left">
          <img
            src="https://demo.testctsl.in/tushar/assets/BJD.jpg"
            alt="BJD"
            className="bjd-main-img"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="bjd-login-right">
          <div className="bjd-watermark"></div>

          <h4 className="mb-32">Login to Your Account</h4>

          <form onSubmit={handleSubmit}>
            <div className="bjd-field position-relative">
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#16a34a",
                  zIndex: 2,
                }}
              />

              <input
                type="email"
                value={formData.email}
                className="form-control h-56-px bg-neutral-200 radius-12"
                style={{
                  paddingLeft: "48px",
                  border: "1px solid #d1d5db",
                }}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Email Address"
                required
              />
            </div>

            <div className="bjd-field position-relative">
              <LockKeyhole
                size={18}
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#16a34a",
                  zIndex: 2,
                }}
              />

              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                className="form-control h-56-px bg-neutral-200 radius-12"
                style={{
                  paddingLeft: "48px",
                  paddingRight: "48px",
                  border: "1px solid #d1d5db",
                }}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#16a34a",
                  zIndex: 2,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn text-sm btn-sm px-12 py-16 w-100 radius-12 d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                height: "48px",
                fontWeight: "600",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Please Wait...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In Now
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
