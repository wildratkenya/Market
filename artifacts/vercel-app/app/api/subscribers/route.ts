import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, l) => l.toUpperCase()),
      v,
    ])
  );
}

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("subscribers").select("*").order("subscribed_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json((data || []).map(toCamelCase));
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await request.json();
    const snakeBody = Object.fromEntries(
      Object.entries(body).map(([k, v]) => [
        k.replace(/([A-Z])/g, "_$1").toLowerCase(),
        v,
      ])
    );
    if (!snakeBody.subscribed_at) {
      snakeBody.subscribed_at = new Date().toISOString();
    }
    const { data, error } = await serviceSupabase.from("subscribers").insert(snakeBody).select().single();
    if (error) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: 400 });
    }
    return NextResponse.json(toCamelCase(data), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}