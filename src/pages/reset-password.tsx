"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const t = typeof router.query.token === "string" ? router.query.token : "";
    setToken(t);
  }, [router.isReady, router.query.token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (pwd.length < 8) {
      setPwdError("Password must be at least 8 characters long.");
      return;
    } else {
      setPwdError(null);
    }

    const res = await fetch(
      "https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: pwd }),
      }
    );

    if (res.ok) {
      setMsg({ type: "ok", text: "Password changed successfully. You can sign in now." });
      setTimeout(() => router.push("/login"), 1500);
    } else {
      const text = await res.text().catch(() => "");
      setMsg({ type: "err", text: text || "Invalid or expired link." });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Set a new password
        </h1>

        {!token ? (
          <p className="text-red-600 text-center">Missing token. Use the link from your email.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <input
                className="w-full p-2 border border-gray-300 rounded text-black pr-10"
                type={showPassword ? "text" : "password"}
                minLength={8}
                required
                placeholder="New password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
              <span
                className="absolute right-3 top-3 text-gray-600 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {pwdError && (
                <p className="text-red-500 text-sm mt-1">{pwdError}</p>
              )}
            </div>
            <button
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              type="submit"
            >
              Save new password
            </button>
            {msg && (
              <p className={`text-sm text-center ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                {msg.text}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
