import client from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FaqCategory {
  id: number;
  title: string;
  icon: string;
  faq_count: number;
}

export interface CreateCategoryPayload {
  title: string;
  icon: string;
}

export interface UpdateCategoryPayload {
  title: string;
  icon: string;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** GET /faqs/categories — fetch all FAQ categories */
export const getFaqCategories = async (): Promise<FaqCategory[]> => {
  const { data } = await client.get("/faqs/categories");
  return data;
};

/** POST /faqs/categories — create a new FAQ category */
export const createFaqCategory = async (
  payload: CreateCategoryPayload
): Promise<FaqCategory> => {
  const { data } = await client.post("/faqs/categories", payload);
  return data;
};

/** PUT /faqs/categories/:id — update an FAQ category by id */
export const updateFaqCategory = async (
  id: number,
  payload: UpdateCategoryPayload
): Promise<FaqCategory> => {
  const { data } = await client.put(`/faqs/categories/${id}`, payload);
  return data;
};

/** DELETE /faqs/categories/:id — delete an FAQ category by id */
export const deleteFaqCategory = async (id: number): Promise<void> => {
  await client.delete(`/faqs/categories/${id}`);
};

// ─── FAQ Item Types ───────────────────────────────────────────────────────────

export interface FaqItem {
  id: number;
  category_id: number;
  question: string;
  answer: string;
  created_at: string;
}

export interface FaqListMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface FaqListResponse {
  items: FaqItem[];
  meta: FaqListMeta;
}

export interface CreateFaqPayload {
  category_id: number;
  question: string;
  answer: string;
}

export interface UpdateFaqPayload {
  question: string;
  answer: string;
}

// ─── FAQ Item Endpoints ───────────────────────────────────────────────────────

/** GET /faqs/?category_id=&page=&per_page=&sort= — paginated FAQs for a category */
export const getFaqs = async (
  categoryId: number,
  page = 1,
  perPage = 10,
  sort: "newest" | "oldest" = "newest"
): Promise<FaqListResponse> => {
  const { data } = await client.get("/faqs/", {
    params: {
      category_id: categoryId,
      page,
      per_page: perPage,
      sort,
    },
  });
  return data;
};

/** POST /faqs — create a new FAQ */
export const createFaq = async (payload: CreateFaqPayload): Promise<FaqItem> => {
  const { data } = await client.post("/faqs", payload);
  return data;
};

/** PUT /faqs/:id — update an existing FAQ */
export const updateFaq = async (
  id: number,
  payload: UpdateFaqPayload
): Promise<FaqItem> => {
  const { data } = await client.put(`/faqs/${id}`, payload);
  return data;
};

/** DELETE /faqs/:id — delete an FAQ */
export const deleteFaq = async (id: number): Promise<void> => {
  await client.delete(`/faqs/${id}`);
};