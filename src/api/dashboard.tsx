import client from "./client";

export interface ActiveCampaign {
  id: number;
  name: string;
  status: string;
  description: string;
  progress: number;
  sent: number;
  pending: number;
  engagement: number;
}

export interface DashboardSummary {
  total_batches: number;
  engagement: number;
  university_visits: number;
}

export interface RecentBatch {
  id: number;
  name: string;
  upload_date: string;
  total_contacts: number;
  status: string;
}

export interface DashboardData {
  active_campaign: ActiveCampaign;
  summary: DashboardSummary;
  recent_batches: RecentBatch[];
}

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await client.get("/dashboard");
  return data;
};