import VerifyOtpLayer from "@/components/VerifyOtpLayer";

export const metadata = {
  title:
    "Verify OTP - WowDash NEXT JS - Admin Dashboard Multipurpose Bootstrap 5 Template",
  description:
    "Verify your email address with a one-time password (OTP) to complete the login process.",
};

const Page = () => {
  return (
    <>
      {/* VerifyOtpLayer */}
      <VerifyOtpLayer />
    </>
  );
};

export default Page;
