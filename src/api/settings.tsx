import client from "./client";

export interface AdminProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  role: string | null;
}

export interface UpdateProfilePayload {
  full_name: string;
  phone: string;
  department: string;
  role: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const getProfile = async (): Promise<AdminProfile> => {
  const { data } = await client.get("/admin/profile");
  return data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<AdminProfile> => {
  const { data } = await client.put("/admin/profile", payload);
  return data;
};

export const updatePassword = async (payload: UpdatePasswordPayload) => {
  const { data } = await client.put("/admin/password", payload);
  return data;
};