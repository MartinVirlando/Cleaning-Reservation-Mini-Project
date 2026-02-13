import api from "../lib/api";
import type {
  LoginRequest,
  LoginResponse,
} from "../contracts/auth.contract";

export async function login(
  payload: LoginRequest
): Promise<LoginResponse> {
  const res = await api.post("/auth/login", payload);

  return res.data;
}
