"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "your email";
  const [user, domain] = email.split("@");
  if (!domain) return "your email";
  const visible = Math.min(2, user.length);
  const maskedUser = user.slice(0, visible) + "***";
  return `${maskedUser}@${domain}`;
}

export default function CheckEmailPage() {
  const router = useRouter();
  const email = typeof router.query.email === "string" ? router.query.email : "";
  const masked = useMemo(() => maskEmail(email), [email]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Check your email
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We sent a <strong>password reset link</strong> to:
        </p>
        <p className="font-medium text-black dark:text-white mb-6">
          {masked}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If you don’t see it, check your spam or junk folder.
        </p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
