let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler : () => void){
  onUnauthorized = handler;
}

export async function http<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`http://localhost:8080${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? {Authorization: `Bearer ${authToken}`}: {}),
      ...(options.headers || {}),
    },
  });

  if(res.status === 401) {
    onUnauthorized?.(); 
    throw new Error("Unauthorized");
  }

  if(!res.ok){
    const error = await res.json().catch(() => ({
      message: "Unexpected Error",
    }));
    throw error;
  }
  return res.json();
}