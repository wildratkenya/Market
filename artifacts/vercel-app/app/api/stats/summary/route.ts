import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  const supabase = getSupabase();
  const { data: orders } = await supabase.from("orders").select("total_amount");
  const { count: subs } = await supabase.from("subscribers").select("*", { count: "exact", head: true });
  const { count: msgs } = await supabase.from("messages").select("*", { count: "exact", head: true });

  const revenue = (orders || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

  return NextResponse.json({
    totalOrders: orders?.length || 0,
    totalSubscribers: subs || 0,
    totalMessages: msgs || 0,
    totalRevenue: revenue
  });
}