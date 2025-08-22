import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  const res = await fetch('https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/reset-password`', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ message: text || "Invalid or expired token." }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
