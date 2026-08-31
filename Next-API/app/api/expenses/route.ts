import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/httpResponse";

import { createExpense } from "@/services/expenseService";
import { validateCreateExpense } from "@/validators/expenseValidator";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const auth = getAuthUser(req);

  if (!auth) {
    return errorResponse("Não autorizado.", 401);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return errorResponse("JSON inválido.", 400);
  }

  const validation = validateCreateExpense(body);

  if (!validation.success) {
    return errorResponse(validation.error, 400);
  }

  try {
    const result = await createExpense({
      ...validation.data,
      userId: auth.userId,
    });

    if (!result.success) {
      return errorResponse("Veículo não encontrado.", 404);
    }

    return NextResponse.json(result.data, {
      status: 201,
      headers: corsHeaders,
    });
  } catch {
    return errorResponse("Falha ao criar despesa.", 500);
  }
}
