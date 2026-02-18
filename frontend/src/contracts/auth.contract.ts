export type AuthUser = {
    id: number;
    email: string;
    username: string;
    role: string;
};

export type LoginRequest = {
    email: string;
    password: string;
}

export type RegisterRequest = {
    email: string;
    password: string;
}

export type LoginResponse = {
    token: string;
    user: AuthUser;
}

export type RegisterResponse = {
    token: string;
    user: AuthUser;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_ALREADY_EXISTS"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR";

export type AuthErrorResponse = {
  message: string;
  code: AuthErrorCode;
};