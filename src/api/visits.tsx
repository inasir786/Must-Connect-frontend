import client from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VisitStatus = "pending" | "done" | "missed";

export type Visit = {
  id: number;
  student_name: string;
  phone_number: string;
  visit_date: string;
  visit_time: string;
  status: VisitStatus;
};

export type VisitsMeta = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type VisitsResponse = {
  items: Visit[];
  meta: VisitsMeta;
};

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch paginated visits list.
 * GET /api/v1/visits
 */
export async function getVisits(
  page = 1,
  perPage = 20
): Promise<VisitsResponse> {
  const { data } = await client.get<VisitsResponse>("/visits", {
    params: { page, per_page: perPage },
  });
  return {
    items: data?.items ?? [],
    meta: data?.meta ?? { total: 0, page: 1, per_page: perPage, total_pages: 1 },
  };
}

/**
 * Update a visit status.
 * PUT /api/v1/visits/{id}/status?status=done|missed
 */
export async function updateVisitStatus(
  id: number,
  status: "done" | "missed"
): Promise<Visit> {
  const { data } = await client.put<Visit>(`/visits/${id}/status`, null, {
    params: { status },
  });
  return data;
}