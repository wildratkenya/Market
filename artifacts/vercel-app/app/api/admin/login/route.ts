import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { login, password } = body;

  if (!login || !password) {
    return NextResponse.json({ error: "Login and password are required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const normalizedLogin = login.toLowerCase().trim();
  const { data: users, error } = await supabase
    .from("admin_users")
    .select("*")
    .or("email.eq." + normalizedLogin + ",username.eq." + normalizedLogin)
    .limit(1);

  if (error || !users || users.length === 0) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user = users[0];
  const SECRET = process.env.SESSION_SECRET ?? "dev-fallback-do-not-use-in-production";

  function verifyPassword(password: string, stored: string): boolean {
    const parts = stored.split(":");
    if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
    const [, salt, expectedHash] = parts;
    try {
      const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
      return crypto.timingSafeEqual(
        Buffer.from(derived, "hex"),
        Buffer.from(expectedHash, "hex")
      );
    } catch {
      return false;
    }
  }

  const isMatch = verifyPassword(password, user.password_hash);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const TOKEN_EXPIRY_SECONDS = 24 * 60 * 60;
  const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;
  const tokenData = Buffer.from(JSON.stringify({ uid: user.id, username: user.username, email: user.email, role: user.role, exp })).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(tokenData).digest("base64url");
  const token = tokenData + "." + sig;

  return NextResponse.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
}