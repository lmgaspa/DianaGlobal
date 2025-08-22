import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ message: text || "Failed to send reset link." }, { status: res.status });
  }

  // backend retorna 204; aqui devolvemos 200 p/ o client
  return NextResponse.json({ ok: true });
}
