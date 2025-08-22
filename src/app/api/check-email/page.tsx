"use client";
import { useSearchParams } from "next/navigation";

export default function CheckEmailPage() {
  const params = useSearchParams();
  const email = params?.get("email") ?? "";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-3">Check your email</h1>
        <p className="text-gray-600 dark:text-gray-300">
          We sent a password reset link to {email ? <strong>{email}</strong> : "your email"}.
          <br />Open the email and click the button to continue.
        </p>
      </div>
    </main>
  );
}
