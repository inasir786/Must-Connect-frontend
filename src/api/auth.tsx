import client from "./client";
import Cookies from "js-cookie";

interface LoginPayload {
  email: string;
  password: string;
  remember_me: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
  admin_id: number;
  full_name: string;
  email: string;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await client.post<LoginResponse>("/auth/login", payload);

  const days = payload.remember_me ? data.expires_in_minutes / 60 / 24 : undefined;
  Cookies.set("access_token", data.access_token, {
    expires: days,
    sameSite: "lax",
  });

  return data;
};

export const logout = () => {
  Cookies.remove("access_token");
  window.location.href = "/admin/login";
};

export const getStoredToken = (): string | null => {
  return Cookies.get("access_token") ?? null;
};

export const resetPassword = async (payload: {
  new_password: string;
  confirm_password: string;
}) => {
  const { data } = await client.post("/auth/reset-password", payload);
  return data;
};