// src/api/chats.ts

import client from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LastMessage = {
  text: string;
  direction: "inbound" | "outbound";
  timestamp: string;
};

export type BatchContact = {
  name: string;
  phone_number: string;
  has_conversation: boolean;
  conversation_id: number | null;
  last_message: LastMessage | null;
  last_message_at: string | null;
};

export type BatchContactsMeta = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type BatchContactsResponse = {
  items: BatchContact[];
  meta: BatchContactsMeta;
};

export type HistoryMessage = {
  id: number;
  direction: "inbound" | "outbound";
  type: string;
  text: string;
  timestamp: string;
};

export type ConversationInfo = {
  id: number;
  student_name: string;
  student_phone: string;
  channel: string;
  is_read: boolean;
};

export type ConversationHistoryResponse = {
  conversation: ConversationInfo;
  messages: HistoryMessage[];
  next_cursor: number | null;
  has_more: boolean;
};

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch all batch contacts with their last conversation info.
 * GET /api/v1/conversations/batch-contacts
 */
export async function getBatchContacts(
  page = 1,
  perPage = 20
): Promise<BatchContactsResponse> {
  const { data } = await client.get<BatchContactsResponse>(
    "/conversations/batch-contacts",
    { params: { page, per_page: perPage } }
  );
  return {
    items: data?.items ?? [],
    meta: data?.meta ?? { total: 0, page: 1, per_page: perPage, total_pages: 1 },
  };
}

/**
 * Fetch paginated message history for a phone number.
 * GET /api/v1/conversations/history/{phone}?cursor=&limit=
 *
 * @param phone  Phone number — leading '+' is stripped automatically
 * @param cursor Last message id for cursor-based pagination (omit for first page)
 * @param limit  Number of messages to return (default 20)
 */
export async function getConversationHistory(
  phone: string,
  cursor?: number,
  limit = 20
): Promise<ConversationHistoryResponse> {
  const normalised = phone.replace(/^\+/, "");

  const { data } = await client.get<ConversationHistoryResponse>(
    `/conversations/history/${normalised}`,
    {
      params: {
        ...(cursor !== undefined ? { cursor } : {}),
        limit,
      },
    }
  );

  return {
    conversation: data?.conversation,
    messages: data?.messages ?? [],
    next_cursor: data?.next_cursor ?? null,
    has_more: data?.has_more ?? false,
  };
}

// ─── Engaged Students ─────────────────────────────────────────────────────────

export type EngagedStudentCampaign = {
  id: number;
  name: string;
};

export type EngagedStudent = {
  conversation_id: number;
  student_name: string;
  student_phone: string;
  reply_count: number;
  campaign: EngagedStudentCampaign;
  last_message_at: string;
};

export type EngagedStudentsResponse = {
  items: EngagedStudent[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
};

export type EngagedStudentsParams = {
  page?: number;
  per_page?: number;
  campaign_id?: number | null;
  date_from?: string | null;
  date_to?: string | null;
};

/**
 * Fetch highly engaged students.
 * GET /api/v1/conversations/engaged-students
 */
export async function getEngagedStudents(
  params: EngagedStudentsParams = {}
): Promise<EngagedStudentsResponse> {
  const { page = 1, per_page = 20, campaign_id, date_from, date_to } = params;

  const { data } = await client.get<EngagedStudentsResponse>(
    "/conversations/engaged-students",
    {
      params: {
        page,
        per_page,
        ...(campaign_id ? { campaign_id } : {}),
        ...(date_from ? { date_from } : {}),
        ...(date_to ? { date_to } : {}),
      },
    }
  );

  return {
    items: data?.items ?? [],
    meta: data?.meta ?? { total: 0, page: 1, per_page: 20, total_pages: 1 },
  };
}

// ─── Fee Inquiry Leads ────────────────────────────────────────────────────────

export type FeeInquiryLead = {
  conversation_id: number;
  student_name: string;
  phone_number: string;
  program_interest: string | null;
  campaign: {
    id: number;
    name: string;
  };
  first_inquiry_at: string;
  last_message_at: string;
};

export type FeeInquiryResponse = {
  items: FeeInquiryLead[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
};

/**
 * Fetch fee inquiry leads.
 * GET /api/v1/conversations/fee-inquiry-leads
 */
export async function getFeeInquiryLeads(
  params: { page?: number; per_page?: number } = {}
): Promise<FeeInquiryResponse> {
  const { page = 1, per_page = 200 } = params;
  const { data } = await client.get<FeeInquiryResponse>(
    "/conversations/fee-inquiry-leads",
    { params: { page, per_page } }
  );
  return {
    items: data?.items ?? [],
    meta: data?.meta ?? { total: 0, page: 1, per_page, total_pages: 1 },
  };
}