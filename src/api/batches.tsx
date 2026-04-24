import client from "./client";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Batch {
  id: number;
  title: string;
  batch_name: string;
  education_year: string;
  version: number;
  status: "validated" | "processing" | "archived";
  file_name: string;
  total_contacts: number;
  valid_whatsapp_count: number;
  invalid_count: number;
  created_at: string;
  updated_at: string;
}

export interface BatchFile {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

export interface ActivityLog {
  id: number;
  action_type: string;
  description: string;
  created_at: string;
}

export interface BatchDetail extends Batch {
  batch_id: number;
  files: BatchFile[];
  activity_logs: ActivityLog[];
}

export interface BatchListMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface BatchListResponse {
  items: Batch[];
  meta: BatchListMeta;
}

export interface BatchListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export interface CreateBatchPayload {
  file: File;
  title: string;
  batch_name: string;
  education_year: string;
}

export interface UpgradeBatchPayload {
  title: string;
  batch_name: string;
  education_year: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getBatches = async (
  params: BatchListParams = {}
): Promise<BatchListResponse> => {
  const { data } = await client.get<BatchListResponse>("/batches", { params });
  return data;
};

export const getBatch = async (id: number): Promise<BatchDetail> => {
  const { data } = await client.get<BatchDetail>(`/batches/${id}`);
  return data;
};

export const createBatch = async (
  payload: CreateBatchPayload
): Promise<Batch> => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("title", payload.title);
  formData.append("batch_name", payload.batch_name);
  formData.append("education_year", payload.education_year);

  const { data } = await client.post<Batch>("/batches", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/** Toggles archive/unarchive — POST /batches/:id/archive */
export const toggleArchiveBatch = async (id: number): Promise<Batch> => {
  const { data } = await client.post<Batch>(`/batches/${id}/archive`);
  return data;
};

export const mergeBatch = async (id: number, file: File): Promise<Batch> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post<Batch>(`/batches/${id}/merge`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const upgradeBatch = async (
  id: number,
  payload: UpgradeBatchPayload
): Promise<Batch> => {
  const { data } = await client.post<Batch>(`/batches/${id}/upgrade`, payload);
  return data;
};