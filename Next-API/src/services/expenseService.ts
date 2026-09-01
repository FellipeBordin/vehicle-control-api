import { prisma } from "@/lib/prisma";
import { moneyToNumber } from "@/utils/money";

type CreateExpenseData = {
  vehicleId: string;
  userId: string;
  amount: number;
  note: string | null;
};
type UpdateExpenseData = {
  id: string;
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

export async function getExpenseById(id: string, userId: string) {
  const expense = await prisma.expense.findFirst({
    where: {
      id,
      vehicle: {
        userId,
      },
    },
    select: {
      id: true,
      vehicleId: true,
      amount: true,
      note: true,
      createdAt: true,
    },
  });

  if (!expense) {
    return null;
  }

  return {
    ...expense,
    amount: moneyToNumber(expense.amount),
  };
}

export async function updateExpense(data: UpdateExpenseData) {
  const expense = await prisma.expense.findFirst({
    where: {
      id: data.id,
      vehicle: {
        userId: data.userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!expense) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  const updated = await prisma.expense.update({
    where: {
      id: data.id,
    },
    data: {
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
      ...updated,
      amount: moneyToNumber(updated.amount),
    },
  };
}

export async function deleteExpenseById(id: string, userId: string) {
  const expense = await prisma.expense.findFirst({
    where: {
      id,
      vehicle: {
        userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!expense) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  await prisma.expense.delete({
    where: {
      id,
    },
  });

  return {
    success: true as const,
  };
}
