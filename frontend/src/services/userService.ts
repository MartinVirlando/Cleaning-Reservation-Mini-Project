import api from "../lib/api";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

function mapUser(raw: {
  id: number;
  username: string;
  email: string;
  role: string;
}): AuthUser {
  return {
    id: raw.id,
    name: raw.username, 
    email: raw.email,
    role: raw.role,
  };
}

export async function updateProfile(data: {
  username: string;
  email: string;
}) {
  const res = await api.put("/api/profile", data);
  return {
    token: res.data.token,
    user: mapUser(res.data.user),
  };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.put("/api/profile/password", data);
}