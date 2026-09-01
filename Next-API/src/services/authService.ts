import { hashPassword, signAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RegisterUserData = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(data: RegisterUserData) {
  const existing = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    return {
      success: false as const,
      reason: "EMAIL_ALREADY_EXISTS" as const,
    };
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const token = signAuthToken({
    userId: user.id,
    email: user.email,
  });

  return {
    success: true as const,
    data: {
      token,
      user,
    },
  };
}
