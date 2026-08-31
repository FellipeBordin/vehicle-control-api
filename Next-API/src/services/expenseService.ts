import { prisma } from "@/lib/prisma";
import { moneyToNumber } from "@/utils/money";

type CreateExpenseData = {
  vehicleId: string;
  userId: string;
  amount: number;
  note: string | null;
};

export async function createExpense(data: CreateExpenseData) {
  const vehicleExists = await prisma.vehicle.findFirst({
    where: {
      id: data.vehicleId,
      userId: data.userId,
    },
    select: {
      id: true,
    },
  });

  if (!vehicleExists) {
    return {
      success: false as const,
      reason: "VEHICLE_NOT_FOUND" as const,
    };
  }

  const created = await prisma.expense.create({
    data: {
      vehicleId: data.vehicleId,
      amount: data.amount,
      note: data.note,
    },
    select: {
      id: true,
      vehicleId: true,
      amount: true,
      note: true,
      createdAt: true,
    },
  });

  return {
    success: true as const,
    data: {
      ...created,
      amount: moneyToNumber(created.amount),
    },
  };
}
