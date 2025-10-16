      "use client";

      import { useEffect, useState } from "react";
      import { useRouter } from "next/router";
      import axios from "axios";
      import Link from "next/link";

      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE ??
        "https://dianagloballoginregister-52599bd07634.herokuapp.com";

      export default function VerifyEmailPage() {
        const router = useRouter();
        const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");
        const [detail, setDetail] = useState<string>("");

        useEffect(() => {
          if (!router.isReady) return;

          const token = typeof router.query.token === "string" ? router.query.token : "";
          if (!token) {
            setStatus("fail");
            setDetail("Missing token.");
            return;
          }

          const confirm = async () => {
            try {
              // Ajuste ao método do backend — GET com ?token=... ou POST body { token }
              await axios.get(`${API_BASE}/api/auth/confirm`, { params: { token } });
              setStatus("ok");
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                err?.message ||
                "Confirmation failed.";
              setDetail(msg);
              setStatus("fail");
            }
          };

          confirm();
        }, [router.isReady, router.query.token]);

        if (status === "loading") {
          return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
              <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
                <h1 className="text-xl font-semibold text-black dark:text-white">Confirming your e-mail…</h1>
              </div>
            </main>
          );
        }

        return (
          <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
            <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
              {status === "ok" ? (
                <>
                  <h1 className="text-2xl font-semibold text-black dark:text-white mb-3">
                    Your e-mail was confirmed!
                  </h1>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    You can now sign in to your account.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Go to Login
                  </Link>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-black dark:text-white mb-3">
                    Confirmation failed
                  </h1>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {detail || "Invalid or expired token."}
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
                  >
                    Go to Login
                  </Link>
                </>
              )}
            </div>
          </main>
        );
      }
