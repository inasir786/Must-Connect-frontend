import client from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaCategory {
  id: number;
  title: string;
  icon: string;
  asset_count: number;
}

export interface CreateMediaCategoryPayload {
  title: string;
  icon: string;
}

export interface UpdateMediaCategoryPayload {
  title: string;
  icon: string;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** GET /media/categories — fetch all media categories */
export const getMediaCategories = async (): Promise<MediaCategory[]> => {
  const { data } = await client.get("/media/categories");
  return data;
};

/** POST /media/categories — create a new media category */
export const createMediaCategory = async (
  payload: CreateMediaCategoryPayload
): Promise<MediaCategory> => {
  const { data } = await client.post("/media/categories", payload);
  return data;
};

/** PUT /media/categories/:id — update a media category */
export const updateMediaCategory = async (
  id: number,
  payload: UpdateMediaCategoryPayload
): Promise<MediaCategory> => {
  const { data } = await client.put(`/media/categories/${id}`, payload);
  return data;
};

/** DELETE /media/categories/:id — delete a media category */
export const deleteMediaCategory = async (id: number): Promise<void> => {
  await client.delete(`/media/categories/${id}`);
};