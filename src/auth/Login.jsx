import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Login({ onSignup }) {
  const [loginMethod, setLoginMethod] = useState("password");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // EMAIL + PASSWORD LOGIN
  // =========================================================

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Login successful!");
  };


  // =========================================================
  // SEND SMS OTP
  // =========================================================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!phone) {
      setError("Please enter your mobile number.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: false,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setOtpSent(true);
    setMessage("OTP sent to your mobile number.");
  };


  // =========================================================
  // VERIFY SMS OTP
  // =========================================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Login successful!");
  };


  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Welcome to Neuronex
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login to continue
        </p>


        {/* =================================================
            LOGIN METHOD BUTTONS
        ================================================= */}

        <div className="flex mb-6 border rounded-lg overflow-hidden">

          <button
            type="button"
            onClick={() => {
              setLoginMethod("password");
              setError("");
              setMessage("");
              setOtpSent(false);
            }}
            className={`flex-1 py-3 font-semibold ${
              loginMethod === "password"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            Email
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod("phone");
              setError("");
              setMessage("");
            }}
            className={`flex-1 py-3 font-semibold ${
              loginMethod === "phone"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            Mobile OTP
          </button>

        </div>


        {/* =================================================
            EMAIL + PASSWORD
        ================================================= */}

        {loginMethod === "password" && (

          <form
            onSubmit={handleEmailLogin}
            className="space-y-4"
          >

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-blue-600
                text-white
                py-3
                rounded-lg
                font-semibold
                hover:bg-blue-700
                disabled:opacity-50
              "
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        )}


        {/* =================================================
            MOBILE OTP
        ================================================= */}

        {loginMethod === "phone" && (

          <div className="space-y-4">

            {!otpSent ? (

              <form
                onSubmit={handleSendOtp}
                className="space-y-4"
              >

                <input
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3"
                  required
                />

                <p className="text-xs text-gray-500">
                  Enter your number with country code.
                  Example: +919876543210
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    bg-blue-600
                    text-white
                    py-3
                    rounded-lg
                    font-semibold
                    hover:bg-blue-700
                    disabled:opacity-50
                  "
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>

              </form>

            ) : (

              <form
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >

                <input
                  type="tel"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  className="w-full border rounded-lg px-4 py-3 text-center tracking-widest"
                  maxLength={6}
                  inputMode="numeric"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    bg-blue-600
                    text-white
                    py-3
                    rounded-lg
                    font-semibold
                    hover:bg-blue-700
                    disabled:opacity-50
                  "
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setMessage("");
                    setError("");
                  }}
                  className="w-full text-blue-600 text-sm"
                >
                  Change mobile number
                </button>

              </form>

            )}

          </div>

        )}


        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <p className="text-red-500 text-sm mt-4">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 text-sm mt-4">
            {message}
          </p>
        )}


        {/* =================================================
            SIGNUP
        ================================================= */}

        <p className="text-center text-gray-500 mt-6">

          Don't have an account?{" "}

          <button
            type="button"
            onClick={onSignup}
            className="text-blue-600 font-semibold"
          >
            Sign Up
          </button>

        </p>

      </div>

    </div>
  );
}