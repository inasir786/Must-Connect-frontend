import { createFileRoute, Link, Outlet, useChildMatches, useSearch } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  getBatchContacts,
  getConversationHistory,
  type BatchContact,
  type HistoryMessage,
} from "@/api/chats";

export const Route = createFileRoute("/chats")({
  validateSearch: (search: Record<string, unknown>) => ({
    phone: (search.phone as string) ?? null,
  }),
  head: () => ({
    meta: [
      { title: "Chats — MUST Connect" },
      { name: "description", content: "Monitor student conversations." },
    ],
  }),
  component: ChatsRoot,
});

// ─── Root — decides whether to show child route or the chat UI ────────────────

function ChatsRoot() {
  const childMatches = useChildMatches();

  // If we're on /chats/highly-engaged or /chats/fee-inquiry, render that page
  if (childMatches.length > 0) {
    return <Outlet />;
  }

  // Otherwise render the normal chats UI
  return <ChatsPage />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

function formatMsgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ChatsPage() {
  const { phone: phoneParam } = useSearch({ from: "/chats" });
  const [search, setSearch] = useState("");

  // contacts list
  const [contacts, setContacts] = useState<BatchContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState<string | null>(null);

  // active conversation
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<HistoryMessage[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [msgsError, setMsgsError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Fetch contacts on mount ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setContactsLoading(true);
    setContactsError(null);

    getBatchContacts()
      .then((res) => {
        if (!cancelled) setContacts(res.items);
      })
      .catch((err: Error) => {
        if (!cancelled) setContactsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setContactsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Auto-select contact from navigation (e.g. from highly-engaged page) ──
  useEffect(() => {
    if (phoneParam && contacts.length > 0) {
      const normalised = phoneParam.replace(/^\+/, "");
      const match = contacts.find(
        (c) => c.phone_number.replace(/^\+/, "") === normalised
      );
      if (match) setActivePhone(match.phone_number);
    }
  }, [phoneParam, contacts]);

  // ── Fetch history whenever active contact changes ────────────────────────
  useEffect(() => {
    if (!activePhone) return;

    let cancelled = false;
    setMsgsLoading(true);
    setMsgsError(null);
    setMessages([]);
    setNextCursor(null);
    setHasMore(false);

    getConversationHistory(activePhone)
      .then((res) => {
        if (!cancelled) {
          setMessages(res.messages);
          setNextCursor(res.next_cursor);
          setHasMore(res.has_more);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setMsgsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setMsgsLoading(false);
      });

    return () => { cancelled = true; };
  }, [activePhone]);

  // ── Scroll to bottom on new messages ────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Load older messages ──────────────────────────────────────────────────
  async function loadMore() {
    if (!activePhone || !hasMore || nextCursor === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getConversationHistory(activePhone, nextCursor);
      setMessages((prev) => [...res.messages, ...prev]);
      setNextCursor(res.next_cursor);
      setHasMore(res.has_more);
    } catch {
      // silently ignore
    } finally {
      setLoadingMore(false);
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeContact = contacts.find((c) => c.phone_number === activePhone);

const filteredContacts = contacts.filter((c) =>
  c.last_message &&
  (c.name.toLowerCase().includes(search.toLowerCase()) ||
  c.phone_number.includes(search))
);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout
      header={
        <div className="flex w-full items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
            <p className="text-sm text-muted-foreground">
              Monitor student conversations
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Link
              to="/chats/highly-engaged"
              className="rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Highly Engaged
            </Link>
            <Link
              to="/chats/fee-inquiry"
              className="rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Fee Inquiry
            </Link>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-7xl overflow-hidden rounded-xl border border-border bg-card">
        {/* ── Conversation list ─────────────────────────────────────────── */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border">
          <div className="border-b border-border p-4">
            <h1 className="text-xl font-bold tracking-tight">Chats</h1>
            <p className="text-xs text-muted-foreground">
              Monitor student conversations
            </p>
          </div>

          <div className="space-y-3 border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>

          <div className="flex-1 overflow-y-auto">
            {contactsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {contactsError && (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-xs text-destructive">{contactsError}</p>
              </div>
            )}

            {!contactsLoading &&
              !contactsError &&
              filteredContacts.map((c) => {
                const isActive = c.phone_number === activePhone;
                const initials = c.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <button
                    key={c.phone_number}
                    onClick={() => setActivePhone(c.phone_number)}
                    className={`flex w-full gap-3 border-b border-border p-3 text-left transition-colors ${
                      isActive ? "bg-primary/5" : "hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {c.name}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatTime(c.last_message_at)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.last_message
                          ? `${c.last_message.direction === "outbound" ? "You: " : ""}${c.last_message.text}`
                          : "No messages yet"}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded bg-chart-3/15 px-1.5 py-0.5 text-[10px] font-medium text-chart-3">
                          WhatsApp
                        </span>
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                          {c.phone_number}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

            {!contactsLoading &&
              !contactsError &&
              filteredContacts.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No conversations found.
                </p>
              )}
          </div>
        </div>

        {/* ── Chat panel ───────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col bg-muted/30">
          {activeContact ? (
            <>
              <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {activeContact.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {activeContact.name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {activeContact.phone_number}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {hasMore && (
                  <div className="mb-4 flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      {loadingMore && <Loader2 className="h-3 w-3 animate-spin" />}
                      Load older messages
                    </button>
                  </div>
                )}

                {msgsLoading && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {msgsError && (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="text-sm text-destructive">{msgsError}</p>
                  </div>
                )}

                {!msgsLoading &&
                  !msgsError &&
                  messages.map((m) => {
                    const mine = m.direction === "outbound";
                    return (
                      <div
                        key={m.id}
                        className={`mb-4 flex gap-2 ${mine ? "justify-end" : "justify-start"}`}
                      >
                        {!mine && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                            {activeContact.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`max-w-md ${mine ? "items-end" : "items-start"} flex flex-col`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm ${
                              mine
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-card text-foreground"
                            }`}
                          >
                            {m.type === "voice" ? (
                              <span className="flex items-center gap-1.5 italic opacity-70">
                                🎤 Voice message
                              </span>
                            ) : (
                              m.text
                            )}
                          </div>
                          <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                            {formatMsgTime(m.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {!msgsLoading && !msgsError && messages.length === 0 && (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No messages in this conversation yet.
                  </p>
                )}

                <div ref={bottomRef} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No conversation selected</p>
              <p className="text-xs text-muted-foreground">
                Choose a contact from the list to view messages
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}