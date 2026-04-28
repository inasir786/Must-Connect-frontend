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

// ─── Asset Types ──────────────────────────────────────────────────────────────

export type MediaAssetType = "image" | "video" | "link";

export interface MediaAsset {
  id: number;
  category_id: number;
  type: MediaAssetType;
  file_url: string | null;
  title: string;
  label: string;
  description: string;
  file_size: number | null;
  created_at: string;
}

export interface MediaAssetListResponse {
  items: MediaAsset[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// ─── Asset Endpoints ──────────────────────────────────────────────────────────

/** GET /media/assets?category_id=&page=&per_page= — paginated assets */
export const getMediaAssets = async (
  categoryId: number,
  page = 1,
  perPage = 10
): Promise<MediaAssetListResponse> => {
  const { data } = await client.get("/media/assets", {
    params: { category_id: categoryId, page, per_page: perPage },
  });
  return data;
};

/**
 * POST /media/assets — create a new asset.
 * Uses multipart/form-data so file uploads work.
 * For link type, pass file_url instead of file.
 */
export const createMediaAsset = async (
  payload: FormData
): Promise<MediaAsset> => {
  const { data } = await client.post("/media/assets", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/** DELETE /media/assets/:id — delete an asset */
export const deleteMediaAsset = async (id: number): Promise<void> => {
  await client.delete(`/media/assets/${id}`);
};