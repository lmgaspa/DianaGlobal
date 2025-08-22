"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckEmailPage() {
  const router = useRouter();
  const [masked, setMasked] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const email = typeof router.query.email === "string" ? router.query.email : "";

    if (email) {
      const [user, domain] = email.split("@");
      const maskedUser = user.slice(0, 2) + "***";
      setMasked(`${maskedUser}@${domain}`);
    }
  }, [router.isReady, router.query.email]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Verifique seu e-mail
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Enviamos um link de redefinição de senha para o e-mail:
        </p>
        <p className="font-medium text-black dark:text-white mb-6">
          {masked || "seu e-mail"}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Caso não encontre, verifique sua caixa de spam ou lixo eletrônico.
        </p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Voltar para login
        </Link>
      </div>
    </main>
  );
}

//