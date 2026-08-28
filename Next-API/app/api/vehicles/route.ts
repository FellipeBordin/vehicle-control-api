import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { getVehiclesByUserId } from "@/services/vehicleService";

type CreateVehicleBody = {
  name?: unknown;
  plate?: unknown;
  purchasePrice?: unknown;
  previousOwnerName?: unknown;
  previousOwnerPhone?: unknown;
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: Request) {
  const auth = getAuthUser(req);

  if (!auth) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401, headers: corsHeaders },
    );
  }

  const vehicles = await getVehiclesByUserId(auth.userId);

  return NextResponse.json(vehicles, {
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const auth = getAuthUser(req);

  if (!auth) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401, headers: corsHeaders },
    );
  }

  const body = (await req.json().catch(() => null)) as CreateVehicleBody | null;

  const name = body?.name?.toString().trim();
  const plate = body?.plate?.toString().trim().toUpperCase();
  const purchasePrice = Number(body?.purchasePrice);

  const previousOwnerName =
    body?.previousOwnerName == null || body?.previousOwnerName === ""
      ? null
      : body.previousOwnerName.toString().trim();

  const previousOwnerPhone =
    body?.previousOwnerPhone == null || body?.previousOwnerPhone === ""
      ? null
      : body.previousOwnerPhone.toString().trim();

  if (!name || !plate || !Number.isFinite(purchasePrice) || purchasePrice < 0) {
    return NextResponse.json(
      { error: "Dados inválidos. Envie name, plate e purchasePrice >= 0." },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const created = await prisma.vehicle.create({
      data: {
        name,
        plate,
        purchasePrice,
        purchaseDate: new Date(),
        previousOwnerName,
        previousOwnerPhone,
        userId: auth.userId,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json(created, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (err: unknown) {
    const error = err as { code?: string };

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um veículo com essa placa." },
        { status: 409, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      { error: "Falha ao criar veículo." },
      { status: 500, headers: corsHeaders },
    );
  }
}