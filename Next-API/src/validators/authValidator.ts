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

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

type ValidLoginData = {
  email: string;
  password: string;
};

type LoginValidationSuccess = {
  success: true;
  data: ValidLoginData;
};

type LoginValidationError = {
  success: false;
  error: string;
};

type LoginValidationResult = LoginValidationSuccess | LoginValidationError;

type ResetPasswordBody = {
  token?: unknown;
  newPassword?: unknown;
};

type ValidResetPasswordData = {
  token: string;
  newPassword: string;
};

type ResetPasswordValidationSuccess = {
  success: true;
  data: ValidResetPasswordData;
};

type ResetPasswordValidationError = {
  success: false;
  error: string;
};

type ResetPasswordValidationResult =
  | ResetPasswordValidationSuccess
  | ResetPasswordValidationError;

type ForgotPasswordBody = {
  email?: unknown;
};

type ValidForgotPasswordData = {
  email: string;
};

type ForgotPasswordValidationSuccess = {
  success: true;
  data: ValidForgotPasswordData;
};

type ForgotPasswordValidationError = {
  success: false;
  error: string;
};

type ForgotPasswordValidationResult =
  | ForgotPasswordValidationSuccess
  | ForgotPasswordValidationError;

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

export function validateLogin(body: unknown): LoginValidationResult {
  if (typeof body !== "object" || body === null) {
    return {
      success: false,
      error: "Dados inválidos.",
    };
  }

  const data = body as LoginBody;

  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";

  const password = typeof data.password === "string" ? data.password : "";

  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      error: "E-mail inválido.",
    };
  }

  if (!password) {
    return {
      success: false,
      error: "Senha é obrigatória.",
    };
  }

  return {
    success: true,
    data: {
      email,
      password,
    },
  };
}

export function validateResetPassword(
  body: unknown,
): ResetPasswordValidationResult {
  if (typeof body !== "object" || body === null) {
    return {
      success: false,
      error: "Dados inválidos.",
    };
  }

  const data = body as ResetPasswordBody;

  const token = typeof data.token === "string" ? data.token.trim() : "";

  const newPassword =
    typeof data.newPassword === "string" ? data.newPassword : "";

  if (!token) {
    return {
      success: false,
      error: "Token de recuperação é obrigatório.",
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      error: "A senha deve ter pelo menos 6 caracteres.",
    };
  }

  return {
    success: true,
    data: {
      token,
      newPassword,
    },
  };
}
export function validateForgotPassword(
  body: unknown,
): ForgotPasswordValidationResult {
  if (typeof body !== "object" || body === null) {
    return {
      success: false,
      error: "Dados inválidos.",
    };
  }

  const data = body as ForgotPasswordBody;

  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";

  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      error: "E-mail inválido.",
    };
  }

  return {
    success: true,
    data: {
      email,
    },
  };
}
