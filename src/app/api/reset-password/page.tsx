"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params?.get("token") ?? "";
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<{type: "ok" | "err"; text: string} | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/confirm-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: pwd }),
    });
    if (res.ok) {
      setMsg({ type: "ok", text: "Password changed successfully. You can sign in now." });
      setTimeout(() => router.push("/login"), 1200);
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: data.message || "Invalid or expired link." });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">Set a new password</h1>
        {!token ? (
          <p className="text-red-600">Missing token. Use the link from your email.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input
              className="w-full border rounded p-2"
              type="password"
              minLength={10}
              required
              placeholder="New password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
            <button className="w-full rounded p-2 bg-blue-500 text-white hover:bg-blue-600" type="submit">
              Save new password
            </button>
            {msg && (
              <p className={`text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
