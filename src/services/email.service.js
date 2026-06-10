import { resend } from "@/lib/resend";

export const sendOtpEmail = async (
    email,
    otp
) => {
    await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your Login OTP",
        html: `
      <div style="font-family:Arial;padding:20px">
        
        <h2>Login Verification</h2>

        <p>Your OTP is:</p>

        <div
          style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          color:#16a34a;
          "
        >
          ${otp}
        </div>

        <p>
          This OTP will expire in 10 minutes.
        </p>

      </div>
    `,
    });
};