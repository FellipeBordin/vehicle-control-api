import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/httpResponse";

import { createVehicle, getVehiclesByUserId } from "@/services/vehicleService";

import { isUniqueConstraintError } from "@/utils/prismaError";
import { validateCreateVehicle } from "@/validators/vehicleValidator";

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
    const vehicles = await getVehiclesByUserId(auth.userId);

    return NextResponse.json(vehicles, {
      headers: corsHeaders,
    });
  } catch {
    return errorResponse("Falha ao buscar veículos.", 500);
  }
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

  const validation = validateCreateVehicle(body);

  if (!validation.success) {
    return errorResponse(validation.error, 400);
  }

  try {
    const created = await createVehicle({
      ...validation.data,
      userId: auth.userId,
    });

    return NextResponse.json(created, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return errorResponse("Já existe um veículo com essa placa.", 409);
    }

    return errorResponse("Falha ao criar veículo.", 500);
  }
}
