export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    email: string;
  };
};

export const login = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (
        payload.email === "admin@test.com" &&
        payload.password === "12345"
      ) {
        resolve({
          token: "fake-jwt-token",
          user: { email: payload.email },
        });
      } else {
        reject(new Error("Invalid email or password"));
      }
    }, 1000);
  });
};
