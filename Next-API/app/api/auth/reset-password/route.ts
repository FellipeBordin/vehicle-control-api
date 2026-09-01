import { NextResponse } from "next/server";

import { corsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/httpResponse";

import { resetUserPassword } from "@/services/authService";
import { validateResetPassword } from "@/validators/authValidator";

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

  const validation = validateResetPassword(body);

  if (!validation.success) {
    return errorResponse(validation.error, 400);
  }

  const { email, newPassword } = validation.data;

  try {
    const result = await resetUserPassword({
      email,
      newPassword,
    });

    if (!result.success) {
      return errorResponse("Usuário não encontrado.", 404);
    }

    return NextResponse.json(
      {
        message: "Senha resetada com sucesso.",
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch {
    return errorResponse("Falha ao resetar senha.", 500);
  }
}
