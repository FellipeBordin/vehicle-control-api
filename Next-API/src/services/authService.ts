import { comparePassword, hashPassword, signAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RegisterUserData = {
  name: string;
  email: string;
  password: string;
};

type LoginUserData = {
  email: string;
  password: string;
};

type ResetPasswordData = {
  email: string;
  newPassword: string;
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

export async function loginUser(data: LoginUserData) {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    return {
      success: false as const,
      reason: "INVALID_CREDENTIALS" as const,
    };
  }

  const validPassword = await comparePassword(data.password, user.passwordHash);

  if (!validPassword) {
    return {
      success: false as const,
      reason: "INVALID_CREDENTIALS" as const,
    };
  }

  const token = signAuthToken({
    userId: user.id,
    email: user.email,
  });

  return {
    success: true as const,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return user;
}

export async function resetUserPassword(data: ResetPasswordData) {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return {
      success: false as const,
      reason: "USER_NOT_FOUND" as const,
    };
  }

  const passwordHash = await hashPassword(data.newPassword);

  await prisma.user.update({
    where: {
      email: data.email,
    },
    data: {
      passwordHash,
    },
  });

  return {
    success: true as const,
  };
}
