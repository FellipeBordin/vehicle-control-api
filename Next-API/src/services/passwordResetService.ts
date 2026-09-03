import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const RESET_TOKEN_EXPIRATION_MINUTES = 30;

export async function createPasswordResetToken(userId: string) {
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
    },
  });

  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000,
  );

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function validatePasswordResetToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
    },
  });

  if (!resetToken) {
    return {
      success: false as const,
      reason: "INVALID_TOKEN" as const,
    };
  }

  if (resetToken.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.delete({
      where: {
        id: resetToken.id,
      },
    });

    return {
      success: false as const,
      reason: "EXPIRED_TOKEN" as const,
    };
  }

  return {
    success: true as const,
    data: resetToken,
  };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
) {
  const validation = await validatePasswordResetToken(token);

  if (!validation.success) {
    return validation;
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: validation.data.userId,
      },
      data: {
        passwordHash,
      },
    }),

    prisma.passwordResetToken.delete({
      where: {
        id: validation.data.id,
      },
    }),
  ]);

  return {
    success: true as const,
  };
}
