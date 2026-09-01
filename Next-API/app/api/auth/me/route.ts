import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/httpResponse";

import { getUserById } from "@/services/authService";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: Request) {
  const auth = getAuthUser(req);

  if (!auth) {
    return errorResponse("Não autorizado.", 401);
  }

  try {
    const user = await getUserById(auth.userId);

    if (!user) {
      return errorResponse("Usuário não encontrado.", 404);
    }

    return NextResponse.json(user, {
      headers: corsHeaders,
    });
  } catch {
    return errorResponse("Falha ao buscar usuário.", 500);
  }
}
