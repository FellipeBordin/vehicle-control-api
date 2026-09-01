import { NextResponse } from "next/server";

import { corsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/httpResponse";

import { loginUser } from "@/services/authService";
import { validateLogin } from "@/validators/authValidator";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return errorResponse("JSON inválido.", 400);
  }

  const validation = validateLogin(body);

  if (!validation.success) {
    return errorResponse(validation.error, 400);
  }

  const { email, password } = validation.data;

  try {
    const result = await loginUser({
      email,
      password,
    });

    if (!result.success) {
      return errorResponse("Usuário ou senha inválidos.", 401);
    }

    return NextResponse.json(result.data, {
      headers: corsHeaders,
    });
  } catch {
    return errorResponse("Falha ao fazer login.", 500);
  }
}
