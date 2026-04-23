import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/chats")({
  head: () => ({
    meta: [
      { title: "Chats — MUST Connect" },
      { name: "description", content: "Monitor student conversations." },
    ],
  }),
  component: ChatsPage,
});

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  channel: string;
  tag: string;
  active?: boolean;
  online?: boolean;
};

const conversations: Conversation[] = [
  { id: "1", name: "Sarah Ahmed", avatar: "https://i.pravatar.cc/80?img=47", preview: "Thank you for the information about the a...", time: "2m ago", channel: "WhatsApp", tag: "Spring 2024 Batch", active: true, online: true },
  { id: "2", name: "Ali Hassan", avatar: "https://i.pravatar.cc/80?img=12", preview: "Can you provide more details about the C...", time: "15m ago", channel: "WhatsApp", tag: "Engineering Campaign" },
  { id: "3", name: "Fatima Khan", avatar: "https://i.pravatar.cc/80?img=45", preview: "What are the scholarship opportunities av...", time: "1h ago", channel: "WhatsApp", tag: "Scholarship Outreach" },
  { id: "4", name: "Ahmed Raza", avatar: "https://i.pravatar.cc/80?img=15", preview: "Is the campus hostel facility available for s...", time: "3h ago", channel: "WhatsApp", tag: "Fall 2024 Batch" },
  { id: "5", name: "Ayesha Malik", avatar: "https://i.pravatar.cc/80?img=44", preview: "When does the admission process start?", time: "5h ago", channel: "WhatsApp", tag: "General Admissions" },
  { id: "6", name: "Bilal Tariq", avatar: "https://i.pravatar.cc/80?img=33", preview: "What documents are required for admissio...", time: "1d ago", channel: "WhatsApp", tag: "Spring 2024 Batch" },
];

type Message = {
  id: string;
  from: "them" | "me";
  text: string;
  time: string;
};

const messages: Message[] = [
  { id: "m1", from: "them", text: "Hi, I received your message about MUST admissions. Can you tell me more about the programs offered?", time: "10:32 AM" },
  { id: "m2", from: "me", text: "Hello Sarah! Thank you for your interest in MUST. We offer undergraduate and graduate programs in Engineering, Computer Science, Business Administration, and more. Which field are you interested in?", time: "10:35 AM" },
  { id: "m3", from: "them", text: "I'm interested in Computer Science. What are the admission requirements?", time: "10:38 AM" },
  { id: "m4", from: "me", text: "Great choice! For BS Computer Science, you need FSc Pre-Engineering or equivalent with minimum 60% marks. We also accept A-Levels. The admission test includes Mathematics and English sections.", time: "10:40 AM" },
  { id: "m5", from: "them", text: "What about the fee structure and scholarship opportunities?", time: "10:42 AM" },
  { id: "m6", from: "me", text: "The semester fee is approximately PKR 85,000. We offer merit-based scholarships covering 25% to 100% of tuition fees. Financial aid is also available for deserving students. Would you like me to send you the detailed fee structure and scholarship criteria?", time: "10:45 AM" },
  { id: "m7", from: "them", text: "Yes please! That would be very helpful.", time: "10:46 AM" },
];

function ChatsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [activeId, setActiveId] = useState("1");
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  return (
    <AdminLayout
      header={
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
          <p className="text-sm text-muted-foreground">Monitor student conversations</p>
        </div>
      }
    >
      <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-7xl overflow-hidden rounded-xl border border-border bg-card">
        {/* Conversation list */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border">
          <div className="border-b border-border p-4">
            <h1 className="text-xl font-bold tracking-tight">Chats</h1>
            <p className="text-xs text-muted-foreground">Monitor student conversations</p>
          </div>
          <div className="space-y-3 border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
            <div className="flex gap-1 text-xs font-medium">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-md px-2.5 py-1 ${filter === "all" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`rounded-md px-2.5 py-1 ${filter === "unread" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                Unread
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => {
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full gap-3 border-b border-border p-3 text-left transition-colors ${
                    isActive ? "bg-primary/5" : "hover:bg-muted/60"
                  }`}
                >
                  <img src={c.avatar} alt={c.name} className="h-10 w-10 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded bg-chart-3/15 px-1.5 py-0.5 text-[10px] font-medium text-chart-3">
                        {c.channel}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">{c.tag}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex flex-1 flex-col bg-muted/30">
          <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
            <img src={active.avatar} alt={active.name} className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-foreground">{active.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-chart-3" />
                Active now
              </p>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m) => {
              const mine = m.from === "me";
              return (
                <div key={m.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && <img src={active.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />}
                  <div className={`max-w-md ${mine ? "items-end" : "items-start"} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm ${
                        mine
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-foreground"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-muted-foreground">{m.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
