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

export function validateCreateVehicle(
  body: CreateVehicleBody | null,
): ValidationResult {
  const name = body?.name?.toString().trim();
  const plate = body?.plate?.toString().trim().toUpperCase();
  const purchasePrice = Number(body?.purchasePrice);

  const previousOwnerName =
    body?.previousOwnerName == null || body.previousOwnerName === ""
      ? null
      : body.previousOwnerName.toString().trim();

  const previousOwnerPhone =
    body?.previousOwnerPhone == null || body.previousOwnerPhone === ""
      ? null
      : normalizePhone(body.previousOwnerPhone.toString());

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

  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
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
