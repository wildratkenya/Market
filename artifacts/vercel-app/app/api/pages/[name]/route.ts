import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  const supabase = name ? getSupabase() : getServiceSupabase();
  if (name) {
    const { data, error } = await supabase.from("site_pages").select("*").eq("page_name", name).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toCamelCase(data));
  }
  const { data, error } = await supabase.from("site_pages").select("*").order("page_name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data || []).map(toCamelCase));
}

export async function PUT(request: NextRequest, { params }: { params: { name: string } }) {
  const supabase = getServiceSupabase();
  const name = params.name;
  const body = await request.json();
  const snakeBody = Object.fromEntries(
    Object.entries(body).map(([k, v]) => [
      k.replace(/([A-Z])/g, "_").toLowerCase(),
      v,
    ])
  );
  const { data: existing } = await supabase.from("site_pages").select("*").eq("page_name", name).maybeSingle();
  if (existing) {
    const { data, error } = await supabase.from("site_pages").update(snakeBody).eq("page_name", name).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(toCamelCase(data));
  }
  snakeBody.page_name = name;
  const { data, error } = await supabase.from("site_pages").insert(snakeBody).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(toCamelCase(data), { status: 201 });
}
