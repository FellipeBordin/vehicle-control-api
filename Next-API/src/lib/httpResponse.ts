import { NextResponse } from "next/server";

import { corsHeaders } from "@/lib/cors";

export function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: corsHeaders,
    },
  );
}
