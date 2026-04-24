import client from "./client";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export type CampaignStatus = "draft" | "running" | "completed" | "paused";

export interface Campaign {
  id: number;
  name: string;
  description: string;
  batch_label: string;
  batch_count?: number;
  contacts: number;
  status: CampaignStatus;
  start_date: string | null;
  created_at: string;
}

export interface SendingNumber {
  id: number;
  label: string;
  phone: string;
  status: "active" | "inactive";
  assigned?: boolean;
}

export interface CampaignBatchOption {
  id: number;
  title: string;
  batch_name: string;
  education_year: string;
  total_contacts: number;
  valid_whatsapp_count: number;
}

export interface CampaignDetail extends Campaign {
  message_template: string;
  template_name: string;
  media_url?: string | null;
  media_caption?: string | null;
  progress: {
    sent: number;
    pending: number;
    total: number;
  };
  linked_batches: CampaignBatchOption[];
  sending_numbers: SendingNumber[];
}

export interface CreateCampaignPayload {
  name: string;
  description: string;
  batch_ids: number[];
  message_template: string;
  media_url?: string;
  sending_number_ids: number[];
}

// ─── Mock Data (used until backend endpoints exist) ──────────────────────────

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: "Spring 2026 Admissions",
    description: "Main enrollment campaign",
    batch_label: "Engineering Q1",
    batch_count: 2,
    contacts: 5000,
    status: "running",
    start_date: "2026-04-10",
    created_at: "2026-03-28T10:12:00Z",
  },
  {
    id: 2,
    name: "Business Studies Outreach",
    description: "MBA program promotion",
    batch_label: "Business Leads",
    contacts: 1890,
    status: "draft",
    start_date: null,
    created_at: "2026-03-25T09:00:00Z",
  },
  {
    id: 3,
    name: "Medical Sciences Prospects",
    description: "MBBS & Allied Health",
    batch_label: "Medical Prospects",
    contacts: 1580,
    status: "completed",
    start_date: "2026-04-05",
    created_at: "2026-03-15T14:22:00Z",
  },
  {
    id: 4,
    name: "CS Inquiries Follow-up",
    description: "Computer Science program",
    batch_label: "CS Inquiries",
    contacts: 3120,
    status: "completed",
    start_date: "2026-03-28",
    created_at: "2026-03-10T08:00:00Z",
  },
  {
    id: 5,
    name: "Law Faculty Awareness",
    description: "LLB program launch",
    batch_label: "Law Prospects",
    contacts: 980,
    status: "draft",
    start_date: null,
    created_at: "2026-03-08T11:00:00Z",
  },
  {
    id: 6,
    name: "Summer Programs 2026",
    description: "Short courses & certifications",
    batch_label: "Summer Leads",
    contacts: 2450,
    status: "completed",
    start_date: "2026-03-20",
    created_at: "2026-03-01T07:30:00Z",
  },
];

const MOCK_BATCH_OPTIONS: CampaignBatchOption[] = [
  { id: 1, title: "Main enrollment campaign", batch_name: "Faculty 1", education_year: "2026", total_contacts: 2300, valid_whatsapp_count: 2245 },
  { id: 2, title: "Engineering prospects", batch_name: "Engineering Q1", education_year: "2026", total_contacts: 2700, valid_whatsapp_count: 2655 },
  { id: 3, title: "Medical prospects", batch_name: "Medical Prospects", education_year: "2026", total_contacts: 1580, valid_whatsapp_count: 1492 },
  { id: 4, title: "CS inquiries follow-up", batch_name: "CS Inquiries", education_year: "2026", total_contacts: 3120, valid_whatsapp_count: 3050 },
];

const MOCK_SENDING_NUMBERS: SendingNumber[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  label: "+92 312 0021 0001".replace(/0001$/, String(1000 + i)),
  phone: "+92 312 0021 0001".replace(/0001$/, String(1000 + i)),
  status: i < 6 ? "active" : "inactive",
  assigned: false,
}));

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ─── API Functions ────────────────────────────────────────────────────────────
// NOTE: These attempt the live API first and fall back to local mock data
// so the screens still function without a backend wired up.

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const { data } = await client.get<{ items: Campaign[] } | Campaign[]>("/campaigns");
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).items)) return (data as any).items;
    return MOCK_CAMPAIGNS;
  } catch {
    return delay(MOCK_CAMPAIGNS);
  }
};

export const getCampaign = async (id: number): Promise<CampaignDetail> => {
  try {
    const { data } = await client.get<CampaignDetail>(`/campaigns/${id}`);
    return data;
  } catch {
    const base = MOCK_CAMPAIGNS.find((c) => c.id === id) ?? MOCK_CAMPAIGNS[0];
    const sent = base.status === "completed" ? base.contacts : Math.floor(base.contacts * 0.55);
    return delay({
      ...base,
      message_template:
        "Hi {{name}}, applications for the Spring 2026 admissions are now open at MUST University. Reply YES to learn more or visit our campus.",
      template_name: "spring_admissions_v1",
      media_url: null,
      media_caption: "MUST University Campus",
      progress: {
        sent,
        pending: Math.max(0, base.contacts - sent),
        total: base.contacts,
      },
      linked_batches: MOCK_BATCH_OPTIONS.slice(0, 2),
      sending_numbers: MOCK_SENDING_NUMBERS.slice(0, 4).map((n) => ({ ...n, assigned: true })),
    });
  }
};

export const getCampaignBatchOptions = async (): Promise<CampaignBatchOption[]> => {
  try {
    const { data } = await client.get<{ items: CampaignBatchOption[] } | CampaignBatchOption[]>("/campaigns/batches");
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).items)) return (data as any).items;
    return MOCK_BATCH_OPTIONS;
  } catch {
    return delay(MOCK_BATCH_OPTIONS);
  }
};

export const getSendingNumbers = async (): Promise<SendingNumber[]> => {
  try {
    const { data } = await client.get<SendingNumber[]>("/sending-numbers");
    return data;
  } catch {
    return delay(MOCK_SENDING_NUMBERS);
  }
};

export const createCampaign = async (payload: CreateCampaignPayload): Promise<Campaign> => {
  try {
    const { data } = await client.post<Campaign>("/campaigns", payload);
    return data;
  } catch {
    return delay({
      id: Date.now(),
      name: payload.name,
      description: payload.description,
      batch_label: "New Campaign",
      batch_count: payload.batch_ids.length,
      contacts: 0,
      status: "draft" as CampaignStatus,
      start_date: null,
      created_at: new Date().toISOString(),
    });
  }
};