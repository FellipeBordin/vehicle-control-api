import { prisma } from "@/lib/prisma";
import { moneyToNumber } from "@/utils/money";

type CreateVehicleData = {
  name: string;
  plate: string;
  purchasePrice: number;
  previousOwnerName: string | null;
  previousOwnerPhone: string | null;
  userId: string;
};

export async function getVehiclesByUserId(userId: string) {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      expenses: {
        select: {
          amount: true,
        },
      },
    },
  });

  return vehicles.map((vehicle) => {
    const purchasePrice = moneyToNumber(vehicle.purchasePrice);

    const totalExpenses = vehicle.expenses.reduce(
      (total, expense) => total + moneyToNumber(expense.amount),
      0,
    );

    const totalInvested = purchasePrice + totalExpenses;

    const soldPrice =
      vehicle.soldPrice === null ? null : moneyToNumber(vehicle.soldPrice);

    const profit =
      soldPrice === null
        ? null
        : Number((soldPrice - totalInvested).toFixed(2));

    return {
      id: vehicle.id,
      name: vehicle.name,
      plate: vehicle.plate,
      status: vehicle.status,
      purchasePrice,
      totalExpenses: Number(totalExpenses.toFixed(2)),
      totalInvested: Number(totalInvested.toFixed(2)),
      soldPrice,
      profit,
      purchaseDate: vehicle.purchaseDate,
      soldDate: vehicle.soldDate,
      previousOwnerName: vehicle.previousOwnerName,
      previousOwnerPhone: vehicle.previousOwnerPhone,
      buyerName: vehicle.buyerName,
      buyerPhone: vehicle.buyerPhone,
      createdAt: vehicle.createdAt,
    };
  });
}

export async function createVehicle(data: CreateVehicleData) {
  return prisma.vehicle.create({
    data: {
      name: data.name,
      plate: data.plate,
      purchasePrice: data.purchasePrice,
      purchaseDate: new Date(),
      previousOwnerName: data.previousOwnerName,
      previousOwnerPhone: data.previousOwnerPhone,
      userId: data.userId,
    },
    select: {
      id: true,
    },
  });
}

export async function getVehicleById(
  id: string,
  userId: string,
) {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      expenses: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!vehicle) {
    return null;
  }

  const purchasePrice = moneyToNumber(vehicle.purchasePrice);

  const expenses = vehicle.expenses.map((expense) => ({
    id: expense.id,
    amount: moneyToNumber(expense.amount),
    note: expense.note,
    createdAt: expense.createdAt,
  }));

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const totalInvested = purchasePrice + totalExpenses;

  const soldPrice =
    vehicle.soldPrice === null
      ? null
      : moneyToNumber(vehicle.soldPrice);

  const profit =
    soldPrice === null
      ? null
      : Number((soldPrice - totalInvested).toFixed(2));

  return {
    id: vehicle.id,
    name: vehicle.name,
    plate: vehicle.plate,
    status: vehicle.status,
    purchasePrice,
    purchaseDate: vehicle.purchaseDate,
    previousOwnerName: vehicle.previousOwnerName,
    previousOwnerPhone: vehicle.previousOwnerPhone,
    soldPrice,
    soldDate: vehicle.soldDate,
    buyerName: vehicle.buyerName,
    buyerPhone: vehicle.buyerPhone,
    totalExpenses: Number(totalExpenses.toFixed(2)),
    totalInvested: Number(totalInvested.toFixed(2)),
    profit,
    createdAt: vehicle.createdAt,
    expenses,
  };
}

type SellVehicleData = {
  id: string;
  userId: string;
  soldPrice: number;
  buyerName: string | null;
  buyerPhone: string | null;
};

export async function sellVehicle(data: SellVehicleData) {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: data.id,
      userId: data.userId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!vehicle) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  if (vehicle.status === "SOLD") {
    return {
      success: false as const,
      reason: "ALREADY_SOLD" as const,
    };
  }

  const updated = await prisma.vehicle.update({
    where: {
      id: data.id,
    },
    data: {
      soldPrice: data.soldPrice,
      soldDate: new Date(),
      buyerName: data.buyerName,
      buyerPhone: data.buyerPhone,
      status: "SOLD",
    },
    select: {
      id: true,
      status: true,
      soldPrice: true,
      soldDate: true,
      buyerName: true,
      buyerPhone: true,
    },
  });

  return {
    success: true as const,
    data: {
      id: updated.id,
      status: updated.status,
      soldPrice:
        updated.soldPrice === null
          ? null
          : moneyToNumber(updated.soldPrice),
      soldDate: updated.soldDate,
      buyerName: updated.buyerName,
      buyerPhone: updated.buyerPhone,
    },
  };
}

export async function deleteVehicleById(
  id: string,
  userId: string,
) {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!vehicle) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  await prisma.vehicle.delete({
    where: {
      id,
    },
  });

  return {
    success: true as const,
  };
}
