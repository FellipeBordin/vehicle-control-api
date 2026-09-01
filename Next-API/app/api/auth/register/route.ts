import { NextResponse } from "next/server";

import { corsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/httpResponse";

import { registerUser } from "@/services/authService";
import { validateRegister } from "@/validators/authValidator";

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

  const validation = validateRegister(body);

  if (!validation.success) {
    return errorResponse(validation.error, 400);
  }

  const { name, email, password } = validation.data;

  try {
    const result = await registerUser({
      name,
      email,
      password,
    });

    if (!result.success) {
      return errorResponse("Já existe uma conta com esse e-mail.", 409);
    }

    return NextResponse.json(result.data, {
      status: 201,
      headers: corsHeaders,
    });
  } catch {
    return errorResponse("Falha ao criar conta.", 500);
  }
}
