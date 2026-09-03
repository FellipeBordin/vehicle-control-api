import { NextResponse } from "next/server";

import { corsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/httpResponse";

import { getUserByEmail } from "@/services/authService";
import { createPasswordResetToken } from "@/services/passwordResetService";
import { validateForgotPassword } from "@/validators/authValidator";

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

  const validation = validateForgotPassword(body);

  if (!validation.success) {
    return errorResponse(validation.error, 400);
  }

  const { email } = validation.data;

  try {
    const user = await getUserByEmail(email);

    if (user) {
      await createPasswordResetToken(user.id);
    }

    return NextResponse.json(
      {
        message:
          "Se existir uma conta com esse e-mail, enviaremos as instruções de recuperação.",
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch {
    return errorResponse("Falha ao processar recuperação de senha.", 500);
  }
}
