type RegisterBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

type ValidRegisterData = {
  name: string;
  email: string;
  password: string;
};

type RegisterValidationSuccess = {
  success: true;
  data: ValidRegisterData;
};

type RegisterValidationError = {
  success: false;
  error: string;
};

type RegisterValidationResult =
  | RegisterValidationSuccess
  | RegisterValidationError;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegister(body: unknown): RegisterValidationResult {
  if (typeof body !== "object" || body === null) {
    return {
      success: false,
      error: "Dados inválidos.",
    };
  }

  const data = body as RegisterBody;

  const name = typeof data.name === "string" ? data.name.trim() : "";

  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";

  const password = typeof data.password === "string" ? data.password : "";

  if (!name) {
    return {
      success: false,
      error: "Nome é obrigatório.",
    };
  }

  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      error: "E-mail inválido.",
    };
  }

  if (password.length < 4) {
    return {
      success: false,
      error: "A senha deve ter pelo menos 4 caracteres.",
    };
  }

  return {
    success: true,
    data: {
      name,
      email,
      password,
    },
  };
}
