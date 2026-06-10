"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Mail,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import "@/style/login.css";

import { useAuthStore } from "@/store/auth.store";

const VerifyOtpLayer = () => {
  const router = useRouter();

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const loading = useAuthStore((state) => state.loading);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("loginEmail");

    if (!savedEmail) {
      router.push("/login");
      return;
    }

    setEmail(savedEmail);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    try {
      const response = await verifyOtp({
        email,
        otp: finalOtp,
      });

      if (!response?.success) {
        return toast.error(response?.message || "OTP verification failed");
      }

      toast.success("Login successful");

      sessionStorage.removeItem("loginEmail");

      router.push("/");
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

      <div className="bjd-login-box">
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

          <h4 className="mb-12">Verify OTP</h4>

          <p
            className="mb-32"
            style={{
              position: "relative",
              zIndex: 2,
              color: "#555",
              fontSize: "14px",
            }}
          >
            Enter the 6-digit OTP sent to your email.
          </p>

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
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
                value={email}
                disabled
                className="form-control h-56-px bg-neutral-200 radius-12"
                style={{
                  paddingLeft: "48px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#e9fbe9",
                  color: "#333",
                }}
              />
            </div>

            {/* OTP */}
            <div className="bjd-field">
              <label
                style={{
                  display: "block",
                  marginBottom: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  fontSize: "14px",
                }}
              >
                Enter Verification Code
              </label>

              <div className="d-flex justify-content-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="otp-box"
                    autoComplete="off"
                  />
                ))}
              </div>

              <p
                className="mt-3 text-center"
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginBottom: 0,
                }}
              >
                Enter the 6-digit OTP sent to your email
              </p>
            </div>

            {/* BUTTON */}
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
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Verify OTP
                </>
              )}
            </button>

            {/* BACK */}
            <div className="mt-24 text-center">
              <Link
                href="/login"
                className="d-inline-flex align-items-center gap-2 fw-semibold"
                style={{
                  color: "#16a34a",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default VerifyOtpLayer;
