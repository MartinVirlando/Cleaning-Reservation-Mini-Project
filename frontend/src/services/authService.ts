import type {
  LoginRequest,
  LoginResponse,
} from "../contracts/auth.contract";

export async function login(
  payload: LoginRequest
): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (
        payload.email === "admin@test.com" &&
        payload.password === "12345"
      ) {
        resolve({
          token: "fake-jwt-token",
          user: {
            id: "user-1",
            email: payload.email,
          },
        });
      } else {
        reject(new Error("INVALID_CREDENTIALS"));
      }
    }, 1000);
  });
}
