import client from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CampaignStatus = "draft" | "running" | "completed" | "paused";
export type CampaignActionStatus = "running" | "paused" | "completed" | "archived";

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
  status?: CampaignStatus;
  start_date: string | null;
  created_at: string;
}

export interface CampaignDetail extends Campaign {
  message_text: string;
  progress: {
    sent: number;
    pending: number;
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

export interface SendingNumber {
  id: number;
  label: string;
  phone: string;
  status: "active" | "inactive";
  assigned?: boolean;
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

// ─── PATCH /campaigns/:id/status (archive only) ───────────────────────────────

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

export const getSendingNumbers = async (): Promise<SendingNumber[]> => {
  const { data } = await client.get<SendingNumber[]>("/sending-numbers");
  if (Array.isArray(data)) return data;
  return [];
};