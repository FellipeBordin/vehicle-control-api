import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/httpResponse";

import {
  deleteExpenseById,
  getExpenseById,
  updateExpense,
} from "@/services/expenseService";

import { validateUpdateExpense } from "@/validators/expenseValidator";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = getAuthUser(req);

  if (!auth) {
    return errorResponse("Não autorizado.", 401);
  }

  const { id } = await context.params;

  try {
    const expense = await getExpenseById(id, auth.userId);

    if (!expense) {
      return errorResponse("Despesa não encontrada.", 404);
    }

    return NextResponse.json(expense, {
      headers: corsHeaders,
    });
  } catch {
    return errorResponse("Falha ao buscar despesa.", 500);
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = getAuthUser(req);

  if (!auth) {
    return errorResponse("Não autorizado.", 401);
  }

  const { id } = await context.params;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return errorResponse("JSON inválido.", 400);
  }

  const validation = validateUpdateExpense(body);

  if (!validation.success) {
    return errorResponse(validation.error, 400);
  }

  try {
    const result = await updateExpense({
      id,
      userId: auth.userId,
      ...validation.data,
    });

    if (!result.success) {
      return errorResponse("Despesa não encontrada.", 404);
    }

    return NextResponse.json(result.data, {
      headers: corsHeaders,
    });
  } catch {
    return errorResponse("Falha ao atualizar despesa.", 500);
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = getAuthUser(req);

  if (!auth) {
    return errorResponse("Não autorizado.", 401);
  }

  const { id } = await context.params;

  try {
    const result = await deleteExpenseById(id, auth.userId);

    if (!result.success) {
      return errorResponse("Despesa não encontrada.", 404);
    }

    return NextResponse.json(
      { success: true },
      {
        headers: corsHeaders,
      },
    );
  } catch {
    return errorResponse("Falha ao excluir despesa.", 500);
  }
}
