import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";
import { hasOwnerSession } from "@/lib/owner-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing appointment id" }, { status: 400 });
  }

  const { data, error } = await supabaseService
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select("id,status")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to cancel" }, { status: 500 });
  }

  return NextResponse.json({ appointment: data });
}
