import client from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CampaignStatus = "draft" | "running" | "completed" | "paused" | "archived";
export type CampaignActionStatus = "running" | "paused" | "completed" | "archived";

export interface MediaFile {
  id: number;
  file_name: string;
  file_type: string;   // e.g. "image/png", "video/mp4"
  file_size: number;   // bytes
  url: string;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  batch_id: number;
  batch_name: string;
  batch_count?: number;
  total_contacts: number;
  sent_count: number;
  pending_count: number;
  failed_count?: number;
  status?: CampaignStatus;
  start_date: string | null;
  created_at: string;
  media_files: MediaFile[];
}

export interface CampaignDetail extends Campaign {
  message_text: string;
  progress: {
    sent: number;
    pending: number;
    failed: number;
    total: number;
  };
}

export interface CreateCampaignPayload {
  name: string;
  description: string;
  batch_id: number;
  message_text: string;
}

export interface CreateCampaignResponse {
  message: string;
  id: number;
}

export interface RunningCampaignStatus {
  campaign_running: boolean;
  campaign_id: number | null;
  campaign_name: string | null;
}

// Matches actual API: GET /sending-numbers → { items: [...], total: N }
export interface SendingNumber {
  id: number;
  phone_number: string;
  connection_status: "connected" | "disconnected";
  availability_status: "active" | "inactive";
  assigned_contacts?: number;   // populated in launch modal
  created_at: string;
  updated_at: string;
}

export interface SendingNumbersResponse {
  items: SendingNumber[];
  total: number;
}

export interface Batch {
  id: number;
  title: string;
  batch_name: string;
  education_year: string;
  version: number;
  status: string;
  file_name: string;
  total_contacts: number;
  valid_whatsapp_count: number;
  invalid_count: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignProgress {
  sent: number;
  pending: number;
  failed: number;
  total: number;
}

// ─── GET /campaigns ───────────────────────────────────────────────────────────

export const getCampaigns = async (): Promise<Campaign[]> => {
  const { data } = await client.get<Campaign[] | { items: Campaign[] }>("/campaigns");
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).items)) return (data as any).items;
  return [];
};

// ─── GET /campaigns/:id ───────────────────────────────────────────────────────

export const getCampaign = async (id: number): Promise<CampaignDetail> => {
  const { data } = await client.get<CampaignDetail>(`/campaigns/${id}`);
  return data;
};

// ─── GET /campaigns/:id/progress ─────────────────────────────────────────────

export const getCampaignProgress = async (id: number): Promise<CampaignProgress> => {
  const { data } = await client.get<CampaignProgress>(`/campaigns/${id}/progress`);
  return data;
};

// ─── GET /campaigns/status/running ───────────────────────────────────────────

export const getRunningCampaign = async (): Promise<RunningCampaignStatus> => {
  try {
    const { data } = await client.get<RunningCampaignStatus>("/campaigns/status/running");
    return data;
  } catch {
    return { campaign_running: false, campaign_id: null, campaign_name: null };
  }
};

// ─── POST /campaigns ──────────────────────────────────────────────────────────

export const createCampaign = async (
  payload: CreateCampaignPayload
): Promise<CreateCampaignResponse> => {
  const { data } = await client.post<CreateCampaignResponse>("/campaigns", payload);
  return data;
};

// ─── POST /campaigns/:id/upload-media ────────────────────────────────────────
// field name = "files" (array), multipart/form-data
// max 5 files, 10 MB each, .png/.jpg/.jpeg/.mp4 only

export const uploadCampaignMedia = async (
  id: number,
  files: File[]
): Promise<void> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  await client.post(`/campaigns/${id}/upload-media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ─── DELETE /campaigns/:id/media/:media_id ────────────────────────────────────

export const deleteCampaignMedia = async (
  campaignId: number,
  mediaId: number
): Promise<void> => {
  await client.delete(`/campaigns/${campaignId}/media/${mediaId}`);
};

// ─── POST /campaigns/:id/launch ───────────────────────────────────────────────

export const launchCampaign = async (id: number): Promise<void> => {
  await client.post(`/campaigns/${id}/launch`);
};

// ─── POST /campaigns/:id/pause ────────────────────────────────────────────────

export const pauseCampaign = async (id: number): Promise<void> => {
  await client.post(`/campaigns/${id}/pause`);
};

// ─── POST /campaigns/:id/resume ───────────────────────────────────────────────

export const resumeCampaign = async (id: number): Promise<void> => {
  await client.post(`/campaigns/${id}/resume`);
};

// ─── POST /campaigns/:id/stop ─────────────────────────────────────────────────

export const stopCampaign = async (id: number): Promise<void> => {
  await client.post(`/campaigns/${id}/stop`);
};

// ─── DELETE /campaigns/:id ───────────────────────────────────────────────────

export const deleteCampaign = async (id: number): Promise<void> => {
  await client.delete(`/campaigns/${id}`);
};

// ─── PATCH /campaigns/:id/status ─────────────────────────────────────────────

export const updateCampaignStatus = async (
  id: number,
  status: CampaignActionStatus
): Promise<Campaign> => {
  const { data } = await client.patch<Campaign>(`/campaigns/${id}/status`, { status });
  return data;
};

// ─── GET /batches ─────────────────────────────────────────────────────────────

export const getBatches = async (): Promise<Batch[]> => {
  const { data } = await client.get<Batch[] | { items: Batch[] }>("/batches");
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).items)) return (data as any).items;
  return [];
};

// ─── GET /sending-numbers ─────────────────────────────────────────────────────
// Returns { items: SendingNumber[], total: number }

export const getSendingNumbers = async (): Promise<SendingNumber[]> => {
  const { data } = await client.get<SendingNumbersResponse | SendingNumber[]>(
    "/sending-numbers"
  );
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as SendingNumbersResponse).items))
    return (data as SendingNumbersResponse).items;
  return [];
};

// ─── GET /campaigns/:id/sending-numbers ──────────────────────────────────────
// Per-campaign sending number assignment (ask backend if not in detail response)

export const getCampaignSendingNumbers = async (
  id: number
): Promise<SendingNumber[]> => {
  try {
    const { data } = await client.get<SendingNumbersResponse | SendingNumber[]>(
      `/campaigns/${id}/sending-numbers`
    );
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as SendingNumbersResponse).items))
      return (data as SendingNumbersResponse).items;
    return [];
  } catch {
    return [];
  }
};