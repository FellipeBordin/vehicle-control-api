import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/httpResponse";

import {
  deleteVehicleById,
  getVehicleById,
  sellVehicle,
} from "@/services/vehicleService";

import { validateSellVehicle } from "@/validators/vehicleValidator";

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
    const vehicle = await getVehicleById(id, auth.userId);

    if (!vehicle) {
      return errorResponse("Veículo não encontrado.", 404);
    }

    return NextResponse.json(vehicle, {
      headers: corsHeaders,
    });
  } catch {
    return errorResponse("Falha ao buscar veículo.", 500);
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

  const validation = validateSellVehicle(body);

  if (!validation.success) {
    return errorResponse(validation.error, 400);
  }

  try {
    const result = await sellVehicle({
      id,
      userId: auth.userId,
      ...validation.data,
    });

    if (!result.success) {
      if (result.reason === "NOT_FOUND") {
        return errorResponse("Veículo não encontrado.", 404);
      }

      if (result.reason === "ALREADY_SOLD") {
        return errorResponse(
          "Esse veículo já foi marcado como vendido.",
          400,
        );
      }
    }

    return NextResponse.json(result.data, {
      headers: corsHeaders,
    });
  } catch {
    return errorResponse(
      "Falha ao marcar veículo como vendido.",
      500,
    );
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
    const result = await deleteVehicleById(id, auth.userId);

    if (!result.success) {
      return errorResponse("Veículo não encontrado.", 404);
    }

    return NextResponse.json(
      { success: true },
      {
        headers: corsHeaders,
      },
    );
  } catch {
    return errorResponse("Falha ao excluir veículo.", 500);
  }
}
