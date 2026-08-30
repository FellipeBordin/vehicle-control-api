type CreateVehicleBody = {
  name?: unknown;
  plate?: unknown;
  purchasePrice?: unknown;
  previousOwnerName?: unknown;
  previousOwnerPhone?: unknown;
};

type ValidCreateVehicleData = {
  name: string;
  plate: string;
  purchasePrice: number;
  previousOwnerName: string | null;
  previousOwnerPhone: string | null;
};

type ValidationSuccess = {
  success: true;
  data: ValidCreateVehicleData;
};

type ValidationError = {
  success: false;
  error: string;
};

type ValidationResult = ValidationSuccess | ValidationError;

function isValidPlate(plate: string): boolean {
  const oldPattern = /^[A-Z]{3}\d{4}$/;
  const mercosulPattern = /^[A-Z]{3}\d[A-Z]\d{2}$/;

  return oldPattern.test(plate) || mercosulPattern.test(plate);
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function isValidPhone(phone: string): boolean {
  return /^\d{10,11}$/.test(phone);
}

export function validateCreateVehicle(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return {
      success: false,
      error: "Dados inválidos.",
    };
  }

  const data = body as CreateVehicleBody;

  const name = typeof data.name === "string" ? data.name.trim() : "";

  const plate =
    typeof data.plate === "string" ? data.plate.trim().toUpperCase() : "";

  const rawPurchasePrice = data.purchasePrice;

  const purchasePrice =
    typeof rawPurchasePrice === "number"
      ? rawPurchasePrice
      : typeof rawPurchasePrice === "string" && rawPurchasePrice.trim() !== ""
        ? Number(rawPurchasePrice)
        : NaN;

  const previousOwnerName =
    typeof data.previousOwnerName === "string" &&
    data.previousOwnerName.trim() !== ""
      ? data.previousOwnerName.trim()
      : null;

  const previousOwnerPhone =
    typeof data.previousOwnerPhone === "string" &&
    data.previousOwnerPhone.trim() !== ""
      ? normalizePhone(data.previousOwnerPhone)
      : null;
  if (!name) {
    return {
      success: false,
      error: "Nome do veículo é obrigatório.",
    };
  }

  if (!plate || !isValidPlate(plate)) {
    return {
      success: false,
      error: "Placa inválida.",
    };
  }

  if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
    return {
      success: false,
      error: "Preço de compra inválido.",
    };
  }

  if (previousOwnerPhone && !isValidPhone(previousOwnerPhone)) {
    return {
      success: false,
      error: "Telefone do antigo proprietário inválido.",
    };
  }

  return {
    success: true,
    data: {
      name,
      plate,
      purchasePrice,
      previousOwnerName,
      previousOwnerPhone,
    },
  };
}
