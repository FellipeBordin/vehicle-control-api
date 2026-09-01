type CreateExpenseBody = {
  vehicleId?: unknown;
  amount?: unknown;
  note?: unknown;
};

type ValidCreateExpenseData = {
  vehicleId: string;
  amount: number;
  note: string | null;
};

type ValidationSuccess = {
  success: true;
  data: ValidCreateExpenseData;
};

type ValidationError = {
  success: false;
  error: string;
};

type ValidationResult = ValidationSuccess | ValidationError;

type UpdateExpenseBody = {
  amount?: unknown;
  note?: unknown;
};

type ValidUpdateExpenseData = {
  amount: number;
  note: string | null;
};

type UpdateValidationSuccess = {
  success: true;
  data: ValidUpdateExpenseData;
};

type UpdateValidationError = {
  success: false;
  error: string;
};

type UpdateValidationResult = UpdateValidationSuccess | UpdateValidationError;

export function validateCreateExpense(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return {
      success: false,
      error: "Dados inválidos.",
    };
  }

  const data = body as CreateExpenseBody;

  const vehicleId =
    typeof data.vehicleId === "string" ? data.vehicleId.trim() : "";

  const rawAmount = data.amount;

  const amount =
    typeof rawAmount === "number"
      ? rawAmount
      : typeof rawAmount === "string" && rawAmount.trim() !== ""
        ? Number(rawAmount)
        : NaN;

  const note =
    typeof data.note === "string" && data.note.trim() !== ""
      ? data.note.trim()
      : null;

  if (!vehicleId) {
    return {
      success: false,
      error: "vehicleId é obrigatório.",
    };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      success: false,
      error: "Valor da despesa inválido.",
    };
  }

  return {
    success: true,
    data: {
      vehicleId,
      amount,
      note,
    },
  };
}

export function validateUpdateExpense(body: unknown): UpdateValidationResult {
  if (typeof body !== "object" || body === null) {
    return {
      success: false,
      error: "Dados inválidos.",
    };
  }

  const data = body as UpdateExpenseBody;

  const rawAmount = data.amount;

  const amount =
    typeof rawAmount === "number"
      ? rawAmount
      : typeof rawAmount === "string" && rawAmount.trim() !== ""
        ? Number(rawAmount)
        : NaN;

  const note =
    typeof data.note === "string" && data.note.trim() !== ""
      ? data.note.trim()
      : null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      success: false,
      error: "Valor da despesa inválido.",
    };
  }

  return {
    success: true,
    data: {
      amount,
      note,
    },
  };
}
