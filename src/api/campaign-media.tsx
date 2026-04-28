import client from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CampaignMediaFileType = "pdf" | "image";

export interface CampaignMediaItem {
  id: number;
  title: string;
  file_url: string;
  file_type: CampaignMediaFileType;
  file_size: string | null;
  extracted_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignMediaListResponse {
  items: CampaignMediaItem[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface UploadCampaignMediaResponse {
  message: string;
}

export interface DeleteCampaignMediaResponse {
  message: string;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** GET /campaign-media/ — list all, optional file_type + search filters */
export const getCampaignMedia = async (params?: {
  file_type?: CampaignMediaFileType;
  search?: string;
}): Promise<CampaignMediaListResponse> => {
  const { data } = await client.get("/campaign-media/", { params });
  return data;
};

/** GET /campaign-media/:id — single asset */
export const getCampaignMediaById = async (
  id: number
): Promise<CampaignMediaItem> => {
  const { data } = await client.get(`/campaign-media/${id}`);
  return data;
};

/** POST /campaign-media/ — upload pdf or image (multipart/form-data) */
export const uploadCampaignMedia = async (
  payload: FormData
): Promise<UploadCampaignMediaResponse> => {
  const { data } = await client.post("/campaign-media/", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/** DELETE /campaign-media/:id — delete an asset */
export const deleteCampaignMedia = async (
  id: number
): Promise<DeleteCampaignMediaResponse> => {
  const { data } = await client.delete(`/campaign-media/${id}`);
  return data;
};

/**
 * Force-download a file by fetching it as a blob and triggering
 * a browser save dialog — prevents PDFs/images opening in a new tab.
 */
export const downloadCampaignMedia = async (
  url: string,
  filename: string
): Promise<void> => {
  const res = await fetch(url, { mode: "cors" });
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
};