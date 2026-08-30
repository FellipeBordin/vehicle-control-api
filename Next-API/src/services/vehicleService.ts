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
